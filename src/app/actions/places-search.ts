'use server';

/**
 * Server Action for Google Maps Places & Street Search API
 * Specialized for searching street names, avenues, roads, and addresses in Arabic & English.
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

// Built-in offline database of famous streets and roads in Egypt (Cairo, Giza, Alexandria, Assiut, etc.)
const EGYPT_STREETS_DATABASE: PlacePrediction[] = [
  // Cairo Streets
  { placeId: 'st_cairo_1', description: 'شارع الجمهورية، وسط البلد، القاهرة', mainText: 'شارع الجمهورية', secondaryText: 'وسط البلد، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_2', description: 'شارع طلعت حرب، وسط البلد، القاهرة', mainText: 'شارع طلعت حرب', secondaryText: 'وسط البلد، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_3', description: 'شارع قصر العيني، السيدة زينب، القاهرة', mainText: 'شارع قصر العيني', secondaryText: 'القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_4', description: 'شارع شبرا، شبرا مصر، القاهرة', mainText: 'شارع شبra', secondaryText: 'شبرا، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_5', description: 'شارع عباس العقاد، مدينة نصر، القاهرة', mainText: 'شارع عباس العقاد', secondaryText: 'مدينة نصر، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_6', description: 'شارع مكرم عبيد، مدينة نصر، القاهرة', mainText: 'شارع مكرم عبيد', secondaryText: 'مدينة نصر، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_7', description: 'شارع النزهة، مصر الجديدة، القاهرة', mainText: 'شارع النزهة', secondaryText: 'مصر الجديدة، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_8', description: 'شارع الميرغني، مصر الجديدة، القاهرة', mainText: 'شارع الميرغني', secondaryText: 'مصر الجديدة، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_9', description: 'شارع رمسيس، غمرة والعباسية، القاهرة', mainText: 'شارع رمسيس', secondaryText: 'القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_10', description: 'شارع 9، المعادي، القاهرة', mainText: 'شارع 9 المعادي', secondaryText: 'المعادي، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_11', description: 'شارع كورنيش النيل، القاهرة', mainText: 'شارع كورنيش النيل', secondaryText: 'القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_12', description: 'شارع أحمد فخري، مدينة نصر، القاهرة', mainText: 'شارع أحمد فخري', secondaryText: 'مدينة نصر، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_13', description: 'شارع الطيران، مدينة نصر، القاهرة', mainText: 'شارع الطيران', secondaryText: 'مدينة نصر، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_14', description: 'شارع مصطفى النحاس، مدينة نصر، القاهرة', mainText: 'شارع مصطفى النحاس', secondaryText: 'مدينة نصر، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_15', description: 'شارع خلوصي، شبرا، القاهرة', mainText: 'شارع خلوصي', secondaryText: 'شبرا، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_16', description: 'شارع روض الفرج، شبرا، القاهرة', mainText: 'شارع روض الفرج', secondaryText: 'شبرا، القاهرة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_cairo_17', description: 'شارع جسر السويس، عين شمس ومصر الجديدة، القاهرة', mainText: 'شارع جسر السويس', secondaryText: 'القاهرة، مصر', types: ['route', 'street_address'] },

  // Giza Streets
  { placeId: 'st_giza_1', description: 'شارع الهرم، الجيزة', mainText: 'شارع الهرم', secondaryText: 'الجيزة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_giza_2', description: 'شارع فيصل، الجيزة', mainText: 'شارع الملك فيصل', secondaryText: 'الجيزة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_giza_3', description: 'شارع جامعة الدول العربية، المهندسين، الجيزة', mainText: 'شارع جامعة الدول العربية', secondaryText: 'المهندسين، الجيزة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_giza_4', description: 'شارع البطل أحمد عبد العزيز، المهندسين، الجيزة', mainText: 'شارع البطل أحمد عبد العزيز', secondaryText: 'المهندسين، الجيزة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_giza_5', description: 'شارع التحرير، الدقي، الجيزة', mainText: 'شارع التحرير الدقي', secondaryText: 'الدقي، الجيزة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_giza_6', description: 'شارع مراد، الجيزة', mainText: 'شارع مراد', secondaryText: 'الجيزة، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_giza_7', description: 'شارع النيل، العجوزة والدقي، الجيزة', mainText: 'شارع النيل الجيزة', secondaryText: 'الدقي، الجيزة، مصر', types: ['route', 'street_address'] },

  // Alexandria Streets
  { placeId: 'st_alex_1', description: 'طريق الجيش (كورنيش الإسكندرية)، الإسكندرية', mainText: 'طريق الجيش كورنيش الإسكندرية', secondaryText: 'الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_2', description: 'شارع جمال عبد الناصر، ميامي والعصافرة، الإسكندرية', mainText: 'شارع جمال عبد الناصر', secondaryText: 'الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_3', description: 'شارع أبو قير (طريق الحرية)، الإسكندرية', mainText: 'شارع أبو قير (طريق الحرية)', secondaryText: 'الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_4', description: 'شارع فؤاد (شارع طارق بن زياد)، الإسكندرية', mainText: 'شارع فؤاد', secondaryText: 'وسط البلد، الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_5', description: 'شارع خالد بن الوليد، ميامي، الإسكندرية', mainText: 'شارع خالد بن الوليد', secondaryText: 'ميامي، الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_6', description: 'شارع بورسعيد، كليوباترا والإبراهيمية، الإسكندرية', mainText: 'شارع بورسعيد', secondaryText: 'الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_7', description: 'شارع مصطفى كامل، سموحة، الإسكندرية', mainText: 'شارع مصطفى كامل سموحة', secondaryText: 'سموحة، الإسكندرية، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_alex_8', description: 'شارع النبوي المهندس، المندرة، الإسكندرية', mainText: 'شارع النبوي المهندس', secondaryText: 'المندرة، الإسكندرية، مصر', types: ['route', 'street_address'] },

  // Assiut Streets
  { placeId: 'st_assiut_1', description: 'شارع الجمهورية، مدينة أسيوط، أسيوط', mainText: 'شارع الجمهورية أسيوط', secondaryText: 'مدينة أسيوط، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_2', description: 'شارع يسري راغب، مدينة أسيوط، أسيوط', mainText: 'شارع يسري راغب', secondaryText: 'مدينة أسيوط، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_3', description: 'شارع النميس، مدينة أسيوط، أسيوط', mainText: 'شارع النميس', secondaryText: 'مدينة أسيوط، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_4', description: 'شارع كورنيش الإبراهيمية، أسيوط', mainText: 'شارع كورنيش الإبراهيمية', secondaryText: 'أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_5', description: 'شارع المحطة، مدينة أسيوط، أسيوط', mainText: 'شارع المحطة', secondaryText: 'أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_6', description: 'شارع الجلاء، القوصية، أسيوط', mainText: 'شارع الجلاء', secondaryText: 'القوصية، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_7', description: 'شارع الرياح، القوصية، أسيوط', mainText: 'شارع الرياح', secondaryText: 'القوصية، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_8', description: 'شارع ترعة السنط، ديروط، أسيوط', mainText: 'شارع ترعة السنط', secondaryText: 'ديروط، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_9', description: 'شارع الجيش، منفلوط، أسيوط', mainText: 'شارع الجيش', secondaryText: 'منفلوط، أسيوط، مصر', types: ['route', 'street_address'] },
  { placeId: 'st_assiut_10', description: 'شارع الثورة، ديروط، أسيوط', mainText: 'شارع الثورة', secondaryText: 'ديروط، أسيوط، مصر', types: ['route', 'street_address'] },
];

/**
 * Searches places & streets via Google Maps Places API Autocomplete.
 */
export async function searchGooglePlacesAction(
  query: string,
  options?: {
    language?: 'ar' | 'en';
    country?: string; // default 'eg'
    types?: string; // e.g. 'address' | 'geocode' | 'establishment'
  }
): Promise<{ success: boolean; predictions: PlacePrediction[]; source: 'google' | 'fallback' }> {
  try {
    const rawTrimmed = (query || '').trim();
    if (!rawTrimmed || rawTrimmed.length < 1) {
      return { success: true, predictions: [], source: 'fallback' };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const lang = options?.language || 'ar';
    const country = options?.country || 'eg';

    // 1. If Google Maps API key is configured, query Google Places Autocomplete API
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
    const qClean = rawTrimmed
      .toLowerCase()
      .replace(/^(شارع|طريق|ميدان|ش|st|street|road|rd|avenue|ave)\s+/i, '')
      .trim();

    const matched = EGYPT_STREETS_DATABASE.filter((p) => {
      const descLower = p.description.toLowerCase();
      const mainLower = p.mainText.toLowerCase();
      const secLower = (p.secondaryText || '').toLowerCase();
      return (
        descLower.includes(rawTrimmed.toLowerCase()) ||
        mainLower.includes(rawTrimmed.toLowerCase()) ||
        secLower.includes(rawTrimmed.toLowerCase()) ||
        (qClean.length >= 2 && (descLower.includes(qClean) || mainLower.includes(qClean)))
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

    if (apiKey && !placeId.startsWith('st_') && !placeId.startsWith('eg_')) {
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
              route: route || r.name,
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
    const fallback = EGYPT_STREETS_DATABASE.find((p) => p.placeId === placeId);
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
