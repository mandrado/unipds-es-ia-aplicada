import { test, expect } from '@playwright/test';

test.describe('TDD Frontend Example', () => {
  test.describe.configure({ timeout: 15000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-js-web-app-example/');
    await expect(page.getByRole('button', { name: 'Submit Form' })).toBeVisible();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('TDD Frontend Example');
  });

  test('form has title input, imageUrl input and submit button', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Image Title' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Image URL' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Form' })).toBeVisible();
  });

  test('title input has correct placeholder', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Image Title' })).toHaveAttribute('placeholder', 'Image Title');
  });

  test('imageUrl input accepts url type', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Image URL' })).toHaveAttribute('type', 'url');
  });

  test('card list is visible with pre-loaded cards', async ({ page }) => {
    const cards = page.locator('main article');
    await expect(cards).toHaveCount(3);
  });

  test('pre-loaded cards have expected titles', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 4, name: 'AI Alien' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 4, name: 'Predator Night Vision' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 4, name: 'ET Bilu' })).toBeVisible();
  });

  test('card images have alt text', async ({ page }) => {
    const images = page.locator('main article img');
    const count = await images.count();

    for (let i = 0; i < count; i += 1) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.+/);
    }
  });

  test('submits the form and updates the list', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Image Title' });
    const imageUrlInput = page.getByRole('textbox', { name: 'Image URL' });
    const submitButton = page.getByRole('button', { name: 'Submit Form' });
    const cards = page.locator('main article');

    const initialCount = await cards.count();
    const uniqueTitle = `Playwright Card ${Date.now()}`;

    await titleInput.fill(uniqueTitle);
    await imageUrlInput.fill('https://picsum.photos/seed/playwright/300/200');
    await submitButton.click();

    await expect(cards).toHaveCount(initialCount + 1);
    await expect(page.getByRole('heading', { level: 4, name: uniqueTitle })).toBeVisible();
  });

  test('allows typing in fields and clears them after successful submit', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Image Title' });
    const imageUrlInput = page.getByRole('textbox', { name: 'Image URL' });
    const submitButton = page.getByRole('button', { name: 'Submit Form' });

    await titleInput.fill('Field Behavior Test');
    await imageUrlInput.fill('https://picsum.photos/seed/field-behavior/300/200');

    await expect(titleInput).toHaveValue('Field Behavior Test');
    await expect(imageUrlInput).toHaveValue('https://picsum.photos/seed/field-behavior/300/200');

    await submitButton.click();

    await expect(titleInput).toHaveValue('');
    await expect(imageUrlInput).toHaveValue('');
  });

  test('shows validation messages and blocks submission when fields are invalid', async ({ page }) => {
    const titleInput = page.getByRole('textbox', { name: 'Image Title' });
    const imageUrlInput = page.getByRole('textbox', { name: 'Image URL' });
    const submitButton = page.getByRole('button', { name: 'Submit Form' });
    const cards = page.locator('main article');

    const initialCount = await cards.count();

    await titleInput.fill('Only title');
    await imageUrlInput.fill('not-an-url');
    await submitButton.click();

    await expect(page.getByText('Please type a valid URL')).toBeVisible();
    await expect(cards).toHaveCount(initialCount);
  });
});
