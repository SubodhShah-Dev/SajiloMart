import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 767, height: 1024 }, // Use 767 to be below md breakpoint
  { name: 'desktop', width: 1440, height: 900 },
];

for (const vp of viewports) {
  test(`Home page at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out expected 401 errors from auth bootstrap when not logged in
        if (!text.includes('401 (Unauthorized)')) {
          errors.push(text);
        }
      }
    });
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Check navbar elements
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    
    // Main navigation is visible on desktop (>= 768px), hidden on mobile/tablet (shown in mobile menu)
    if (vp.width >= 768) {
      await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
    } else {
      await expect(page.locator('nav[aria-label="Main navigation"]')).toBeHidden();
    }
    
    // Check mobile menu button on mobile/tablet (< 768px)
    if (vp.width < 768) {
      await expect(page.locator('button[aria-controls="mobile-menu"]')).toBeVisible();
    } else {
      await expect(page.locator('button[aria-controls="mobile-menu"]')).toBeHidden();
    }

    // Check search bar - pick a visible one
    await expect(page.locator('header[role="banner"] form[role="search"] input[type="search"]').locator('visible=true').first()).toBeVisible();

    // Check cart icon (link in header, not inside main nav)
    await expect(page.locator('header[role="banner"] a[href="/cart"]')).toBeVisible();

    // Check user menu
    await expect(page.locator('button[aria-haspopup="menu"]')).toBeVisible();

    // Check hero banner
    await expect(page.locator('section[aria-label="Hero banner carousel"]')).toBeVisible();

    // Check category grid
    await expect(page.locator('#categories-heading')).toBeVisible();
    await expect(page.locator('[role="list"][aria-label="Product categories"]')).toBeVisible();

    // Check featured products (first ProductGrid on home page)
    await expect(page.locator('section[aria-labelledby="featured-products"]')).toBeVisible();

    // Check promo banners
    await expect(page.locator('[aria-label="Promotional banner cards"]')).toBeVisible();

    // Check new arrivals (second ProductGrid on home page)
    await expect(page.locator('section[aria-labelledby="new-arrivals"]')).toBeVisible();

    // Check promo banners
    await expect(page.locator('[aria-label="Promotional banner cards"]')).toBeVisible();

    // Check new arrivals
    await expect(page.locator('#new-arrivals')).toBeVisible();

    // Check newsletter signup
    await expect(page.locator('#newsletter-heading')).toBeVisible();

    // Check footer
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();

    // Check for console errors
    expect(errors).toEqual([]);
    
    // Take screenshot
    await page.screenshot({ path: `tests/screenshot-${vp.name}.png`, fullPage: true });
  });
}

test('Mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Open mobile menu
  await page.click('button[aria-controls="mobile-menu"]');
  await expect(page.locator('aside[role="dialog"][aria-label="Mobile menu"]')).toBeVisible({ timeout: 5000 });
  
  // Check mobile menu content
  await expect(page.locator('aside[role="dialog"] nav[aria-label="Mobile navigation"]')).toBeVisible();
  
  // Close mobile menu
  await page.click('aside[role="dialog"] button[aria-label="Close menu"]');
  await expect(page.locator('aside[role="dialog"][aria-label="Mobile menu"]')).toBeHidden({ timeout: 5000 });
});

test('Keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Tab through navbar - first focusable should be the logo link in header
  await page.keyboard.press('Tab');
  await expect(page.locator('header[role="banner"] a[href="/"]').first()).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(page.locator('header[role="banner"] form[role="search"] input[type="search"]').locator('visible=true').first()).toBeFocused();
  
  // Check focus visible styles
  const searchInput = page.locator('header[role="banner"] form[role="search"] input[type="search"]').locator('visible=true').first();
  await expect(searchInput).toHaveCSS('outline-color', 'rgb(30, 58, 95)'); // primary color
});