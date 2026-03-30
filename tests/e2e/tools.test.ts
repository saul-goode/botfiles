import { test, expect } from '@playwright/test';

test.describe('Tools pages', () => {
	test.describe('Config Generator', () => {
		test('loads models and renders the form', async ({ page }) => {
			await page.goto('/tools/config');

			// Models loaded count should be visible
			await expect(page.getByText(/\d+ models loaded/)).toBeVisible();

			// Section tabs should be present
			await expect(page.getByRole('heading', { name: 'openclaw.json' })).toBeVisible();
		});
	});

	test.describe('Model Comparison', () => {
		test('renders provider selection buttons', async ({ page }) => {
			await page.goto('/tools/comparison');

			await expect(page.getByRole('heading', { name: '1. Choose Providers' })).toBeVisible();

			// At least some provider buttons should be present
			await expect(page.getByText('OpenAI')).toBeVisible();
			await expect(page.getByText('Anthropic')).toBeVisible();
		});

		test('selecting a provider reveals its models', async ({ page }) => {
			await page.goto('/tools/comparison');

			// Click a provider
			await page.getByText('Anthropic').click();

			// Step 2 should now be visible
			await expect(page.getByRole('heading', { name: '2. Select Models' })).toBeVisible();

			// Should show at least one Anthropic model
			await expect(page.getByText('Claude', { exact: false }).first()).toBeVisible();
		});

		test('selecting models shows the comparison table', async ({ page }) => {
			await page.goto('/tools/comparison');

			// Select Anthropic provider
			await page.getByText('Anthropic').click();

			// Click "Select all" for the Anthropic group
			await page.getByText('Select all').click();

			// Comparison table should appear
			await expect(page.getByRole('heading', { name: 'Comparison', exact: true })).toBeVisible();
		});

		test('clear all resets selection', async ({ page }) => {
			await page.goto('/tools/comparison');

			await page.getByText('Anthropic').click();
			await page.getByText('Select all').click();

			// Comparison table visible
			await expect(page.getByRole('heading', { name: 'Comparison', exact: true })).toBeVisible();

			// Clear all
			await page.getByText('Clear all').click();

			// Comparison table and step 2 should be gone
			await expect(page.getByRole('heading', { name: 'Comparison', exact: true })).not.toBeVisible();
			await expect(page.getByRole('heading', { name: '2. Select Models' })).not.toBeVisible();
		});
	});

	test.describe('Custom Model', () => {
		test('renders the add model form', async ({ page }) => {
			await page.goto('/tools/custom-model');

			await expect(page.getByLabel('Model ID *')).toBeVisible();
			await expect(page.getByLabel('Model Label *')).toBeVisible();
			await expect(page.getByText('Add to List')).toBeVisible();
		});

		test('can add and remove a custom model', async ({ page }) => {
			await page.goto('/tools/custom-model');

			// Fill in required fields
			await page.getByLabel('Model ID *').fill('test/my-model');
			await page.getByLabel('Model Label *').fill('My Test Model');

			// Add it
			await page.getByText('Add to List').click();

			// Should appear in the list
			await expect(page.getByText('My Test Model')).toBeVisible();
			await expect(page.getByText('test/my-model')).toBeVisible();

			// Remove it
			await page.getByText('Remove').click();

			// Should be gone
			await expect(page.getByText('My Test Model')).not.toBeVisible();
		});
	});
});
