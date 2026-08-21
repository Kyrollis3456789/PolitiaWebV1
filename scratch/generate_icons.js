const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputLogo = path.join(__dirname, '../public/logo.png');
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from:', inputLogo);

  // 192x192
  await sharp(inputLogo).resize(192, 192).toFile(path.join(iconsDir, 'icon-192x192.png'));
  console.log('✓ Created icon-192x192.png');

  // 512x512
  await sharp(inputLogo).resize(512, 512).toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('✓ Created icon-512x512.png');

  // maskable 512x512
  await sharp(inputLogo).resize(512, 512).toFile(path.join(iconsDir, 'maskable-icon-512x512.png'));
  console.log('✓ Created maskable-icon-512x512.png');

  // apple-touch-icon 180x180
  await sharp(inputLogo).resize(180, 180).toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // favicon.ico (32x32 png / ico)
  await sharp(inputLogo).resize(32, 32).toFile(path.join(__dirname, '../public/favicon.ico'));
  console.log('✓ Created favicon.ico');

  console.log('All PWA icon assets generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
