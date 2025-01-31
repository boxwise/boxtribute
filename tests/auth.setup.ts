import { test as setup, expect, chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const SOME_ADMIN_PATH = "playwright/.auth/some.admin.json";
const DEV_COORDINATOR_PATH = "playwright/.auth/dev_coordinator.json";
const DEV_VOLUNTEER_PATH = "playwright/.auth/dev_volunteer.json";
const WAREHOUSE_VOLUNTEER_PATH = "playwright/.auth/warehouse.volunteer.json";
const FREESHOP_VOLUNTEER_PATH = "playwright/.auth/freeshop.volunteer.json";

export function authSetup(email: string, path: string) {
  return async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password').fill('Browser_tests');
    await page.getByText('Continue').click();
    await expect(page.getByText("Settings")).toBeVisible({ timeout: 30000 });
    await page.context().storageState({ path });
    await browser.close();
  };
}

setup('authenticate as some.admin (god user)', async () => {
  authSetup("some.admin@boxtribute.org", SOME_ADMIN_PATH);
});

setup('authenticate as dev_coordinator', async () => {
  authSetup("dev_coordinator@boxcare.org", DEV_COORDINATOR_PATH);
});

setup('authenticate as dev_volunteer', async () => {
  authSetup("dev_volunteer@boxcare.org", DEV_VOLUNTEER_PATH);
});

setup('authenticate as warehouse.volunteer', async () => {
  authSetup("warehouse.volunteer@athens.org", WAREHOUSE_VOLUNTEER_PATH);
});

setup('authenticate as freeshop.volunteer', async () => {
  authSetup("freeshop.volunteer@athens.org", FREESHOP_VOLUNTEER_PATH);
});
