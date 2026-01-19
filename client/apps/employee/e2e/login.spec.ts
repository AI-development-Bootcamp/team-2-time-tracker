import { test, expect } from '@playwright/test';

/**
 * Login Flow E2E Tests
 * Tests the complete authentication flow for employees
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Time Tracker/);

    // Check for login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check for Hebrew text (RTL support)
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toContainText(/התחבר|כניסה/);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click submit without filling fields
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/אימייל|email/i')).toBeVisible();
    await expect(page.locator('text=/סיסמה|password/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrong_password');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/שגוי|incorrect|invalid/i')).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Note: This test requires a test user in the database
    // In real CI, you would seed the database with test data

    // Fill in valid credentials (example - adjust to your test user)
    await page.fill('input[name="email"]', 'test.employee@example.com');
    await page.fill('input[name="password"]', 'Test123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to home page
    await expect(page).toHaveURL(/\/$|\/dashboard/);

    // Should see user menu or welcome message
    await expect(page.locator('text=/ברוך הבא|שלום/i')).toBeVisible();
  });

  test('should redirect to change password if first login', async ({ page }) => {
    // Login with user that needs password change
    await page.fill('input[name="email"]', 'new.employee@example.com');
    await page.fill('input[name="password"]', 'Test123!');

    await page.click('button[type="submit"]');

    // Should redirect to change password page
    await expect(page).toHaveURL(/\/change-password/);

    // Should see password change form
    await expect(page.locator('input[name="currentPassword"]')).toBeVisible();
    await expect(page.locator('input[name="newPassword"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should handle RTL layout correctly', async ({ page }) => {
    // Check that the page has RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Check that form elements are aligned correctly
    const form = page.locator('form');
    const direction = await form.evaluate((el) =>
      window.getComputedStyle(el).direction
    );
    expect(direction).toBe('rtl');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to login
    await page.goto('/login');

    // Check that elements are visible and properly sized
    const loginButton = page.locator('button[type="submit"]');
    const buttonBox = await loginButton.boundingBox();

    // Button should have proper touch target size (min 44x44px)
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

    // Check that form is not cut off
    await expect(page.locator('input[name="email"]')).toBeInViewport();
    await expect(page.locator('input[name="password"]')).toBeInViewport();
    await expect(loginButton).toBeInViewport();
  });

  test('should toggle password visibility', async ({ page }) => {
    // Check if password field is initially hidden
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click show/hide button if it exists
    const toggleButton = page.locator('button[aria-label*="show"], button[aria-label*="הצג"]').first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Password should now be visible (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'test.employee@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/$|\/dashboard/);

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("התנתק"), button:has-text("Logout")').first();

    // Assert logout button is visible before interacting
    await expect(
      logoutButton,
      'Logout button should be visible after login. Locator: button:has-text("התנתק"), button:has-text("Logout")'
    ).toBeVisible();

    await logoutButton.click();

    // Should redirect back to login
    await expect(page).toHaveURL(/\/login/);

    // Trying to access protected route should redirect to login
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
