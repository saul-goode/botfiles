import { test, expect } from '@playwright/test';

test.describe('Tools E2E Tests', () => {
  test('Model Comparison tool should load models correctly', async ({ page }) => {
    await page.goto('/tools/comparison');
    
    // Wait for the page to load properly
    await page.waitForLoadState('networkidle');
    
    // Wait for the loading state to resolve (up to 10 seconds)
    await page.waitForTimeout(5000);
    
    // Check that "Loading models..." is NOT visible
    const loadingText = await page.getByText('Loading models...');
    const isVisible = await loadingText.isVisible();
    
    expect(isVisible).toBe(false);
    
    // Check that at least one model card is displayed
    const modelCards = await page.getByRole('card');
    const count = await modelCards.count();
    
    // Should have at least 1 model card
    expect(count).toBeGreaterThan(0);
  });

  test('Custom Model tool should load models correctly', async ({ page }) => {
    await page.goto('/tools/custom-model');
    
    // Wait for the page to load properly
    await page.waitForLoadState('networkidle');
    
    // Wait for the loading state to resolve (up to 10 seconds)
    await page.waitForTimeout(5000);
    
    // Check that "Loading models..." is NOT visible
    const loadingText = await page.getByText('Loading models...');
    const isVisible = await loadingText.isVisible();
    
    expect(isVisible).toBe(false);
    
    // Verify that we can see the form elements
    const modelIdInput = await page.getByLabel('Model ID *');
    expect(await modelIdInput.isVisible()).toBe(true);
  });
});