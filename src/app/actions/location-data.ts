'use server';

import { createClient } from '@/lib/supabase/server';
import { Country, Governorate, City, Street } from '@/types/database.types';

export interface WorldLocationsData {
  countries: Country[];
  governorates: Governorate[];
  cities: City[];
  streets: Street[];
}

/**
 * Fetches all world countries, governorates/provinces, cities, and streets from Supabase.
 */
export async function fetchWorldLocationsAction(): Promise<{
  success: boolean;
  data?: WorldLocationsData;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [countriesRes, govRes, citiesRes, streetsRes] = await Promise.all([
      supabase.from('countries').select('id, code, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('governorates').select('id, country_id, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('cities').select('id, governorate_id, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('streets').select('id, city_id, governorate_id, name_en, name_ar').order('name_en', { ascending: true }),
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
        streets: (streetsRes.data as Street[]) || [],
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

/**
 * Fetches streets filtered by Governorate or City from Supabase database.
 */
export async function fetchStreetsAction(
  governorateId?: string,
  cityId?: string
): Promise<{ success: boolean; streets: Street[] }> {
  try {
    const supabase = await createClient();
    let query = supabase.from('streets').select('id, city_id, governorate_id, name_en, name_ar');

    if (cityId) {
      query = query.eq('city_id', cityId);
    } else if (governorateId) {
      query = query.eq('governorate_id', governorateId);
    }

    const { data, error } = await query.order('name_en', { ascending: true });
    if (error) throw error;

    return {
      success: true,
      streets: (data as Street[]) || [],
    };
  } catch (err) {
    return {
      success: false,
      streets: [],
    };
  }
}

/**
 * Fetches all Dioceses and Churches from Supabase database.
 */
export async function fetchChurchesDataAction(): Promise<{
  success: boolean;
  dioceses: { id: string; name_en: string; name_ar: string; governorate_id?: string }[];
  churches: { id: string; diocese_id: string; city_id: string; name_en: string; name_ar: string }[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [dioRes, churchRes] = await Promise.all([
      supabase.from('dioceses').select('id, name_en, name_ar, governorate_id').order('name_ar', { ascending: true }),
      supabase.from('churches').select('id, diocese_id, city_id, name_en, name_ar').order('name_ar', { ascending: true }),
    ]);

    if (dioRes.error) throw dioRes.error;
    if (churchRes.error) throw churchRes.error;

    return {
      success: true,
      dioceses: (dioRes.data as any[]) || [],
      churches: (churchRes.data as any[]) || [],
    };
  } catch (err: any) {
    console.error('Error fetching churches data:', err);
    return {
      success: false,
      dioceses: [],
      churches: [],
      error: err.message || 'Failed to load churches',
    };
  }
}
