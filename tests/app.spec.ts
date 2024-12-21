/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const fakeCamArgs = (qrCodeRelativePath: string) => ({
  args: [
    "--auto-accept-camera-and-microphone-capture",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-video-capture=${path.join(
      path.resolve(__dirname, '..'),
      qrCodeRelativePath,
    )}`,
  ],
});

test('Sanity check', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await expect(page.getByText("Settings")).toBeVisible();
});

// TODO: rename qrreader specs to their actual names

test('QRReader 1', async () => {
  const browser = await chromium.launch(fakeCamArgs("tests/qrCodes/boxBase1.mjpeg"));
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/bases/2/');
  await expect(page.getByText(/This box it at base Lesvos, which belongs to organization BoxAid./)).toBeVisible();
});

test('QRReader 2', async () => {
  const browser = await chromium.launch(fakeCamArgs("tests/qrCodes/boxBase2.mjpeg"));
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/bases/2/');
  await expect(page.getByText("Box 38216171")).toBeVisible();
  await expect(page).toHaveURL(/.*\/bases\/2\/boxes\/38216171/);
});

test('QRReader 3', async () => {
  const browser = await chromium.launch(fakeCamArgs("tests/qrCodes/boxBase3.mjpeg"));
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/bases/2/');
  await expect(page.getByText("Box 81249458")).toBeVisible();
  await expect(page).toHaveURL(/.*\/bases\/3\/boxes\/81249458/);
});

test('QRReader 4', async () => {
  const browser = await chromium.launch(fakeCamArgs("tests/qrCodes/boxBase4.mjpeg"));
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/bases/2/');
  await expect(page.getByText(/This box it at base Athens, which belongs to organization BoxCare./)).toBeVisible();
});
