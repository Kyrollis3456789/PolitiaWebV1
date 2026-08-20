'use server';

import { createClient } from '@/lib/supabase/server';
import { Country, Governorate, City } from '@/types/database.types';

export interface WorldLocationsData {
  countries: Country[];
  governorates: Governorate[];
  cities: City[];
}

/**
 * Fetches all world countries, governorates/provinces, and cities from Supabase.
 */
export async function fetchWorldLocationsAction(): Promise<{
  success: boolean;
  data?: WorldLocationsData;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [countriesRes, govRes, citiesRes] = await Promise.all([
      supabase.from('countries').select('id, code, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('governorates').select('id, country_id, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('cities').select('id, governorate_id, name_en, name_ar').order('name_en', { ascending: true }),
    ]);

    if (countriesRes.error) throw countriesRes.error;
    if (govRes.error) throw govRes.error;
    if (citiesRes.error) throw citiesRes.error;

    return {
      success: true,
      data: {
        countries: (countriesRes.data as Country[]) || [],
        governorates: (govRes.data as Governorate[]) || [],
        cities: (citiesRes.data as City[]) || [],
      },
    };
  } catch (err: any) {
    console.error('Error fetching world locations:', err);
    return {
      success: false,
      error: err.message || 'Failed to load locations',
    };
  }
}
