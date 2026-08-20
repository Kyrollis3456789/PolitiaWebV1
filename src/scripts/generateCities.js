const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local dynamically if present without hardcoding secrets
let envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqmkxrftxhgyixwtkuyf.supabase.co';
let envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const envFile = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      envUrl = trimmed.split('=')[1].trim();
    } else if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=')) {
      envKey = trimmed.split('=')[1].trim();
    }
  }
}

const supabase = createClient(envUrl, envKey);
const messagesDir = path.resolve(__dirname, '../../messages');

function getCityTranslation(nameEn, nameAr, locale) {
  if (locale.startsWith('ar-') || locale === 'arc' || locale === 'syc' || locale.startsWith('cop-')) {
    return nameAr || nameEn;
  }
  return nameEn;
}

async function run() {
  if (!fs.existsSync(messagesDir)) {
    console.error('messages directory not found:', messagesDir);
    process.exit(1);
  }

  // Fetch all cities from Supabase (up to 1000)
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, name_en, name_ar')
    .order('name_en')
    .limit(1000);

  if (error || !cities) {
    console.error('Error fetching cities from Supabase:', error);
    process.exit(1);
  }

  console.log(`Fetched ${cities.length} cities from Supabase.`);

  const entries = fs.readdirSync(messagesDir, { withFileTypes: true });
  const languageDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  console.log(`Found ${languageDirs.length} language folders in messages.`);

  let totalUpdated = 0;

  for (const lang of languageDirs) {
    const langPath = path.join(messagesDir, lang);
    const cityMap = {};

    for (const c of cities) {
      const trans = getCityTranslation(c.name_en, c.name_ar, lang);
      cityMap[c.id] = trans;
      const normalizedKey = c.name_en.toLowerCase().replace(/[^a-z0-9]/g, '_');
      cityMap[normalizedKey] = trans;
    }

    // Write Cities.json
    const citiesFile = path.join(langPath, 'Cities.json');
    fs.writeFileSync(citiesFile, JSON.stringify(cityMap, null, 2), 'utf8');

    totalUpdated++;
  }

  console.log(`Successfully generated Cities.json for ${cities.length} cities across all ${totalUpdated} language directories!`);
}

run().catch((err) => {
  console.error('Failed to generate cities:', err);
  process.exit(1);
});
