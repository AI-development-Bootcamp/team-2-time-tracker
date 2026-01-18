# E2E Tests - Employee App

End-to-End tests for the Time Tracker Employee application using Playwright.

## 🚀 Quick Start

### Install Dependencies
```bash
# From project root
pnpm install

# Install Playwright browsers
pnpm --filter @client/employee exec playwright install
```

### Run Tests

```bash
# Run all E2E tests (headless)
pnpm --filter @client/employee test:e2e

# Run with UI mode (interactive)
pnpm --filter @client/employee test:e2e:ui

# Run in headed mode (see browser)
pnpm --filter @client/employee test:e2e:headed

# Debug mode (step through tests)
pnpm --filter @client/employee test:e2e:debug

# Run specific test file
pnpm --filter @client/employee test:e2e login.spec.ts

# Run tests on specific browser
pnpm --filter @client/employee test:e2e --project=chromium
pnpm --filter @client/employee test:e2e --project=firefox
pnpm --filter @client/employee test:e2e --project="Mobile Chrome"
```

## 📁 Test Structure

```
e2e/
├── login.spec.ts          # Login flow tests
├── homepage.spec.ts       # Homepage/dashboard tests
├── helpers/
│   ├── auth.ts           # Authentication helpers
│   └── assertions.ts     # Custom assertions
└── README.md
```

## ✅ Test Coverage

### Current Tests

#### Login Flow (`login.spec.ts`)
- ✅ Display login page correctly
- ✅ Validation errors for empty fields
- ✅ Error for invalid credentials
- ✅ Successful login with valid credentials
- ✅ Redirect to change password if first login
- ✅ RTL layout support
- ✅ Mobile responsiveness
- ✅ Password visibility toggle
- ✅ Logout functionality

#### Homepage (`homepage.spec.ts`)
- ✅ Display welcome message
- ✅ RTL layout
- ✅ Mobile responsiveness
- ✅ Navigation between pages

### Future Tests (To Be Added)

When features are implemented, add tests for:

#### Time Tracking
- [ ] Start timer
- [ ] Stop timer with task selection
- [ ] Cancel timer
- [ ] Manual time entry creation
- [ ] Edit time entry
- [ ] Delete time entry
- [ ] Timer banner visibility
- [ ] Real-time timer updates

#### Workday Management
- [ ] View daily summary
- [ ] Submit workday (540 minutes)
- [ ] Validation for incorrect minutes
- [ ] Monthly calendar view
- [ ] Workday status indicators

#### Absences
- [ ] Create absence request
- [ ] Select date range
- [ ] Upload document
- [ ] Half-day vs full-day selection
- [ ] View absence history
- [ ] Edit absence
- [ ] Delete absence

## 🧪 Test Users

The following test users should be seeded in the test database:

```typescript
{
  username: 'test_employee',
  password: 'TestPassword123!',
  role: 'EMPLOYEE'
}

{
  username: 'new_employee',
  password: 'TempPassword123!',
  role: 'EMPLOYEE',
  mustChangePassword: true
}
```

## 🛠️ Helpers

### Authentication (`helpers/auth.ts`)

```typescript
import { login, logout, TEST_USERS } from './helpers/auth';

// Login as employee
await login(page, TEST_USERS.EMPLOYEE);

// Logout
await logout(page);
```

### Custom Assertions (`helpers/assertions.ts`)

```typescript
import { expectRTL, expectMobileResponsive, expectTouchTarget } from './helpers/assertions';

// Assert RTL layout
await expectRTL(page);

// Assert mobile responsive
await expectMobileResponsive(page);

// Assert proper touch target size
await expectTouchTarget(page, 'button[type="submit"]');
```

## 📊 Reports

After running tests, view the HTML report:

```bash
# Open report
pnpm --filter @client/employee exec playwright show-report
```

Reports are also available as GitHub Actions artifacts in CI.

## 🐛 Debugging

### Visual Debugging
```bash
# UI mode - best for debugging
pnpm --filter @client/employee test:e2e:ui

# Debug mode - step through with DevTools
pnpm --filter @client/employee test:e2e:debug
```

### Screenshots & Videos
- Screenshots on failure: `test-results/`
- Videos on failure: `test-results/`
- Traces on retry: Access via HTML report

### Console Logs
```typescript
// Add console listener in test
page.on('console', msg => console.log(msg.text()));
```

## 🌍 Multi-Browser Testing

Tests run on:
- ✅ Desktop Chrome (Chromium)
- ✅ Desktop Firefox
- ✅ Desktop Safari (WebKit)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

Run specific browser:
```bash
pnpm --filter @client/employee test:e2e --project="Mobile Safari"
```

## 🔧 Configuration

See `playwright.config.ts` for:
- Base URL
- Timeouts
- Retries (CI vs local)
- Screenshot/video settings
- Locale (Hebrew)
- Timezone (Asia/Jerusalem)

## 📝 Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { expectRTL } from './helpers/assertions';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.EMPLOYEE);
  });

  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/feature');

    // Interact
    await page.click('button:has-text("כפתור")');

    // Assert
    await expect(page.locator('.result')).toBeVisible();
    await expectRTL(page);
  });
});
```

### Best Practices

1. **Use data-testid for stable selectors**
   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for navigation properly**
   ```typescript
   await page.waitForURL(/\/success/);
   ```

3. **Use Hebrew text for UI elements**
   ```typescript
   await expect(page.locator('text=התחברות מוצלחת')).toBeVisible();
   ```

4. **Test both Hebrew and RTL**
   ```typescript
   await expectRTL(page);
   ```

5. **Test mobile-first**
   ```typescript
   await expectMobileResponsive(page);
   ```

## 🚨 CI/CD

E2E tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

See `.github/workflows/e2e.yml` for CI configuration.

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
