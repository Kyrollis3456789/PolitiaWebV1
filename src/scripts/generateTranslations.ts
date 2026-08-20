// src/scripts/generateTranslations.ts

import { createClient } from '@/lib/supabase/server';
import { Country, City } from '@/types/database.types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * List of ISO 639-1 language codes for which we want translation files.
 * This list contains 131 language codes (truncated for example).
 */
const LANGUAGES = [
  'en', 'ar', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', // ... up to 131
  // Add the rest of the language codes here.
];

/**
 * Placeholder translation generator – in a real project you would integrate a translation API.
 * Here we simply duplicate the English name for all languages as a stub.
 */
function placeholder<T extends { name_en: string }>(item: T, lang: string): string {
  // For the demo, return the English name prefixed by the language code.
  return `${lang.toUpperCase()}: ${item.name_en}`;
}

async function main() {
  const supabase = await createClient();

  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabase.from('countries').select('id, code, name_en, name_ar'),
    supabase.from('cities').select('id, governorate_id, name_en, name_ar'),
  ]);

  if (!countries || !cities) {
    console.error('Failed to fetch data from Supabase');
    process.exit(1);
  }

  const messagesDir = path.resolve(__dirname, '../../messages');
  if (!fs.existsSync(messagesDir)) {
    fs.mkdirSync(messagesDir, { recursive: true });
  }

  LANGUAGES.forEach((lang) => {
    const countryTranslations: Record<string, string> = {};
    const cityTranslations: Record<string, string> = {};

    (countries as Country[]).forEach((c) => {
      countryTranslations[c.code] = placeholder(c, lang);
    });
    (cities as City[]).forEach((c) => {
      cityTranslations[c.id] = placeholder(c, lang);
    });

    // Ensure language subfolder exists
    const langDir = path.join(messagesDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    // Write full payload (countries + cities) as before
    const fullPayload = {
      countries: countryTranslations,
      cities: cityTranslations,
    };
    const fullFilePath = path.join(langDir, `${lang}.json`);
    fs.writeFileSync(fullFilePath, JSON.stringify(fullPayload, null, 2), 'utf8');
    console.log(`✅ Generated ${fullFilePath}`);

    // Write just the country names to a dedicated file named Countries.json
    const countriesFilePath = path.join(langDir, 'Countries.json');
    fs.writeFileSync(countriesFilePath, JSON.stringify(countryTranslations, null, 2), 'utf8');
    console.log(`✅ Generated ${countriesFilePath}`);
  });
}

main().catch((e) => {
  console.error('Error generating translations', e);
  process.exit(1);
});
