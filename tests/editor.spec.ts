import { test, expect } from '@playwright/test';

test('has the correct title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Collab Editor - Collaboration Made Easy/);

  await page.close();
});

test('enter text in monaco editor and make a screenshot', async ({ page }) => {
  await page.goto('/');

  const monacoEditor = page.locator(".monaco-editor").first();
  await monacoEditor.click();

  await page.keyboard.type('This is a line of text\n');
  await page.keyboard.type('This is another line of text\n');

  await page.close();
});

test('two users collaborating', async ({ browser }) => {
  const context = await browser.newContext();

  const user1Page = await context.newPage();
  await user1Page.goto('/automerge:3y6SECgdoojns17k88dx7hKZp6dj');

  const user2Page = await context.newPage();
  await user2Page.goto('/automerge:3y6SECgdoojns17k88dx7hKZp6dj');

  const monacoEditor1 = user1Page.locator(".monaco-editor").first();
  await monacoEditor1.click();

  await user1Page.keyboard.press("ControlOrMeta+KeyA")
  await user1Page.keyboard.type('I\'m user 1. This is a line of text\n');
  await user1Page.keyboard.type('This is another line of text\n');

  const monacoEditor2 = user2Page.locator(".monaco-editor").first();
  await monacoEditor2.click();

  await user2Page.keyboard.press("ControlOrMeta+KeyA")
  await user2Page.keyboard.type('I\'m user 2. This is a line of text\n');
  await user2Page.keyboard.type('This is another line of text\n');

  await expect(user1Page.getByRole("figure")).toHaveCount(1);
  await expect(user2Page.getByRole("figure")).toHaveCount(1);

  await context.close();
});

test('user should disconnect after timeout', async ({ browser }) => {
  test.slow();

  const context = await browser.newContext();

  const user1Page = await context.newPage();
  await user1Page.goto('/automerge:2faDyxnoGZ4MNd5JhTjc1wvFMMHK');

  const user2Page = await context.newPage();
  await user2Page.goto('/automerge:2faDyxnoGZ4MNd5JhTjc1wvFMMHK');

  const monacoEditor1 = user1Page.locator(".monaco-editor").first();
  await monacoEditor1.click();

  const monacoEditor2 = user2Page.locator(".monaco-editor").first();
  await monacoEditor2.click();

  await expect(user1Page.getByRole("figure")).toHaveCount(1);
  await expect(user2Page.getByRole("figure")).toHaveCount(1);

  await user2Page.close();

  await expect(user1Page.getByRole("figure")).toHaveCount(0, { timeout: 15000 });

  await context.close();
});