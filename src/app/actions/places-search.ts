'use server';

/**
 * Server Action for Google Maps Places API Integration
 * Supports live Google Places API Autocomplete and Details with offline fallback.
 */

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
  types?: string[];
}

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  name?: string;
  streetNumber?: string;
  route?: string; // street name
  city?: string;
  governorate?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

// Built-in offline fallback database of common Egyptian landmarks, churches, streets & districts
const FALLBACK_PLACES: PlacePrediction[] = [
  // Cairo
  { placeId: 'eg_cairo_1', description: 'Nasr City, Cairo Governorate, Egypt', mainText: 'Nasr City', secondaryText: 'Cairo Governorate, Egypt', types: ['sublocality'] },
  { placeId: 'eg_cairo_2', description: 'Heliopolis, Cairo Governorate, Egypt', mainText: 'Heliopolis', secondaryText: 'Cairo Governorate, Egypt', types: ['sublocality'] },
  { placeId: 'eg_cairo_3', description: 'Maadi, Cairo Governorate, Egypt', mainText: 'Maadi', secondaryText: 'Cairo Governorate, Egypt', types: ['sublocality'] },
  { placeId: 'eg_cairo_4', description: 'El Tahrir Square, Downtown, Cairo, Egypt', mainText: 'El Tahrir Square', secondaryText: 'Downtown, Cairo, Egypt', types: ['point_of_interest'] },
  { placeId: 'eg_cairo_5', description: 'Abbassia, Cairo Governorate, Egypt', mainText: 'Abbassia', secondaryText: 'Cairo Governorate, Egypt', types: ['sublocality'] },
  { placeId: 'eg_cairo_6', description: 'Shoubra, Cairo Governorate, Egypt', mainText: 'Shoubra', secondaryText: 'Cairo Governorate, Egypt', types: ['sublocality'] },
  { placeId: 'eg_cairo_7', description: 'St. Mark Coptic Orthodox Cathedral, Abbassia, Cairo', mainText: 'St. Mark Cathedral', secondaryText: 'Abbassia, Cairo, Egypt', types: ['place_of_worship', 'church'] },
  { placeId: 'eg_cairo_8', description: 'The Hanging Church, Old Cairo, Egypt', mainText: 'The Hanging Church', secondaryText: 'Old Cairo, Egypt', types: ['place_of_worship', 'church'] },
  { placeId: 'eg_cairo_9', description: 'St. George Church, Old Cairo, Egypt', mainText: 'St. George Church', secondaryText: 'Old Cairo, Egypt', types: ['place_of_worship', 'church'] },
  { placeId: 'eg_cairo_10', description: 'El Gomhoureya Street, Cairo, Egypt', mainText: 'El Gomhoureya Street', secondaryText: 'Cairo, Egypt', types: ['route'] },
  { placeId: 'eg_cairo_11', description: 'Talaat Harb Street, Downtown, Cairo, Egypt', mainText: 'Talaat Harb Street', secondaryText: 'Downtown, Cairo, Egypt', types: ['route'] },
  // Alexandria
  { placeId: 'eg_alex_1', description: 'Sidi Gaber, Alexandria, Egypt', mainText: 'Sidi Gaber', secondaryText: 'Alexandria, Egypt', types: ['sublocality'] },
  { placeId: 'eg_alex_2', description: 'Smouha, Alexandria, Egypt', mainText: 'Smouha', secondaryText: 'Alexandria, Egypt', types: ['sublocality'] },
  { placeId: 'eg_alex_3', description: 'Montaza, Alexandria, Egypt', mainText: 'Montaza', secondaryText: 'Alexandria, Egypt', types: ['sublocality'] },
  { placeId: 'eg_alex_4', description: 'St. Mark Coptic Orthodox Cathedral, Alexandria, Egypt', mainText: 'St. Mark Cathedral', secondaryText: 'Alexandria, Egypt', types: ['place_of_worship', 'church'] },
  { placeId: 'eg_alex_5', description: 'Corniche El Nile, Alexandria, Egypt', mainText: 'Corniche El Nil', secondaryText: 'Alexandria, Egypt', types: ['route'] },
  // Assiut
  { placeId: 'eg_assiut_1', description: 'Assiut City, Assiut Governorate, Egypt', mainText: 'Assiut City', secondaryText: 'Assiut Governorate, Egypt', types: ['locality'] },
  { placeId: 'eg_assiut_2', description: 'El Quseyya, Assiut Governorate, Egypt', mainText: 'El Quseyya', secondaryText: 'Assiut Governorate, Egypt', types: ['locality'] },
  { placeId: 'eg_assiut_3', description: 'Manfalut, Assiut Governorate, Egypt', mainText: 'Manfalut', secondaryText: 'Assiut Governorate, Egypt', types: ['locality'] },
  { placeId: 'eg_assiut_4', description: 'Dairut, Assiut Governorate, Egypt', mainText: 'Dairut', secondaryText: 'Assiut Governorate, Egypt', types: ['locality'] },
  { placeId: 'eg_assiut_5', description: 'Al Muharraq Monastery, El Quseyya, Assiut, Egypt', mainText: 'Al Muharraq Monastery', secondaryText: 'El Quseyya, Assiut, Egypt', types: ['place_of_worship', 'church'] },
  { placeId: 'eg_assiut_6', description: 'Virgin Mary Monastery (Dronka), Assiut, Egypt', mainText: 'Virgin Mary Monastery Dronka', secondaryText: 'Assiut, Egypt', types: ['place_of_worship', 'church'] },
  { placeId: 'eg_assiut_7', description: 'El Gomhoureya Street, Assiut, Egypt', mainText: 'El Gomhoureya Street', secondaryText: 'Assiut, Egypt', types: ['route'] },
  { placeId: 'eg_assiut_8', description: 'Yousri Ragheb Street, Assiut, Egypt', mainText: 'Yousri Ragheb Street', secondaryText: 'Assiut, Egypt', types: ['route'] },
];

/**
 * Searches places via Google Maps Places API Autocomplete.
 */
export async function searchGooglePlacesAction(
  query: string,
  options?: {
    language?: 'ar' | 'en';
    country?: string; // default 'eg'
    types?: string; // e.g. 'address' | 'establishment' | 'geocode'
  }
): Promise<{ success: boolean; predictions: PlacePrediction[]; source: 'google' | 'fallback' }> {
  try {
    const rawTrimmed = (query || '').trim();
    if (!rawTrimmed || rawTrimmed.length < 2) {
      return { success: true, predictions: [], source: 'fallback' };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const lang = options?.language || 'ar';
    const country = options?.country || 'eg';

    // 1. If Google Maps API key is configured, query Google Places API
    if (apiKey) {
      try {
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          rawTrimmed
        )}&key=${apiKey}&language=${lang}&components=country:${country}`;

        if (options?.types) {
          url += `&types=${encodeURIComponent(options.types)}`;
        }

        const res = await fetch(url, {
          method: 'GET',
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && Array.isArray(data.predictions)) {
            const predictions: PlacePrediction[] = data.predictions.map((p: any) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || '',
              types: p.types || [],
            }));
            return { success: true, predictions, source: 'google' };
          }
        }
      } catch (apiErr) {
        console.warn('Google Places API network warning, using fallback:', apiErr);
      }
    }

    // 2. Intelligent local fallback matching (Arabic + English normalized)
    const qLower = rawTrimmed.toLowerCase();
    const matched = FALLBACK_PLACES.filter((p) => {
      const descLower = p.description.toLowerCase();
      const mainLower = p.mainText.toLowerCase();
      const secLower = (p.secondaryText || '').toLowerCase();
      return (
        descLower.includes(qLower) ||
        mainLower.includes(qLower) ||
        secLower.includes(qLower)
      );
    });

    return {
      success: true,
      predictions: matched.slice(0, 8),
      source: 'fallback',
    };
  } catch (err: any) {
    return {
      success: false,
      predictions: [],
      source: 'fallback',
    };
  }
}

/**
 * Fetches place details and coordinates from Google Places API.
 */
export async function getGooglePlaceDetailsAction(
  placeId: string,
  language: 'ar' | 'en' = 'ar'
): Promise<{ success: boolean; details?: PlaceDetails }> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (apiKey && !placeId.startsWith('eg_')) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&key=${apiKey}&language=${language}&fields=formatted_address,name,address_components,geometry`;

      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.result) {
          const r = data.result;
          let streetNumber = '';
          let route = '';
          let city = '';
          let governorate = '';
          let country = '';

          if (Array.isArray(r.address_components)) {
            for (const c of r.address_components) {
              const types = c.types || [];
              if (types.includes('street_number')) streetNumber = c.long_name;
              if (types.includes('route')) route = c.long_name;
              if (types.includes('locality') || types.includes('administrative_area_level_2')) city = c.long_name;
              if (types.includes('administrative_area_level_1')) governorate = c.long_name;
              if (types.includes('country')) country = c.long_name;
            }
          }

          return {
            success: true,
            details: {
              placeId,
              formattedAddress: r.formatted_address || r.name,
              name: r.name,
              streetNumber,
              route,
              city,
              governorate,
              country,
              lat: r.geometry?.location?.lat,
              lng: r.geometry?.location?.lng,
            },
          };
        }
      }
    }

    // Fallback place resolution
    const fallback = FALLBACK_PLACES.find((p) => p.placeId === placeId);
    if (fallback) {
      return {
        success: true,
        details: {
          placeId,
          formattedAddress: fallback.description,
          name: fallback.mainText,
          route: fallback.mainText,
          city: fallback.secondaryText,
        },
      };
    }

    return {
      success: true,
      details: {
        placeId,
        formattedAddress: placeId,
      },
    };
  } catch (err: any) {
    return {
      success: false,
    };
  }
}
