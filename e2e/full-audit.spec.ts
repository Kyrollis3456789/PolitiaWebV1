import { test, expect, Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';

const outDir = path.resolve('screenshots');

async function ensureDir() {
  await fs.mkdir(outDir, { recursive: true });
}

async function saveShot(page: Page, name: string) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: true });
}

function exactButton(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true });
}

async function clickNext(page: Page) {
  await exactButton(page, 'Next').click({ timeout: 15000 });
}

async function fillOtp(page: Page, code: string) {
  const inputs = page.locator('input');
  const count = await inputs.count();
  for (let i = 0; i < Math.min(count, code.length); i++) {
    await inputs.nth(i).fill(code[i], { timeout: 15000 });
  }
}

async function waitForHeading(page: Page, heading: string) {
  await page.getByRole('heading', { name: heading, exact: true }).waitFor({ state: 'visible', timeout: 15000 });
}

async function fillIfVisible(page: Page, role: 'textbox' | 'combobox', name: string, value: string) {
  const loc = page.getByRole(role, { name, exact: true });
  if (await loc.count()) {
    if (role === 'textbox') {
      await loc.fill(value, { timeout: 15000 });
    } else {
      await loc.selectOption({ label: value }, { timeout: 15000 }).catch(async () => {
        await loc.selectOption(value, { timeout: 15000 });
      });
    }
  }
}

async function openRegisterAtStart(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'At Church - Coptic Orthodox', exact: true })).toBeVisible();
  await saveShot(page, 'desktop_01_splash.png');

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  await saveShot(page, 'desktop_02_login.png');

  await page.goto('/forgot-password');
  await expect(page.getByRole('heading', { name: 'Find your account', exact: true })).toBeVisible();
  await saveShot(page, 'desktop_03_forgot.png');

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Full Name (English)', exact: true })).toBeVisible();
}

async function runRegisterDesktop(page: Page) {
  await fillIfVisible(page, 'textbox', 'Full Name (English)', 'Ahmed Samir Fathy Ibrahim');
  await saveShot(page, 'desktop_04_register_step1.png');
  await clickNext(page);

  await fillIfVisible(page, 'textbox', 'Full Name (Arabic)', 'أحمد سمير فتحي إبراهيم');
  await clickNext(page);

  await page.getByTestId('gender-option-male').click({ timeout: 15000 });
  await clickNext(page);

  await fillIfVisible(page, 'textbox', 'Date of Birth', '1998-04-17');
  await clickNext(page);

  await fillIfVisible(page, 'textbox', 'National ID (14 Digits)', '29804172112317');
  await saveShot(page, 'desktop_05_register_step2.png');
  if (await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).count()) {
    await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).click({ timeout: 15000 });
    await page.waitForTimeout(1200);
    await fillOtp(page, '123456');
    if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
      await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
    }
  }

  if (await page.getByRole('heading', { name: 'Email Address', exact: true }).count()) {
    await waitForHeading(page, 'Email Address');
  }
  await fillIfVisible(page, 'textbox', 'Email Address (Optional)', 'maikelkyrollis@gmail.com');
  if (await page.getByRole('button', { name: 'Send Verification Code', exact: true }).count()) {
    await page.getByRole('button', { name: 'Send Verification Code', exact: true }).click({ timeout: 15000 });
    await page.waitForTimeout(1200);
    await fillOtp(page, '123456');
    if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
      await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
    }
  }

  if (await page.getByRole('heading', { name: 'Profile Picture', exact: true }).count()) {
    await waitForHeading(page, 'Profile Picture');
  }
  const upload = page.getByRole('button', { name: 'Upload', exact: true });
  if (await upload.count()) {
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 });
    await upload.click({ timeout: 15000 });
    const chooser = await chooserPromise;
    await chooser.setFiles(path.resolve('public/logo.webp'));
  }
  const apply = page.getByRole('button', { name: 'Apply & Save', exact: true });
  if (await apply.count()) {
    await apply.click({ timeout: 15000 });
  }
  await saveShot(page, 'desktop_06_register_step3.png');
  if (await page.getByRole('heading', { name: 'Family Links & Household', exact: true }).count()) {
    await waitForHeading(page, 'Family Links & Household');
  }
  if (await exactButton(page, 'Next').count()) {
    await clickNext(page);
  }

  await page.getByRole('button', { name: 'Single', exact: true }).click({ timeout: 15000 }).catch(() => {});
  await waitForHeading(page, 'Family Links & Household');
  await clickNext(page);

  const fatherTab = page.getByTestId('family-card-father-tab-manual');
  if (await fatherTab.count()) await fatherTab.click({ timeout: 15000 });
  await page.getByPlaceholder('Full Name').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const fullNameFields = page.getByPlaceholder('Full Name');
  const phoneFields = page.getByPlaceholder('01012345678');
  await fullNameFields.nth(0).fill('Mina', { timeout: 15000 });
  await phoneFields.nth(0).fill('01012345679', { timeout: 15000 });
  await fullNameFields.nth(1).fill('Mary', { timeout: 15000 });
  await phoneFields.nth(1).fill('01012345680', { timeout: 15000 });
  await saveShot(page, 'desktop_07_register_step4.png');
  await expect(exactButton(page, 'Next')).toBeEnabled({ timeout: 15000 });
  await clickNext(page);

  const educationButton = page.getByRole('button', { name: 'University', exact: true });
  if (await educationButton.count()) await educationButton.click({ timeout: 15000 });
  await waitForHeading(page, 'Educational Stage / Career');
  await clickNext(page);
  await saveShot(page, 'desktop_08_register_step5.png');
  await waitForHeading(page, 'Educational Stage / Career');
  await clickNext(page);

  await page.getByRole('combobox').first().selectOption({ index: 0 }).catch(() => {});
  await saveShot(page, 'desktop_09_register_step6.png');
  await clickNext(page);

  await clickNext(page).catch(() => {});
  await saveShot(page, 'desktop_10_register_step7.png');
}

async function runMobilePass(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await saveShot(page, 'mobile_01_splash.png');
  await page.goto('/login');
  await saveShot(page, 'mobile_02_login.png');
  await page.goto('/forgot-password');
  await saveShot(page, 'mobile_03_forgot.png');
  await page.goto('/register');
  await saveShot(page, 'mobile_04_register_step1.png');

  // Use the same flow as desktop, compactly
  await page.getByRole('textbox', { name: 'Full Name (English)', exact: true }).fill('Ahmed Samir Fathy Ibrahim', { timeout: 15000 });
  await clickNext(page);
  await page.getByRole('textbox', { name: 'Full Name (Arabic)', exact: true }).fill('أحمد سمير فتحي إبراهيم', { timeout: 15000 });
  await clickNext(page);
  await page.getByTestId('gender-option-male').click({ timeout: 15000 });
  await clickNext(page);
  await page.getByRole('textbox', { name: 'Date of Birth', exact: true }).fill('1998-04-17', { timeout: 15000 });
  await clickNext(page);
  await page.getByRole('textbox', { name: 'National ID (14 Digits)', exact: true }).fill('29804172112317', { timeout: 15000 });
  await saveShot(page, 'mobile_05_register_step2.png');
  if (await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).count()) {
    await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).click({ timeout: 15000 });
    await page.waitForTimeout(1200);
    await fillOtp(page, '123456');
    if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
      await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
    }
  }
  if (await page.getByRole('heading', { name: 'Profile Picture', exact: true }).count()) {
    await waitForHeading(page, 'Profile Picture');
  }
  await fillIfVisible(page, 'textbox', 'Email Address (Optional)', 'maikelkyrollis@gmail.com');
  const mobileUpload = page.getByRole('button', { name: 'Upload', exact: true });
  if (await mobileUpload.count()) {
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 });
    await mobileUpload.click({ timeout: 15000 });
    const chooser = await chooserPromise;
    await chooser.setFiles(path.resolve('public/logo.webp'));
    await page.getByRole('button', { name: 'Apply & Save', exact: true }).click({ timeout: 15000 }).catch(() => {});
  }
  await saveShot(page, 'mobile_06_register_step3.png');
  await waitForHeading(page, 'Family Links & Household');
  await clickNext(page);
  await page.getByRole('button', { name: 'Single', exact: true }).click({ timeout: 15000 }).catch(() => {});
  await waitForHeading(page, 'Family Links & Household');
  await clickNext(page);
  if (await page.getByTestId('family-card-father-tab-manual').count()) await page.getByTestId('family-card-father-tab-manual').click({ timeout: 15000 });
  await page.getByPlaceholder('Full Name').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const mFullNameFields = page.getByPlaceholder('Full Name');
  const mPhoneFields = page.getByPlaceholder('01012345678');
  await mFullNameFields.nth(0).fill('Mina', { timeout: 15000 });
  await mPhoneFields.nth(0).fill('01012345679', { timeout: 15000 });
  await mFullNameFields.nth(1).fill('Mary', { timeout: 15000 });
  await mPhoneFields.nth(1).fill('01012345680', { timeout: 15000 });
  await saveShot(page, 'mobile_07_register_step4.png');
  await clickNext(page);
  if (await page.getByRole('button', { name: 'University', exact: true }).count()) {
    await page.getByRole('button', { name: 'University', exact: true }).click({ timeout: 15000 });
  }
  await waitForHeading(page, 'Educational Stage / Career');
  await page.getByRole('button', { name: 'Next', exact: true }).click({ timeout: 15000 });
  await saveShot(page, 'mobile_08_register_step5.png');
  await page.getByRole('button', { name: 'Next', exact: true }).click({ timeout: 15000 }).catch(() => {});
  await saveShot(page, 'mobile_09_register_step6.png');
  await page.getByRole('button', { name: 'Next', exact: true }).click({ timeout: 15000 }).catch(() => {});
  await saveShot(page, 'mobile_10_register_step7.png');
}

test('full audit desktop and mobile screenshots', async ({ page }) => {
  test.setTimeout(120000);
  await ensureDir();
  await page.setViewportSize({ width: 1440, height: 900 });
  await openRegisterAtStart(page);
  await runRegisterDesktop(page);
  await runMobilePass(page);
});
