# Local variables for resource naming and configuration
locals {
  bucket_prefix = "storybook-${var.project_name}-${var.environment}"
  
  # Blue bucket name
  blue_bucket_name = "${local.bucket_prefix}-blue"
  
  # Green bucket name (only if blue/green enabled)
  green_bucket_name = var.enable_blue_green ? "${local.bucket_prefix}-green" : null
  
  # Active bucket based on switch variable
  active_bucket_name = var.active_environment == "green" && var.enable_blue_green ? local.green_bucket_name : local.blue_bucket_name
  
  # Custom domain configuration (treat empty string as null)
  has_custom_domain = var.custom_domain_name != null && var.custom_domain_name != ""
  
  # Route53 zone ID (treat empty string as null)
  route53_zone_id = var.route53_zone_id != null && var.route53_zone_id != "" ? var.route53_zone_id : null
  
  # Common bucket configuration
  common_bucket_config = {
    force_destroy = var.environment == "dev" ? true : false
  }
}

# S3 Bucket for BLUE environment
resource "aws_s3_bucket" "blue" {
  bucket        = local.blue_bucket_name
  force_destroy = local.common_bucket_config.force_destroy
}

# S3 Bucket versioning for BLUE (enables rollback)
resource "aws_s3_bucket_versioning" "blue" {
  bucket = aws_s3_bucket.blue.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket encryption for BLUE
resource "aws_s3_bucket_server_side_encryption_configuration" "blue" {
  bucket = aws_s3_bucket.blue.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access for BLUE bucket (security best practice)
resource "aws_s3_bucket_public_access_block" "blue" {
  bucket = aws_s3_bucket.blue.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket for GREEN environment (conditional)
resource "aws_s3_bucket" "green" {
  count = var.enable_blue_green ? 1 : 0

  bucket        = local.green_bucket_name
  force_destroy = local.common_bucket_config.force_destroy
}

# S3 Bucket versioning for GREEN
resource "aws_s3_bucket_versioning" "green" {
  count = var.enable_blue_green ? 1 : 0

  bucket = aws_s3_bucket.green[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket encryption for GREEN
resource "aws_s3_bucket_server_side_encryption_configuration" "green" {
  count = var.enable_blue_green ? 1 : 0

  bucket = aws_s3_bucket.green[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access for GREEN bucket
resource "aws_s3_bucket_public_access_block" "green" {
  count = var.enable_blue_green ? 1 : 0

  bucket = aws_s3_bucket.green[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle policy for BLUE bucket (cleanup old versions)
resource "aws_s3_bucket_lifecycle_configuration" "blue" {
  bucket = aws_s3_bucket.blue.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.retention_policy_days
    }
  }
}

# Lifecycle policy for GREEN bucket
resource "aws_s3_bucket_lifecycle_configuration" "green" {
  count = var.enable_blue_green ? 1 : 0

  bucket = aws_s3_bucket.green[0].id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.retention_policy_days
    }
  }
}

# CloudFront Origin Access Control for secure S3 access
resource "aws_cloudfront_origin_access_control" "storybook" {
  count = var.enable_cdn ? 1 : 0

  name                              = "${var.project_name}-${var.environment}-storybook-oac"
  description                       = "OAC for Storybook S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "storybook" {
  count = var.enable_cdn ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Storybook distribution for ${var.project_name} ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.environment == "prod" ? "PriceClass_All" : "PriceClass_100"

  # Origin pointing to active bucket
  origin {
    domain_name              = var.active_environment == "green" && var.enable_blue_green ? aws_s3_bucket.green[0].bucket_regional_domain_name : aws_s3_bucket.blue.bucket_regional_domain_name
    origin_id                = var.active_environment == "green" && var.enable_blue_green ? "S3-${local.green_bucket_name}" : "S3-${local.blue_bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.storybook[0].id
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.active_environment == "green" && var.enable_blue_green ? "S3-${local.green_bucket_name}" : "S3-${local.blue_bucket_name}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate
  viewer_certificate {
    cloudfront_default_certificate = !local.has_custom_domain
    acm_certificate_arn            = local.has_custom_domain ? aws_acm_certificate.storybook[0].arn : null
    ssl_support_method             = local.has_custom_domain ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  # Custom domain aliases
  aliases = local.has_custom_domain ? [var.custom_domain_name] : []
}

# S3 bucket policy to allow CloudFront OAC access to BLUE
resource "aws_s3_bucket_policy" "blue_cloudfront" {
  count = var.enable_cdn ? 1 : 0

  bucket = aws_s3_bucket.blue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.blue.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.storybook[0].arn
          }
        }
      }
    ]
  })
}

# S3 bucket policy to allow CloudFront OAC access to GREEN
resource "aws_s3_bucket_policy" "green_cloudfront" {
  count = var.enable_cdn && var.enable_blue_green ? 1 : 0

  bucket = aws_s3_bucket.green[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.green[0].arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.storybook[0].arn
          }
        }
      }
    ]
  })
}

# ACM Certificate for custom domain (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "storybook" {
  count = local.has_custom_domain && var.enable_cdn ? 1 : 0

  provider          = aws.us_east_1
  domain_name       = var.custom_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Route53 record for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = local.has_custom_domain && var.enable_cdn && local.route53_zone_id != null ? {
    for dvo in aws_acm_certificate.storybook[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.route53_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "storybook" {
  count = local.has_custom_domain && var.enable_cdn && local.route53_zone_id != null ? 1 : 0

  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.storybook[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Route53 record for custom domain
resource "aws_route53_record" "storybook" {
  count = local.has_custom_domain && var.enable_cdn && local.route53_zone_id != null ? 1 : 0

  zone_id = local.route53_zone_id
  name    = var.custom_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.storybook[0].domain_name
    zone_id                = aws_cloudfront_distribution.storybook[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# S3 bucket website configuration for BLUE (fallback when CDN disabled)
resource "aws_s3_bucket_website_configuration" "blue" {
  count = var.enable_cdn ? 0 : 1

  bucket = aws_s3_bucket.blue.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 bucket website configuration for GREEN
resource "aws_s3_bucket_website_configuration" "green" {
  count = var.enable_cdn ? 0 : (var.enable_blue_green ? 1 : 0)

  bucket = aws_s3_bucket.green[0].id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Public bucket policy for BLUE (only when CDN is disabled)
resource "aws_s3_bucket_policy" "blue_public" {
  count = var.enable_cdn ? 0 : 1

  bucket = aws_s3_bucket.blue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.blue.arn}/*"
      }
    ]
  })
}

# Public bucket policy for GREEN (only when CDN is disabled)
resource "aws_s3_bucket_policy" "green_public" {
  count = var.enable_cdn ? 0 : (var.enable_blue_green ? 1 : 0)

  bucket = aws_s3_bucket.green[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.green[0].arn}/*"
      }
    ]
  })
}

# Update public access block for BLUE when CDN is disabled
resource "aws_s3_bucket_public_access_block" "blue_public" {
  count = var.enable_cdn ? 0 : 1

  bucket = aws_s3_bucket.blue.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Update public access block for GREEN when CDN is disabled
resource "aws_s3_bucket_public_access_block" "green_public" {
  count = var.enable_cdn ? 0 : (var.enable_blue_green ? 1 : 0)

  bucket = aws_s3_bucket.green[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
