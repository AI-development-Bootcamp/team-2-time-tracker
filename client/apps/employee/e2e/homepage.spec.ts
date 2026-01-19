import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { expectMobileResponsive, expectRTL } from './helpers/assertions';

/**
 * Homepage E2E Tests
 * Tests the main dashboard functionality after login
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.EMPLOYEE);
  });

  test('should display welcome message with user name', async ({ page }) => {
    // Should see user greeting
    await expect(page.locator('text=/ברוך הבא|שלום/i')).toBeVisible();
  });

  test('should have RTL layout', async ({ page }) => {
    await expectRTL(page);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await expectMobileResponsive(page);
  });

  // TODO: Remove skip when navigation feature is implemented - TICKET-NAV-001 / @team-frontend
  test.skip('should navigate between pages', 'Navigation feature not yet implemented', async ({ page }) => {
    // When implemented, this test should:
    // 1. Assert the timeReportLink is visible
    // 2. Click the link
    // 3. Assert navigation to /time-report occurred
    const timeReportLink = page.locator('a:has-text("דיווח שעות"), a:has-text("Time Report")').first();

    await expect(timeReportLink).toBeVisible();
    await timeReportLink.click();
    await expect(page).toHaveURL(/\/time-report/);
  });
});
