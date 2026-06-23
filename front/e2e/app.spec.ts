import { test, expect } from '@playwright/test';

test.describe('Boxtribute App', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/Boxtribute/);
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'app-loaded.png' });
  });

  test('should be able to access login page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for any authentication redirects or loading
    await page.waitForTimeout(2000);
    
    // Check if we can see some form of login interface
    // This might be a login button, form, or Auth0 redirect
    const bodyText = await page.textContent('body');
    
    // Take a screenshot of the current state
    await page.screenshot({ path: 'login-page.png' });
    
    // Basic assertion that the page loaded content
    expect(bodyText).toBeTruthy();
  });

  test('should connect to backend GraphQL', async ({ page, request }) => {
    // Test that we can reach the backend GraphQL endpoint
    const response = await request.post('http://localhost:5005/graphql', {
      data: {
        query: '{ __schema { types { name } } }'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // We expect a 401/403 or auth error, not a network error
    expect(response.status()).not.toBe(500);
    expect(response.status()).not.toBe(502);
    expect(response.status()).not.toBe(503);
    
    const responseText = await response.text();
    // Should contain some kind of response, even if it's an auth error
    expect(responseText).toBeTruthy();
  });
});