import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 * Tests the main dashboard functionality after login
 */

test.describe('Homepage', () => {
  // Helper function to login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login with test credentials
    await page.fill('input[name="username"]', 'test_employee');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to homepage
    await page.waitForURL(/\/$|\/dashboard/);
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

  test.skip('should navigate between pages', async ({ page }) => {
    // Skip: Navigation feature not yet implemented
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
