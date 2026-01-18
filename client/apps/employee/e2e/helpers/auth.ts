import { Page } from '@playwright/test';

/**
 * E2E Test Helpers for Authentication
 */

export interface TestUser {
  username: string;
  password: string;
  role: 'EMPLOYEE' | 'ADMIN';
  mustChangePassword?: boolean;
}

/**
 * Default test users
 * Note: These users should be seeded in the test database
 */
export const TEST_USERS = {
  EMPLOYEE: {
    username: 'test_employee',
    password: 'TestPassword123!',
    role: 'EMPLOYEE' as const,
  },
  ADMIN: {
    username: 'test_admin',
    password: 'AdminPassword123!',
    role: 'ADMIN' as const,
  },
  NEW_EMPLOYEE: {
    username: 'new_employee',
    password: 'TempPassword123!',
    role: 'EMPLOYEE' as const,
    mustChangePassword: true,
  },
};

/**
 * Login helper function
 * @param page - Playwright page object
 * @param user - User credentials
 */
export async function login(page: Page, user: TestUser) {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[name="username"]', user.username);
  await page.fill('input[name="password"]', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation
  if (user.mustChangePassword) {
    await page.waitForURL(/\/change-password/);
  } else {
    await page.waitForURL(/\/$|\/dashboard/);
  }
}

/**
 * Logout helper function
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  // Find logout button (adjust selector as needed)
  const logoutButton = page
    .locator('button:has-text("התנתק"), button:has-text("Logout")')
    .first();

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/\/login/);
  }
}

/**
 * Check if user is authenticated
 * @param page - Playwright page object
 * @returns true if authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return !currentUrl.includes('/login');
}

/**
 * Setup authentication state
 * Useful for tests that need to start authenticated
 * @param page - Playwright page object
 * @param user - User to login as
 */
export async function setupAuthState(page: Page, user: TestUser = TEST_USERS.EMPLOYEE) {
  await login(page, user);
}
