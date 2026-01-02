variable "bucket_name" {
  description = "Name of the S3 bucket. Must be globally unique."
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
  default     = "production"
}

variable "tags" {
  description = "Additional tags to apply to the bucket"
  type        = map(string)
  default     = {}
}

variable "enable_versioning" {
  description = "Enable versioning for the S3 bucket"
  type        = bool
  default     = true
}

variable "sse_algorithm" {
  description = "Server-side encryption algorithm (AES256 or aws:kms)"
  type        = string
  default     = "AES256"
  validation {
    condition     = contains(["AES256", "aws:kms"], var.sse_algorithm)
    error_message = "SSE algorithm must be either AES256 or aws:kms."
  }
}

variable "kms_key_id" {
  description = "KMS key ID for encryption (required if sse_algorithm is aws:kms)"
  type        = string
  default     = null
}

variable "block_public_access" {
  description = "Block all public access to the bucket"
  type        = bool
  default     = true
}

variable "enable_lifecycle_rules" {
  description = "Enable lifecycle rules for automatic object transitions"
  type        = bool
  default     = false
}

variable "transition_to_ia_days" {
  description = "Number of days before transitioning to STANDARD_IA"
  type        = number
  default     = 90
}

variable "transition_to_glacier_days" {
  description = "Number of days before transitioning to GLACIER"
  type        = number
  default     = 180
}

variable "expiration_days" {
  description = "Number of days before objects expire"
  type        = number
  default     = 365
}

variable "noncurrent_version_expiration_days" {
  description = "Number of days before noncurrent versions expire"
  type        = number
  default     = 90
}

variable "enable_logging" {
  description = "Enable access logging for the bucket"
  type        = bool
  default     = false
}

variable "logging_bucket" {
  description = "Target bucket for access logs (required if enable_logging is true)"
  type        = string
  default     = null
}