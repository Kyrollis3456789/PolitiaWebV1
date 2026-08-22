# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-audit.spec.ts >> full audit desktop and mobile screenshots
- Location: e2e\full-audit.spec.ts:231:5

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('heading', { name: 'Family Links & Household', exact: true }) to be visible

```

# Page snapshot

```yaml
- generic [ref=f3e1]:
  - main [ref=f3e2]:
    - generic [ref=f3e3]:
      - generic:
        - img "Background"
      - generic [ref=f3e4]:
        - generic [ref=f3e6]:
          - generic [ref=f3e8]:
            - generic [ref=f3e9]:
              - img "Politia logo" [ref=f3e10]
              - generic [ref=f3e11]: Step 1 of 7 • Personal Info
            - generic [ref=f3e14]: Draft saved
          - heading "National ID" [level=1] [ref=f3e21]
          - paragraph [ref=f3e22]: Personal Info
        - generic [ref=f3e24]:
          - generic [ref=f3e26]:
            - generic [ref=f3e27]:
              - textbox "National ID (14 Digits)" [active] [ref=f3e28]: "29804172112317"
              - generic: National ID (14 Digits)
            - paragraph [ref=f3e29]:
              - generic [ref=f3e32]: Must contain 14 digits and match your registered date of birth
            - generic [ref=f3e33]: "📍 Governorate: Giza"
          - generic [ref=f3e35]:
            - button "Back" [ref=f3e36] [cursor=pointer]
            - button "Next" [ref=f3e38] [cursor=pointer]
      - generic [ref=f3e40]:
        - button "English (United States)" [ref=f3e42] [cursor=pointer]
        - generic [ref=f3e46]:
          - link "Sign in instead" [ref=f3e47] [cursor=pointer]:
            - /url: /login
          - link "Help" [ref=f3e48] [cursor=pointer]:
            - /url: /help
          - link "Privacy" [ref=f3e49] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=f3e50] [cursor=pointer]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=f3e56] [cursor=pointer]
  - alert [ref=f3e60]
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | import path from 'node:path';
  3   | import fs from 'node:fs/promises';
  4   | 
  5   | const outDir = path.resolve('screenshots');
  6   | 
  7   | async function ensureDir() {
  8   |   await fs.mkdir(outDir, { recursive: true });
  9   | }
  10  | 
  11  | async function saveShot(page: Page, name: string) {
  12  |   await page.screenshot({ path: path.join(outDir, name), fullPage: true });
  13  | }
  14  | 
  15  | function exactButton(page: Page, name: string) {
  16  |   return page.getByRole('button', { name, exact: true });
  17  | }
  18  | 
  19  | async function clickNext(page: Page) {
  20  |   await exactButton(page, 'Next').click({ timeout: 15000 });
  21  | }
  22  | 
  23  | async function fillOtp(page: Page, code: string) {
  24  |   const inputs = page.locator('input');
  25  |   const count = await inputs.count();
  26  |   for (let i = 0; i < Math.min(count, code.length); i++) {
  27  |     await inputs.nth(i).fill(code[i], { timeout: 15000 });
  28  |   }
  29  | }
  30  | 
  31  | async function waitForHeading(page: Page, heading: string) {
> 32  |   await page.getByRole('heading', { name: heading, exact: true }).waitFor({ state: 'visible', timeout: 15000 });
      |                                                                   ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  33  | }
  34  | 
  35  | async function fillIfVisible(page: Page, role: 'textbox' | 'combobox', name: string, value: string) {
  36  |   const loc = page.getByRole(role, { name, exact: true });
  37  |   if (await loc.count()) {
  38  |     if (role === 'textbox') {
  39  |       await loc.fill(value, { timeout: 15000 });
  40  |     } else {
  41  |       await loc.selectOption({ label: value }, { timeout: 15000 }).catch(async () => {
  42  |         await loc.selectOption(value, { timeout: 15000 });
  43  |       });
  44  |     }
  45  |   }
  46  | }
  47  | 
  48  | async function openRegisterAtStart(page: Page) {
  49  |   await page.goto('/');
  50  |   await expect(page.getByRole('heading', { name: 'At Church - Coptic Orthodox', exact: true })).toBeVisible();
  51  |   await saveShot(page, 'desktop_01_splash.png');
  52  | 
  53  |   await page.goto('/login');
  54  |   await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  55  |   await saveShot(page, 'desktop_02_login.png');
  56  | 
  57  |   await page.goto('/forgot-password');
  58  |   await expect(page.getByRole('heading', { name: 'Find your account', exact: true })).toBeVisible();
  59  |   await saveShot(page, 'desktop_03_forgot.png');
  60  | 
  61  |   await page.goto('/register');
  62  |   await expect(page.getByRole('heading', { name: 'Full Name (English)', exact: true })).toBeVisible();
  63  | }
  64  | 
  65  | async function runRegisterDesktop(page: Page) {
  66  |   await fillIfVisible(page, 'textbox', 'Full Name (English)', 'Ahmed Samir Fathy Ibrahim');
  67  |   await saveShot(page, 'desktop_04_register_step1.png');
  68  |   await clickNext(page);
  69  | 
  70  |   await fillIfVisible(page, 'textbox', 'Full Name (Arabic)', 'أحمد سمير فتحي إبراهيم');
  71  |   await clickNext(page);
  72  | 
  73  |   await page.getByTestId('gender-option-male').click({ timeout: 15000 });
  74  |   await clickNext(page);
  75  | 
  76  |   await fillIfVisible(page, 'textbox', 'Date of Birth', '1998-04-17');
  77  |   await clickNext(page);
  78  | 
  79  |   await fillIfVisible(page, 'textbox', 'National ID (14 Digits)', '29804172112317');
  80  |   await saveShot(page, 'desktop_05_register_step2.png');
  81  |   if (await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).count()) {
  82  |     await page.getByRole('button', { name: 'Send WhatsApp Code', exact: true }).click({ timeout: 15000 });
  83  |     await page.waitForTimeout(1200);
  84  |     await fillOtp(page, '123456');
  85  |     if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
  86  |       await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
  87  |       await page.waitForTimeout(1200);
  88  |     }
  89  |   }
  90  | 
  91  |   if (await page.getByRole('heading', { name: 'Email Address', exact: true }).count()) {
  92  |     await waitForHeading(page, 'Email Address');
  93  |   }
  94  |   await fillIfVisible(page, 'textbox', 'Email Address (Optional)', 'maikelkyrollis@gmail.com');
  95  |   if (await page.getByRole('button', { name: 'Send Verification Code', exact: true }).count()) {
  96  |     await page.getByRole('button', { name: 'Send Verification Code', exact: true }).click({ timeout: 15000 });
  97  |     await page.waitForTimeout(1200);
  98  |     await fillOtp(page, '123456');
  99  |     if (await page.getByRole('button', { name: 'Verify & Continue', exact: true }).count()) {
  100 |       await page.getByRole('button', { name: 'Verify & Continue', exact: true }).click({ timeout: 15000 });
  101 |       await page.waitForTimeout(1200);
  102 |     }
  103 |   }
  104 | 
  105 |   if (await page.getByRole('heading', { name: 'Profile Picture', exact: true }).count()) {
  106 |     await waitForHeading(page, 'Profile Picture');
  107 |   }
  108 |   const upload = page.getByRole('button', { name: 'Upload', exact: true });
  109 |   if (await upload.count()) {
  110 |     const chooserPromise = page.waitForEvent('filechooser', { timeout: 15000 });
  111 |     await upload.click({ timeout: 15000 });
  112 |     const chooser = await chooserPromise;
  113 |     await chooser.setFiles(path.resolve('public/logo.webp'));
  114 |   }
  115 |   const apply = page.getByRole('button', { name: 'Apply & Save', exact: true });
  116 |   if (await apply.count()) {
  117 |     await apply.click({ timeout: 15000 });
  118 |   }
  119 |   await saveShot(page, 'desktop_06_register_step3.png');
  120 |   if (await page.getByRole('heading', { name: 'Family Links & Household', exact: true }).count()) {
  121 |     await waitForHeading(page, 'Family Links & Household');
  122 |   }
  123 |   if (await exactButton(page, 'Next').count()) {
  124 |     await clickNext(page);
  125 |   }
  126 | 
  127 |   await page.getByRole('button', { name: 'Single', exact: true }).click({ timeout: 15000 }).catch(() => {});
  128 |   await waitForHeading(page, 'Family Links & Household');
  129 |   await clickNext(page);
  130 | 
  131 |   const fatherTab = page.getByTestId('family-card-father-tab-manual');
  132 |   if (await fatherTab.count()) await fatherTab.click({ timeout: 15000 });
```