# TFLint configuration for Terraform templates
# https://github.com/terraform-linters/tflint

config {
  # Enable all rules by default
  module = true
  force = false
}

# AWS plugin for AWS-specific rules
plugin "aws" {
  enabled = true
  version = "0.29.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# Terraform plugin for general Terraform rules
plugin "terraform" {
  enabled = true
  version = "0.5.0"
  source  = "github.com/terraform-linters/tflint-ruleset-terraform"
}

# Security rules
rule "aws_s3_bucket_public_access_block" {
  enabled = true
}

rule "aws_cloudfront_distribution_viewer_certificate" {
  enabled = true
}

rule "terraform_required_version" {
  enabled = true
}

rule "terraform_required_providers" {
  enabled = true
}

rule "terraform_naming_convention" {
  enabled = true
}

rule "terraform_typed_variables" {
  enabled = true
}

rule "terraform_unused_declarations" {
  enabled = true
}

rule "terraform_documented_variables" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = true
}

# Disable rules that conflict with our design
rule "terraform_standard_module_structure" {
  enabled = false  # We use a flat structure
}
