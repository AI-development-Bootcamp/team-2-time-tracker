# Branch Protection Setup Guide

## CRITICAL: Required Branch Protection Rules

This repository requires mandatory CI enforcement. Follow these steps to configure branch protection rules in GitHub.

---

## GitHub Repository Settings

### Navigate to Branch Protection
1. Go to: `https://github.com/AI-development-Bootcamp/team-2-time-tracker/settings/branches`
2. Click **"Add rule"** or edit existing rule for `main` branch
3. Repeat for `develop` branch

---

## Required Protection Settings for `main` and `develop`

### ✅ Status Checks (MANDATORY)
- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**

**Required status checks (must ALL pass):**
- `lint-test-build` (from CI workflow)
- `validate-pr` (from PR Checks workflow)
- `code-quality` (from PR Checks workflow)
- `security` (from PR Checks workflow)
- `e2e-tests` (from E2E Tests workflow)
- `smoke-test` (from Smoke Tests workflow)
- `analyze` (from CodeQL workflow)
- `scan-dependencies` (from Container Scan workflow)
- `scan-filesystem` (from Container Scan workflow)

### ✅ Additional Protection Rules
- [x] **Require a pull request before merging**
  - Require approvals: **1** (minimum)
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners (if CODEOWNERS file exists)

- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings**
- [x] **Restrict who can push to matching branches**
  - Only allow: Administrators, Maintainers

### ⚠️ Optional (Recommended)
- [ ] Require linear history
- [ ] Require signed commits
- [ ] Include administrators (enforce all rules for admins too)

---

## Verification Steps

After configuring branch protection:

1. **Test PR Creation**
   ```bash
   git checkout -b test-branch-protection
   echo "test" > test.txt
   git add test.txt
   git commit -m "test: verify branch protection"
   git push origin test-branch-protection
   ```

2. **Create PR via GitHub UI**
   - Navigate to: https://github.com/AI-development-Bootcamp/team-2-time-tracker/pulls
   - Create new pull request from `test-branch-protection` to `main`

3. **Verify Required Checks**
   - All 9 status checks should appear in the PR
   - Merge button should be blocked until all checks pass
   - If checks fail, merge must be prevented

4. **Attempt to Merge**
   - Try to merge before all checks pass → Should fail
   - Wait for all checks to pass → Merge should become available

5. **Clean Up**
   ```bash
   git branch -D test-branch-protection
   git push origin --delete test-branch-protection
   ```

---

## CI Workflows Overview

| Workflow | File | Purpose | Trigger |
|----------|------|---------|---------|
| **CI** | `ci.yml` | Build, lint, type-check, unit/integration tests | Every push/PR |
| **PR Checks** | `pr-checks.yml` | PR validation, code quality, security audit | Every PR |
| **E2E Tests** | `e2e.yml` | End-to-end testing with Playwright | Every push/PR (when client/server changed) |
| **Smoke Tests** | `smoke-tests.yml` | Critical path validation | Every push/PR |
| **CodeQL** | `codeql.yml` | SAST security scanning | Every push/PR + weekly |
| **Container Scan** | `container-scan.yml` | Trivy vulnerability scanning | Every push/PR + daily |

---

## Emergency Override (USE WITH CAUTION)

If you need to bypass CI in an **extreme emergency**:

1. Go to branch protection settings
2. Temporarily disable "Require status checks to pass"
3. Merge the critical fix
4. **IMMEDIATELY re-enable** the protection rule
5. Document the incident in a post-mortem

**This should be used ONLY for:**
- Critical production outages
- Security hotfixes
- Infrastructure failures preventing CI execution

**Never use for:**
- "Urgent" feature requests
- Deadline pressure
- Failing tests ("we'll fix them later")

---

## Monitoring & Metrics

Track CI health using GitHub Actions insights:
- https://github.com/AI-development-Bootcamp/team-2-time-tracker/actions

**Key metrics to monitor:**
- CI success rate (target: >95%)
- Average CI duration (target: <15 minutes)
- Flaky test rate (target: <2%)
- Security scan findings (target: 0 HIGH/CRITICAL)

---

## Troubleshooting

### Status checks not appearing in PR
- Ensure workflows are in `.github/workflows/` on the target branch (`main`/`develop`)
- Check workflow triggers include `pull_request`
- Verify workflows have run at least once on the target branch

### Can't find status check names
- Go to Actions tab → Click on a completed workflow run
- The job name is the status check name (e.g., `lint-test-build`)

### Status checks failing unexpectedly
- Check CI logs in Actions tab
- Verify required secrets are configured: `JWT_SECRET_TEST`, `JWT_REFRESH_SECRET_TEST`, `CODECOV_TOKEN`
- Ensure `main` branch is up-to-date with working CI

---

## Required GitHub Secrets

Configure these in: `https://github.com/AI-development-Bootcamp/team-2-time-tracker/settings/secrets/actions`

| Secret Name | Purpose | Where to Get |
|-------------|---------|--------------|
| `JWT_SECRET_TEST` | Test JWT signing | Generate: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET_TEST` | Test refresh token signing | Generate: `openssl rand -base64 32` |
| `CODECOV_TOKEN` | Code coverage uploads | https://codecov.io/ |

---

## Support

If you encounter issues with branch protection:
1. Check this guide first
2. Review GitHub Actions logs
3. Contact repository administrators
4. Open an issue with label `ci/cd`
