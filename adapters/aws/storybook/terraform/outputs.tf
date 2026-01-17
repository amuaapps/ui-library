# Required Outputs (per INTERFACE.md specification)

output "storybook_url_active" {
  description = "Current active Storybook URL (points to blue or green based on active_environment)"
  value = var.enable_cdn ? (
    local.has_custom_domain ? "https://${var.custom_domain_name}" : "https://${aws_cloudfront_distribution.storybook[0].domain_name}"
    ) : (
    var.active_environment == "green" && var.enable_blue_green ? "http://${aws_s3_bucket_website_configuration.green[0].website_endpoint}" : "http://${aws_s3_bucket_website_configuration.blue[0].website_endpoint}"
  )
}

output "storybook_url_blue" {
  description = "Direct URL to BLUE environment"
  value = var.enable_cdn ? (
    "https://${aws_cloudfront_distribution.storybook[0].domain_name}"
    ) : (
    "http://${aws_s3_bucket_website_configuration.blue[0].website_endpoint}"
  )
}

output "storybook_url_green" {
  description = "Direct URL to GREEN environment"
  value = var.enable_blue_green ? (
    var.enable_cdn ? "https://${aws_cloudfront_distribution.storybook[0].domain_name}" : "http://${aws_s3_bucket_website_configuration.green[0].website_endpoint}"
  ) : null
}

output "upload_target_blue" {
  description = "S3 bucket name for BLUE environment uploads"
  value       = aws_s3_bucket.blue.id
}

output "upload_target_green" {
  description = "S3 bucket name for GREEN environment uploads"
  value       = var.enable_blue_green ? aws_s3_bucket.green[0].id : null
}

output "cdn_distribution_id" {
  description = "CloudFront distribution ID (null if CDN disabled)"
  value       = var.enable_cdn ? aws_cloudfront_distribution.storybook[0].id : null
}

# Optional Outputs

output "blue_bucket_arn" {
  description = "ARN of the BLUE S3 bucket"
  value       = aws_s3_bucket.blue.arn
}

output "green_bucket_arn" {
  description = "ARN of the GREEN S3 bucket"
  value       = var.enable_blue_green ? aws_s3_bucket.green[0].arn : null
}

output "cdn_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.enable_cdn ? aws_cloudfront_distribution.storybook[0].domain_name : null
}

output "active_environment" {
  description = "Currently active environment (blue or green)"
  value       = var.active_environment
}
