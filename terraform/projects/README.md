# S3 Bucket Terraform Configuration

This Terraform configuration creates an AWS S3 bucket with security best practices enabled.

## Features

- **Versioning**: Track changes to objects over time
- **Encryption**: Server-side encryption at rest (AES256 or KMS)
- **Public Access Block**: Prevents accidental public exposure
- **Lifecycle Rules**: Automatic transitions to lower-cost storage classes
- **Access Logging**: Optional logging of bucket access
- **Tagging**: Comprehensive resource tagging for organization

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with appropriate credentials
- Appropriate IAM permissions to create S3 buckets

## Usage

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Copy and configure variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan the deployment:**
   ```bash
   terraform plan
   ```

4. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## Required Variables

- `bucket_name`: Globally unique name for your S3 bucket

## Optional Variables

- `environment`: Environment name (default: "production")
- `enable_versioning`: Enable object versioning (default: true)
- `sse_algorithm`: Encryption algorithm - "AES256" or "aws:kms" (default: "AES256")
- `block_public_access`: Block all public access (default: true)
- `enable_lifecycle_rules`: Enable automatic object transitions (default: false)
- `enable_logging`: Enable access logging (default: false)

## Outputs

- `bucket_id`: The name of the bucket
- `bucket_arn`: The ARN of the bucket
- `bucket_domain_name`: The bucket domain name
- `bucket_regional_domain_name`: The region-specific domain name
- `bucket_region`: The AWS region of the bucket

## Security Considerations

- Public access is blocked by default
- Server-side encryption is enabled by default
- Consider enabling KMS encryption for sensitive data
- Enable versioning to protect against accidental deletions
- Enable logging for audit trails

## Cost Optimization

- Enable lifecycle rules to automatically transition objects to cheaper storage classes
- Set expiration policies to delete old objects
- Use Intelligent-Tiering for unpredictable access patterns

## Clean Up

To destroy the resources:
```bash
terraform destroy
```

**Note:** If versioning is enabled, you may need to delete all object versions before destroying the bucket.
