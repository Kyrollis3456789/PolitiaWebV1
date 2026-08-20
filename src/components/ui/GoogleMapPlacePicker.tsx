'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { MapPin, Sparkles, Navigation } from 'lucide-react';
import { PlaceDetails } from '@/app/actions/places-search';

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
  defaultCenter = { lat: 27.1783, lng: 31.1859 }, // Assiut default center
  defaultZoom = 13,
  className = '',
}: GoogleMapPlacePickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>('');

  useEffect(() => {
    if (!isScriptLoaded) return;

    let isMounted = true;

    async function initMap() {
      try {
        if (typeof customElements !== 'undefined') {
          await customElements.whenDefined('gmp-map');
        }

        if (!mapContainerRef.current) return;

        const map = mapContainerRef.current.querySelector('gmp-map') as any;
        const marker = mapContainerRef.current.querySelector('gmp-advanced-marker') as any;
        const placePicker = mapContainerRef.current.querySelector('gmpx-place-picker') as any;

        if (!map || !placePicker) return;

        if (map.innerMap && (window as any).google?.maps?.InfoWindow) {
          const infowindow = new (window as any).google.maps.InfoWindow();

          map.innerMap.setOptions({
            mapTypeControl: false,
            streetViewControl: false,
          });

          const handlePlaceChange = () => {
            const place = placePicker.value;
            if (!place) return;

            if (!place.location) {
              if (infowindow) infowindow.close();
              if (marker) marker.position = null;
              return;
            }

            if (place.viewport) {
              map.innerMap.fitBounds(place.viewport);
            } else {
              map.center = place.location;
              map.zoom = 17;
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
          };

          placePicker.addEventListener('gmpx-placechange', handlePlaceChange);
        }
      } catch (err) {
        console.warn('Google Map Place Picker initialization warning:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [isScriptLoaded, isRtl, onPlaceSelect]);

  const defaultPlaceholder = isRtl
    ? 'ابحث عن مكان أو شارع على الخريطة...'
    : 'Search for a place or street on the map...';

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-md ${className}`}>
      {/* Load Google Maps Extended Component Library */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div ref={mapContainerRef} className="relative w-full h-[360px] sm:h-[420px]">
        {/* Google Maps Web Components */}
        {React.createElement('gmpx-api-loader', {
          key: apiKey,
          'solution-channel': 'GMP_GE_mapsandplacesautocomplete_v2',
        })}

        {React.createElement(
          'gmp-map',
          {
            center: `${defaultCenter.lat},${defaultCenter.lng}`,
            zoom: defaultZoom.toString(),
            'map-id': 'DEMO_MAP_ID',
            style: { width: '100%', height: '100%', display: 'block' },
          },
          React.createElement(
            'div',
            {
              slot: 'control-block-start-inline-start',
              className: 'p-3 w-full max-w-sm sm:max-w-md pointer-events-auto',
            },
            React.createElement('gmpx-place-picker', {
              placeholder: placeholder || defaultPlaceholder,
              style: { width: '100%', borderRadius: '12px' },
            })
          ),
          React.createElement('gmp-advanced-marker', {})
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
