import { test, expect } from '@playwright/test';

test('has the correct title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Wolf Editor - Collaboration Made Easy/);
});

test('enter text in monaco editor and make a screenshot', async ({ page }) => {
  await page.goto('/');

  await page.waitForURL("/**")

  const monacoEditor = page.locator(".monaco-editor").first();
  await monacoEditor.click();

  await page.keyboard.type('This is a line of text\n');
  await page.keyboard.type('This is another line of text\n');

  await page.screenshot({ path: `test-results/example.png` });
});

test('two user collaborating', async ({ browser }) => {
  const context = await browser.newContext();

  const user1Page = await context.newPage();
  await user1Page.goto('/#automerge:3y6SECgdoojns17k88dx7hKZp6dj');

  const user2Page = await context.newPage();
  await user2Page.goto('/#automerge:3y6SECgdoojns17k88dx7hKZp6dj');

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

  await user1Page.screenshot({ path: `test-results/user1.png` });
  await user2Page.screenshot({ path: `test-results/user2.png` });

  await expect(user1Page.getByRole("figure")).toBeVisible();
  await expect(user2Page.getByRole("figure")).toBeVisible();

  await context.close();
});