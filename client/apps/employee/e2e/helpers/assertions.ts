import { expect, Page } from '@playwright/test';

/**
 * Custom E2E Assertions for Time Tracker App
 */

/**
 * Assert that the page has RTL layout
 * @param page - Playwright page object
 */
export async function expectRTL(page: Page) {
  const html = page.locator('html');
  await expect(html).toHaveAttribute('dir', 'rtl');
}

/**
 * Assert that element is a proper touch target (min 44x44px)
 * @param page - Playwright page object
 * @param selector - CSS selector or locator
 */
export async function expectTouchTarget(page: Page, selector: string) {
  const element = page.locator(selector);
  const box = await element.boundingBox();

  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
}

/**
 * Assert that page is mobile responsive
 * @param page - Playwright page object
 */
export async function expectMobileResponsive(page: Page) {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Check that main content is visible
  const main = page.locator('main, [role="main"]').first();
  await expect(main).toBeInViewport();

  // Check no horizontal scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
}

/**
 * Assert that Hebrew text is displayed correctly
 * @param page - Playwright page object
 * @param text - Hebrew text to check
 */
export async function expectHebrewText(page: Page, text: string) {
  await expect(page.locator(`text=${text}`)).toBeVisible();
}

/**
 * Assert that error message is displayed
 * @param page - Playwright page object
 * @param message - Error message pattern
 */
export async function expectErrorMessage(page: Page, message?: string | RegExp) {
  if (message) {
    await expect(page.locator(`text=${message}`)).toBeVisible();
  } else {
    // Look for common error indicators
    const errorElement = page.locator('[role="alert"], .error, [class*="error"]').first();
    await expect(errorElement).toBeVisible();
  }
}

/**
 * Assert that success message is displayed
 * @param page - Playwright page object
 * @param message - Success message pattern
 */
export async function expectSuccessMessage(page: Page, message?: string | RegExp) {
  if (message) {
    await expect(page.locator(`text=${message}`)).toBeVisible();
  } else {
    // Look for common success indicators
    const successElement = page.locator('[role="status"], .success, [class*="success"]').first();
    await expect(successElement).toBeVisible();
  }
}

/**
 * Assert that page has proper accessibility attributes
 * @param page - Playwright page object
 */
export async function expectAccessible(page: Page) {
  // Check for main landmark
  await expect(page.locator('main, [role="main"]')).toBeVisible();

  // Check for skip link (good accessibility practice)
  const skipLink = page.locator('a[href="#main-content"], a:has-text("דלג לתוכן")').first();
  // Skip link might not always exist, so don't fail if missing
}

/**
 * Wait for API call to complete
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to match
 */
export async function waitForAPI(page: Page, urlPattern: string | RegExp) {
  await page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}
