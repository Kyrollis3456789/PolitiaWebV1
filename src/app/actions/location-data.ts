'use server';

import { createClient } from '@/lib/supabase/server';

export interface LocationLookupResult {
  countries: { id: string; name_en: string; name_ar: string; code: string }[];
  governorates: { id: string; country_id: string; name_en: string; name_ar: string }[];
  cities: { id: string; governorate_id: string; name_en: string; name_ar: string }[];
  streets: { id: string; city_id?: string; governorate_id?: string; name_en: string; name_ar: string }[];
}

/**
 * Fetches all world location data (countries, governorates, cities, streets) strictly from Supabase.
 */
export async function fetchWorldLocationsAction(): Promise<{
  success: boolean;
  data?: LocationLookupResult;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [countryRes, govRes, cityRes, streetRes] = await Promise.all([
      supabase.from('countries').select('id, name_en, name_ar, code').order('name_en', { ascending: true }),
      supabase.from('governorates').select('id, country_id, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('cities').select('id, governorate_id, name_en, name_ar').order('name_en', { ascending: true }),
      supabase.from('streets').select('id, city_id, governorate_id, name_en, name_ar').order('name_en', { ascending: true }).limit(500),
    ]);

    if (countryRes.error) throw countryRes.error;
    if (govRes.error) throw govRes.error;
    if (cityRes.error) throw cityRes.error;

    return {
      success: true,
      data: {
        countries: (countryRes.data as any[]) || [],
        governorates: (govRes.data as any[]) || [],
        cities: (cityRes.data as any[]) || [],
        streets: (streetRes.data as any[]) || [],
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
 * Dynamically queries streets by city_id from Supabase database.
 */
export async function fetchStreetsByCityAction(cityId: string): Promise<{
  success: boolean;
  streets: { id: string; city_id?: string; governorate_id?: string; name_en: string; name_ar: string }[];
}> {
  if (!cityId) return { success: true, streets: [] };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('streets')
      .select('id, city_id, governorate_id, name_en, name_ar')
      .eq('city_id', cityId)
      .order('name_en', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      streets: (data as any[]) || [],
    };
  } catch (err: any) {
    console.error('Error fetching streets by city:', err);
    return {
      success: false,
      streets: [],
    };
  }
}

/**
 * Fetches all Dioceses, Churches, and Priests strictly from Supabase database (single source of truth).
 */
export async function fetchChurchesDataAction(): Promise<{
  success: boolean;
  dioceses: { id: string; name_en: string; name_ar: string; governorate_id?: string }[];
  churches: { id: string; diocese_id: string; city_id: string; name_en: string; name_ar: string; denomination?: string; image_url?: string }[];
  priests: { id: string; church_id?: string; diocese_id?: string; name_en: string; name_ar: string; title_en?: string; title_ar?: string }[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [dioRes, churchRes, priestRes] = await Promise.all([
      supabase.from('dioceses').select('id, name_en, name_ar, governorate_id').order('name_ar', { ascending: true }),
      supabase.from('churches').select('id, diocese_id, city_id, name_en, name_ar, denomination, image_url').order('name_ar', { ascending: true }),
      supabase.from('priests').select('id, church_id, diocese_id, name_en, name_ar, title_en, title_ar').order('name_ar', { ascending: true }),
    ]);

    if (dioRes.error) throw dioRes.error;
    if (churchRes.error) throw churchRes.error;

    return {
      success: true,
      dioceses: (dioRes.data as any[]) || [],
      churches: (churchRes.data as any[]) || [],
      priests: (priestRes.data as any[]) || [],
    };
  } catch (err: any) {
    console.error('Error fetching churches data strictly from Supabase:', err);
    return {
      success: false,
      dioceses: [],
      churches: [],
      priests: [],
      error: err.message || 'Failed to load churches from database',
    };
  }
}

/**
 * Fetches churches strictly matching the resolved Diocese / City from Supabase database, eliminating cross-diocese pollution.
 */
export async function fetchChurchesByLocationAction(params: {
  cityId?: string;
  governorateId?: string;
}): Promise<{
  success: boolean;
  churches: { id: string; diocese_id: string; city_id: string; name_en: string; name_ar: string; denomination?: string; image_url?: string }[];
  resolvedDiocese?: { id: string; name_en: string; name_ar: string };
  error?: string;
}> {
  const { cityId } = params;

  try {
    const supabase = await createClient();

    let targetDioceseId: string | null = null;
    let targetDioceseObj: { id: string; name_en: string; name_ar: string } | undefined = undefined;

    if (cityId) {
      const { data: sampleCityChurch } = await supabase
        .from('churches')
        .select('diocese_id')
        .eq('city_id', cityId)
        .limit(1)
        .maybeSingle();

      if (sampleCityChurch?.diocese_id) {
        targetDioceseId = sampleCityChurch.diocese_id;
        const { data: dioData } = await supabase
          .from('dioceses')
          .select('id, name_en, name_ar')
          .eq('id', targetDioceseId)
          .maybeSingle();
        if (dioData) targetDioceseObj = dioData;
      }
    }

    let churchQuery = supabase.from('churches').select('id, diocese_id, city_id, name_en, name_ar, denomination, image_url');

    if (targetDioceseId) {
      churchQuery = churchQuery.eq('diocese_id', targetDioceseId);
    } else if (cityId) {
      churchQuery = churchQuery.eq('city_id', cityId);
    }

    const { data: churchData, error: churchErr } = await churchQuery.order('name_ar', { ascending: true });
    if (churchErr) throw churchErr;

    return {
      success: true,
      churches: (churchData as any[]) || [],
      resolvedDiocese: targetDioceseObj,
    };
  } catch (err: any) {
    console.error('Error fetching churches by location from Supabase:', err);
    return {
      success: false,
      churches: [],
      error: err.message || 'Failed to query churches',
    };
  }
}

/**
 * Searches the Supabase `churches` table live by query string (matching name_en or name_ar).
 */
export async function searchChurchesDatabaseAction(query: string): Promise<{
  success: boolean;
  churches: { id: string; diocese_id: string; city_id: string; name_en: string; name_ar: string; denomination?: string; image_url?: string }[];
  error?: string;
}> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { success: true, churches: [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('churches')
      .select('id, diocese_id, city_id, name_en, name_ar, denomination, image_url')
      .or(`name_en.ilike.%${trimmed}%,name_ar.ilike.%${trimmed}%`)
      .limit(50);

    if (error) throw error;

    return {
      success: true,
      churches: (data as any[]) || [],
    };
  } catch (err: any) {
    console.error('Error searching churches from DB:', err);
    return {
      success: false,
      churches: [],
      error: err.message || 'Failed to search churches from database',
    };
  }
}
