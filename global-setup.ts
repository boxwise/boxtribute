import { chromium, expect, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
	const { baseURL, storageState } = config.projects[0].use;
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto(baseURL!);
	await page.getByLabel('Email address').fill('dev_coordinator@boxcare.org');
	await page.getByLabel('Password').fill('Browser_tests');
	await page.getByText('Continue').click();
	await expect(page.getByText("Settings")).toBeVisible({ timeout: 30000 });
	await page.context().storageState({ path: storageState as string });
	console.log("*********************************** CHECKPOINT ***********************************");
	await browser.close();
}

export default globalSetup;
