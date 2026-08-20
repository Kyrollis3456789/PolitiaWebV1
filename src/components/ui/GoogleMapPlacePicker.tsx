'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { MapPin, Loader2, AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';

interface GoogleMapPlacePickerProps {
  apiKey?: string;
  onPlaceSelect?: (place: {
    formattedAddress: string;
    displayName: string;
    lat?: number;
    lng?: number;
    placeId?: string;
  }) => void;
  placeholder?: string;
  isRtl?: boolean;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
  className?: string;
}

export default function GoogleMapPlacePicker({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDyuH_NzsqPkmSdPAWfNTt9P3H63rZXLzs',
  onPlaceSelect,
  placeholder,
  isRtl = false,
  defaultCenter = { lat: 27.1783, lng: 31.1859 }, // Assiut
  defaultZoom = 13,
  className = '',
}: GoogleMapPlacePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Handle Google Maps Authentication and Referrer errors gracefully
    (window as any).gm_authFailure = () => {
      if (isMounted) {
        setAuthError('RefererNotAllowedMapError');
        setLoading(false);
      }
    };

    async function setupMap() {
      try {
        if (!containerRef.current) return;

        const mountPoint = containerRef.current;
        mountPoint.innerHTML = '';

        // 1. Create <gmpx-api-loader>
        const apiLoader = document.createElement('gmpx-api-loader');
        apiLoader.setAttribute('key', apiKey);
        apiLoader.setAttribute('solution-channel', 'GMP_GE_mapsandplacesautocomplete_v2');
        mountPoint.appendChild(apiLoader);

        // 2. Create <gmp-map>
        const map = document.createElement('gmp-map') as any;
        map.setAttribute('center', `${defaultCenter.lat},${defaultCenter.lng}`);
        map.setAttribute('zoom', defaultZoom.toString());
        map.setAttribute('map-id', 'DEMO_MAP_ID');
        map.style.width = '100%';
        map.style.height = '100%';
        map.style.display = 'block';

        // 3. Create control slot container
        const controlContainer = document.createElement('div');
        controlContainer.setAttribute('slot', 'control-block-start-inline-start');
        controlContainer.className = 'p-3 w-full max-w-sm sm:max-w-md pointer-events-auto';

        // 4. Create <gmpx-place-picker>
        const placePicker = document.createElement('gmpx-place-picker') as any;
        placePicker.setAttribute(
          'placeholder',
          placeholder || (isRtl ? 'ابحث عن مكان أو شارع على الخريطة...' : 'Search for a place or street on map...')
        );
        placePicker.style.width = '100%';
        placePicker.style.borderRadius = '12px';
        controlContainer.appendChild(placePicker);

        // 5. Create <gmp-advanced-marker>
        const marker = document.createElement('gmp-advanced-marker') as any;

        map.appendChild(controlContainer);
        map.appendChild(marker);
        mountPoint.appendChild(map);

        if (typeof customElements !== 'undefined') {
          await customElements.whenDefined('gmp-map');
          await customElements.whenDefined('gmpx-place-picker');
        }

        if (!isMounted) return;
        setLoading(false);

        let infowindow: any = null;

        const handlePlaceChange = () => {
          const place = placePicker.value;
          if (!place) return;

          if (!place.location) {
            if (infowindow) infowindow.close();
            if (marker) marker.position = null;
            return;
          }

          if (map.innerMap) {
            if (place.viewport) {
              map.innerMap.fitBounds(place.viewport);
            } else {
              map.center = place.location;
              map.zoom = 17;
            }

            if (!infowindow && (window as any).google?.maps?.InfoWindow) {
              infowindow = new (window as any).google.maps.InfoWindow();
            }

            if (marker) {
              marker.position = place.location;
            }

            const displayName = place.displayName || place.name || '';
            const formattedAddress = place.formattedAddress || place.formatted_address || displayName;

            setSelectedPlaceName(formattedAddress);

            if (infowindow && marker) {
              infowindow.setContent(
                `<div style="font-family: inherit; direction: ${isRtl ? 'rtl' : 'ltr'}; padding: 4px;">
                  <strong style="color: #1e293b; font-size: 14px;">${displayName}</strong><br>
                  <span style="color: #64748b; font-size: 12px;">${formattedAddress}</span>
                </div>`
              );
              infowindow.open(map.innerMap, marker);
            }

            if (onPlaceSelect) {
              const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
              const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
              onPlaceSelect({
                formattedAddress,
                displayName,
                lat,
                lng,
                placeId: place.id || place.placeId,
              });
            }
          }
        };

        placePicker.addEventListener('gmpx-placechange', handlePlaceChange);
      } catch (err) {
        console.warn('Google Maps Place Picker initialization:', err);
        if (isMounted) {
          setAuthError('init_failed');
          setLoading(false);
        }
      }
    }

    setupMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey, isRtl, defaultCenter.lat, defaultCenter.lng, defaultZoom, onPlaceSelect, placeholder]);

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-md ${className}`}>
      {/* Load Google Maps Extended Component Library */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
        strategy="afterInteractive"
      />

      <div className="relative w-full h-[360px] sm:h-[420px]">
        {/* Mounted Google Maps Web Components */}
        <div ref={containerRef} className="w-full h-full" />

        {loading && !authError && (
          <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isRtl ? 'جاري تحميل خريطة جوجل...' : 'Loading Google Maps...'}
            </span>
          </div>
        )}

        {authError && (
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isRtl ? 'مطلوب السماح بالرابط في Google Cloud Console' : 'Authorize URL in Google Cloud Console'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mb-3">
              {isRtl
                ? 'مفتاح Google Maps الخاص بك مقيد بنطاقات محددة. يرجى إضافة http://localhost:3000/* إلى قائمة المواقع المسموح بها في Google Cloud Console.'
                : 'Your Google Maps API key has website restrictions. Please add http://localhost:3000/* to your authorized HTTP referrers in Google Cloud Console.'}
            </p>
            <a
              href="https://console.cloud.google.com/apis/credentials?project=50359153115"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
            >
              <span>{isRtl ? 'فتح إعدادات المفتاح في Google Cloud' : 'Open Key Settings in Google Cloud'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {selectedPlaceName && (
        <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className="truncate">{selectedPlaceName}</span>
        </div>
      )}
    </div>
  );
}
