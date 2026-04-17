const { test, expect } = require('@playwright/test');

test.describe('TDD Frontend Example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-js-web-app-example/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('TDD Frontend Example');
  });

  test('form has title input, imageUrl input and submit button', async ({ page }) => {
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#imageUrl')).toBeVisible();
    await expect(page.locator('#btnSubmit')).toBeVisible();
  });

  test('title input has correct placeholder', async ({ page }) => {
    await expect(page.locator('#title')).toHaveAttribute('placeholder', 'Image Title');
  });

  test('imageUrl input accepts url type', async ({ page }) => {
    await expect(page.locator('#imageUrl')).toHaveAttribute('type', 'url');
  });

  test('card list is visible with pre-loaded cards', async ({ page }) => {
    await expect(page.locator('#card-list')).toBeVisible();
    await expect(page.locator('#card-list article')).toHaveCount(3);
  });

  test('pre-loaded cards have expected titles', async ({ page }) => {
    const titles = page.locator('.card-title');
    await expect(titles).toHaveCount(3);
    await expect(titles.nth(0)).toHaveText('AI Alien');
    await expect(titles.nth(1)).toHaveText('Predator Night Vision');
    await expect(titles.nth(2)).toHaveText('ET Bilu');
  });

  test('card images have alt text', async ({ page }) => {
    const images = page.locator('.card-img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.+/);
    }
  });

  test('submitting form with title and valid image URL adds a new card', async ({ page }) => {
    await page.fill('#title', 'Test Card');
    await page.fill('#imageUrl', 'https://picsum.photos/200');
    await page.click('#btnSubmit');
    await expect(page.locator('#card-list article')).toHaveCount(4);
    await expect(page.locator('.card-title').last()).toHaveText('Test Card');
  });
});
