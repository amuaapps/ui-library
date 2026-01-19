# Remote backend configuration for Terraform state
# This enables state persistence across CI runs and team collaboration
#
# Backend configuration is provided via:
# 1. CLI flags: -backend-config="bucket=..." -backend-config="key=..."
# 2. Backend config file: -backend-config=backend.hcl
# 3. Environment variables: TF_CLI_ARGS_init="-backend-config=..."
#
# For local development, you can use local backend by not providing backend config.
# For CI/CD, backend config MUST be provided via GitHub secrets/vars.

terraform {
  backend "s3" {
    # These values are provided at init time via -backend-config flags
    # Required:
    #   bucket         = "terraform-state-bucket-name"
    #   key            = "ui-library/storybook/{environment}/terraform.tfstate"
    #   region         = "us-east-1"
    #   dynamodb_table = "terraform-state-locks"
    #   encrypt        = true
    
    # Optional (recommended for team environments):
    #   workspace_key_prefix = "workspaces"
  }
}
