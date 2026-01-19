#!/bin/bash
# Lint and security check Terraform templates

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Terraform Lint & Security Checks    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
  echo -e "${RED}✗ Terraform is not installed${NC}"
  echo "Install from: https://www.terraform.io/downloads"
  exit 1
fi

# Step 1: Terraform fmt
echo -e "${YELLOW}Step 1/5: Running terraform fmt...${NC}"
if terraform fmt -check -recursive; then
  echo -e "${GREEN}✓ Terraform formatting is correct${NC}"
else
  echo -e "${RED}✗ Terraform formatting issues found${NC}"
  echo "Run 'terraform fmt -recursive' to fix"
  exit 1
fi
echo ""

# Step 2: Terraform validate
echo -e "${YELLOW}Step 2/5: Running terraform validate...${NC}"
terraform init -backend=false > /dev/null 2>&1
if terraform validate; then
  echo -e "${GREEN}✓ Terraform configuration is valid${NC}"
else
  echo -e "${RED}✗ Terraform validation failed${NC}"
  exit 1
fi
echo ""

# Step 3: TFLint (optional)
echo -e "${YELLOW}Step 3/5: Running tflint...${NC}"
if command -v tflint &> /dev/null; then
  if tflint --init > /dev/null 2>&1 && tflint; then
    echo -e "${GREEN}✓ TFLint checks passed${NC}"
  else
    echo -e "${RED}✗ TFLint checks failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ TFLint not installed (optional)${NC}"
  echo "Install from: https://github.com/terraform-linters/tflint"
fi
echo ""

# Step 4: Checkov (optional)
echo -e "${YELLOW}Step 4/5: Running checkov...${NC}"
if command -v checkov &> /dev/null; then
  if checkov -d . --config-file .checkov.yml; then
    echo -e "${GREEN}✓ Checkov security checks passed${NC}"
  else
    echo -e "${RED}✗ Checkov security checks failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ Checkov not installed (optional)${NC}"
  echo "Install from: https://www.checkov.io/"
fi
echo ""

# Step 5: Terraform plan (dry run)
echo -e "${YELLOW}Step 5/5: Running terraform plan (dry run)...${NC}"
if [ -f "terraform.tfvars" ]; then
  echo -e "${YELLOW}Using terraform.tfvars${NC}"
  if terraform plan -input=false > /dev/null; then
    echo -e "${GREEN}✓ Terraform plan succeeded${NC}"
  else
    echo -e "${RED}✗ Terraform plan failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ terraform.tfvars not found, skipping plan${NC}"
  echo "Create terraform.tfvars from terraform.tfvars.example to test plan"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   All Checks Passed                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Terraform templates are valid and secure${NC}"
