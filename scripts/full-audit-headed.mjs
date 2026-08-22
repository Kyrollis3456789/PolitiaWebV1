import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('screenshots');
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: false, slowMo: 400 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function shot(name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: true });
}

async function next() {
  await page.getByRole('button', { name: 'Next', exact: true }).click({ timeout: 15000 });
  await page.waitForTimeout(900);
}

async function fillIf(role, name, value) {
  const loc = page.getByRole(role, { name, exact: true });
  if (await loc.count()) await loc.fill(value, { timeout: 15000 });
}

async function runFlow(prefix) {
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(1000);
  await shot(`${prefix}_01_splash.png`);

  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  await shot(`${prefix}_02_login.png`);

  await page.goto('http://localhost:3000/forgot-password');
  await page.waitForTimeout(1000);
  await shot(`${prefix}_03_forgot.png`);

  await page.goto('http://localhost:3000/register');
  await page.waitForTimeout(1000);
  await fillIf('textbox', 'Full Name (English)', 'Ahmed Samir Fathy Ibrahim');
  await shot(`${prefix}_04_register_step1.png`);
  await next();

  await fillIf('textbox', 'Full Name (Arabic)', 'أحمد سمير فتحي إبراهيم');
  await next();
  await page.getByTestId('gender-option-male').click({ timeout: 15000 });
  await next();
  await fillIf('textbox', 'Date of Birth', '1998-04-17');
  await next();
  await fillIf('textbox', 'National ID (14 Digits)', '29804172112317');
  await shot(`${prefix}_05_register_step2.png`);

  if (await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).count()) {
    await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).click({ timeout: 15000 });
    await page.waitForTimeout(1200);
    const otp = page.locator('input');
    for (let i = 0; i < 6; i++) await otp.nth(i).fill('123456'[i], { timeout: 15000 });
    if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
      await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
    }
  }

  if (await page.getByRole('button', { name: 'Send Verification Code', exact: true }).count()) {
    await fillIf('textbox', 'Email Address (Optional)', 'maikelkyrollis@gmail.com');
    await page.getByRole('button', { name: 'Send Verification Code', exact: true }).click({ timeout: 15000 });
    await page.waitForTimeout(1200);
    const otp = page.locator('input');
    for (let i = 0; i < 6; i++) await otp.nth(i).fill('123456'[i], { timeout: 15000 });
    if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
      await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
      await page.waitForTimeout(1200);
    }
  }

  if (await page.getByRole('button', { name: 'Upload', exact: true }).count()) {
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 });
    await page.getByRole('button', { name: 'Upload', exact: true }).click({ timeout: 15000 });
    const chooser = await chooserPromise;
    await chooser.setFiles(path.resolve('public/logo.webp'));
    if (await page.getByRole('button', { name: 'Apply & Save', exact: true }).count()) {
      await page.getByRole('button', { name: 'Apply & Save', exact: true }).click({ timeout: 15000 });
    }
  }
  await shot(`${prefix}_06_register_step3.png`);
  if (await page.getByRole('button', { name: 'Next', exact: true }).count()) await next();

  if (await page.getByRole('button', { name: 'Single', exact: true }).count()) {
    await page.getByRole('button', { name: 'Single', exact: true }).click({ timeout: 15000 });
  }
  await next();

  if (await page.getByTestId('family-card-father-tab-manual').count()) {
    await page.getByTestId('family-card-father-tab-manual').click({ timeout: 15000 });
  }
  await page.waitForTimeout(1000);
  const familyNameInputs = page.locator('input[placeholder="Full Name"]');
  const familyPhoneInputs = page.locator('input[placeholder="01012345678"]');
  if (await familyNameInputs.count() < 2 || await familyPhoneInputs.count() < 2) {
    await page.waitForTimeout(1000);
  }
  await familyNameInputs.nth(0).fill('Mina', { timeout: 15000 }).catch(() => {});
  await familyPhoneInputs.nth(0).fill('01012345679', { timeout: 15000 }).catch(() => {});
  await familyNameInputs.nth(1).fill('Mary', { timeout: 15000 }).catch(() => {});
  await familyPhoneInputs.nth(1).fill('01098765432', { timeout: 15000 }).catch(() => {});
  await shot(`${prefix}_07_register_step4.png`);
  if (await page.getByRole('button', { name: 'Next', exact: true }).count()) await next();

  if (await page.getByRole('button', { name: 'University', exact: true }).count()) {
    await page.getByRole('button', { name: 'University', exact: true }).click({ timeout: 15000 });
    await page.waitForTimeout(700);
  }
  await shot(`${prefix}_08_register_step5.png`);
  if (await page.getByRole('button', { name: 'Next', exact: true }).count()) await next();

  await shot(`${prefix}_09_register_step6.png`);
  if (await page.getByRole('button', { name: 'Next', exact: true }).count()) await next();

  await shot(`${prefix}_10_register_step7.png`);
}

await runFlow('desktop');
await page.setViewportSize({ width: 390, height: 844 });
await runFlow('mobile');

await browser.close();
