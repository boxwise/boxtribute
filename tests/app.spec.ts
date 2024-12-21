/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test('Sanity check', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await expect(page.getByText("Settings")).toBeVisible();
});
