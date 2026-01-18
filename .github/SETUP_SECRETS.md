# GitHub Secrets Setup

This document describes the required GitHub secrets for CI/CD workflows.

## Required Secrets

### Test Environment Secrets

These secrets are required for running tests in CI:

1. **JWT_SECRET_TEST**
   - Description: JWT secret key for test environment
   - Recommended value: Generate a secure random string (e.g., `openssl rand -base64 32`)
   - Used in: CI workflow, E2E tests

2. **JWT_REFRESH_SECRET_TEST**
   - Description: JWT refresh token secret key for test environment
   - Recommended value: Generate a secure random string (e.g., `openssl rand -base64 32`)
   - Used in: CI workflow, E2E tests

3. **CODECOV_TOKEN** (Optional)
   - Description: Token for uploading coverage reports to Codecov
   - Get from: https://codecov.io/
   - Used in: CI workflow (coverage upload)
   - Note: CI will not fail if this is missing

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value

## Generating Secure Random Values

You can generate secure random values using:

```bash
# Using OpenSSL (Linux/Mac)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Security Best Practices

- Never commit secrets to the repository
- Use different secrets for production and test environments
- Rotate secrets periodically
- Use secrets with sufficient entropy (at least 32 bytes)
- Grant minimal necessary access to secrets
