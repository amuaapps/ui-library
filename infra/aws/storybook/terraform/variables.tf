# Required Variables

variable "project_name" {
  description = "Project identifier used for resource naming (lowercase alphanumeric and hyphens only)"
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,19}$", var.project_name))
    error_message = "project_name must be 3-20 characters, start with a letter, and contain only lowercase letters, numbers, and hyphens"
  }
}

variable "environment" {
  description = "Environment name for deployment isolation"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod"
  }
}

variable "region" {
  description = "AWS region for resource deployment"
  type        = string
}

# Optional Variables

variable "enable_blue_green" {
  description = "Enable blue/green deployment strategy (recommended for prod)"
  type        = bool
  default     = true
}

variable "enable_cdn" {
  description = "Enable CloudFront CDN for global distribution (recommended for prod)"
  type        = bool
  default     = true
}

variable "custom_domain_name" {
  description = "Custom domain name for Storybook (e.g., storybook.example.com)"
  type        = string
  default     = null
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for custom domain (required if custom_domain_name is set)"
  type        = string
  default     = null
}

variable "retention_policy_days" {
  description = "Number of days to retain access logs"
  type        = number
  default     = 30

  validation {
    condition     = var.retention_policy_days >= 1 && var.retention_policy_days <= 365
    error_message = "retention_policy_days must be between 1 and 365"
  }
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "active_environment" {
  description = "Active environment for blue/green switch (blue or green)"
  type        = string
  default     = "blue"

  validation {
    condition     = contains(["blue", "green"], var.active_environment)
    error_message = "active_environment must be either 'blue' or 'green'"
  }
}
