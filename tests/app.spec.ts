import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Boxtribute Web App', () => {
  test.beforeEach('Open Boxtribute', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  });

  test('Sanity check', async ({ page }) => {
    await expect(page.getByText("Settings")).toBeVisible();
  });

  // TODO: Fix auth setup and menu tests.
  test.describe('1.3 - Menus are available to the user depending on ABPs', async () => {
    test.skip("1.3.1 - Menus are available to the user depending on ABPs - freeshop.volunteer", async ({ page }) => {
      // test.use({ storageState: FREESHOP_VOLUNTEER_PATH });

      await expect(page.getByRole("button", { name: /Statistics/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Aid Inventory/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /Coordinator Admin/ })).not.toBeVisible();
    });

    test.skip("1.3.2 - Menus are available to the user depending on ABPs - warehouse.volunteer", async ({ page }) => {
      // test.use({ storageState: WAREHOUSE_VOLUNTEER_PATH });

      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.getByRole("button", { name: /Statistics/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Print Box Labels/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /Manage Boxes/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /Classic Manage Boxes/ })).not.toBeVisible();
    });

    test.skip("1.3.3 - Menus are available to the user depending on ABPs - dev_volunteer", async ({ page }) => {
      // test.use({ storageState: DEV_VOLUNTEER_PATH });

      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.getByRole("button", { name: /Statistics/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Aid Inventory/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /Coordinator Admin/ })).not.toBeVisible();
    });

    test("1.3.4 - Menus available to the user depending on ABPs - dev_coordinator", async ({ page }) => {
      // test.use({ storageState: DEV_COORDINATOR_PATH });

      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.getByRole("button", { name: /Statistics/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Aid Inventory/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Aid Transfers/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Beneficiaries/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Free Shop/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Coordinator Admin/ })).toBeVisible();
    });

    test.skip("1.3.5 - Menus available to the user depending on ABPs - some.admin (god user)", async ({ page }) => {
      // test.use({ storageState: SOME_ADMIN_PATH });

      await expect(page.getByText("Settings")).toBeVisible();
      await expect(page.getByRole("button", { name: /Statistics/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /Aid Inventory/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /Coordinator Admin/ })).not.toBeVisible();
    });
  });

  test.describe('3.1 - BoxView', async () => {
    test("3.1.1 - Initial load of Page", async ({ page }) => {
      await page.getByRole('button', { name: 'Aid Inventory' }).click();
      await page.getByText('Manage Boxes beta').click();
      await page.getByRole('cell', { name: '28504995' }).click();
      // 3.1.1.2 - Content: Heading renders correctly with valid box identifier
      await expect(page.getByTestId('box-header')).toContainText('Box 28504995');
      // 3.1.1.3 - Content: Renders sub heading with valid state for an Instock Box
      await expect(page.getByTestId('box-subheader')).toContainText('Status:');
      await expect(page.getByTestId('box-state')).toContainText('InStock');
      await expect(page.getByTestId('boxview-number-items')).toContainText('343x Inhalation device');
      // 3.1.1.5 - Content: Box Tags are shown correctly
      await expect(page.getByTestId('box-tags')).toContainText('two');
      // TODO: We shouldn't be testing CSS properties...
      // 3.1.1.3.1 - Content: State color for Instock Box is correct
      await expect(page.locator('span').filter({ hasText: 'two' }).first()).toHaveCSS('background', "rgb(249, 240, 179) none repeat scroll 0% 0% / auto padding-box border-box");
      await expect(page.getByTestId('box-tags')).toContainText('maintain');
      await expect(page.getByTestId('box-tags')).toContainText('or');
      await expect(page.getByTestId('box-sections')).toContainText('History:');
      await expect(page.getByTestId(/history-/).getByRole('paragraph')).toContainText(/Dev Coordinator on /);
      // 3.1.1.6 - Content: Comment section renders correctly
      await page.getByLabel('Edit box').click();
      await page.getByRole('textbox').click();
      await page.getByRole('textbox').fill('Good comment');
      await page.getByRole('button', { name: 'Update Box' }).click();
      await expect(page.getByTestId('box-sections')).toContainText('Comment: Good comment');
    });

    // TODO: add fixture for a box with legacy location and a legacy location
    test.skip("3.1.1.7 - Content: Display an warning note if a box is located in a legacy location", async ({ page }) => {
      await expect(page.getByText("Settings")).toBeVisible();
    });

    test("3.1.1.8 - Content: Display an info alert if a box status is Lost", async ({ page }) => {
      await page.getByRole('button', { name: 'Aid Inventory' }).click();
      await page.getByText('Manage Boxes beta').click();
      await page.getByRole('cell', { name: '28504995' }).click();
      await page.getByTestId('box-lost-btn').locator('span').first().click();
      await expect(page.getByRole('status')).toContainText('Box 28504995');
      await expect(page.getByRole('status')).toContainText('Successfully updated the box status to Lost');
      await expect(page.getByRole('alert')).toContainText('Note');
      await expect(page.getByRole('alert')).toContainText('To edit or move this box, remove the Lost status.');
      // 3.1.3.2.1 - Change state on Lost Toggled
      await expect(page.getByTestId('box-subheader')).toContainText('Status:');
      await expect(page.getByTestId('box-state')).toContainText('Lost');
    });

    test("3.1.1.9 - Content: Display an info alert if a box status is Scrap", async ({ page }) => {
      await page.getByRole('button', { name: 'Aid Inventory' }).click();
      await page.getByText('Manage Boxes beta').click();
      await page.getByRole('cell', { name: '28504995' }).click();
      // 3.1.3.1 - Change State to Scrap
      await page.getByTestId('box-scrap-btn').locator('span').first().click();
      await expect(page.getByRole('status')).toContainText('Box 28504995');
      await expect(page.getByRole('status')).toContainText('Successfully updated the box status to Scrap');
      await expect(page.getByRole('alert')).toContainText('Note');
      await expect(page.getByRole('alert')).toContainText('To edit or move this box, remove the Scrap status.');
      // 3.1.3.1.1 - Change state on Scrap Toggled
      await expect(page.getByTestId('box-subheader')).toContainText('Status:');
      await expect(page.getByTestId('box-state')).toContainText('Scrap');
    });

  });

  test.describe('3.1.2 - Change Number of Items', async () => {

  });

  test.describe('3.1.3 - Change State to Scrap and Lost', async () => {

  });
});
