import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';

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
    // Check HTML direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Check that the page title exists
    await expect(page).toHaveTitle(/Time Tracker/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page
    await page.reload();

    // Check that main content is visible
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
    await expect(mainContent).toBeInViewport();
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
