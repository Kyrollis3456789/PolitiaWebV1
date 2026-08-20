'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { MapPin, Search, Loader2, X, Building2, Church } from 'lucide-react';
import {
  searchGooglePlacesAction,
  getGooglePlaceDetailsAction,
  PlacePrediction,
  PlaceDetails,
} from '@/app/actions/places-search';

export interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (details: PlaceDetails) => void;
  placeholder?: string;
  isRtl?: boolean;
  types?: string; // e.g. 'address' | 'establishment' | 'geocode'
  className?: string;
  hasError?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  isRtl = false,
  types,
  className,
  hasError = false,
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced places search
  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim() || text.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const res = await searchGooglePlacesAction(text, {
        language: isRtl ? 'ar' : 'en',
        country: 'eg',
        types,
      });

      if (res.success && res.predictions.length > 0) {
        setPredictions(res.predictions);
        setIsOpen(true);
      } else {
        setPredictions([]);
        setIsOpen(false);
      }
      setLoading(false);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setQuery(prediction.mainText);
    onChange(prediction.mainText);
    setIsOpen(false);
    setPredictions([]);

    if (onPlaceSelect) {
      setLoading(true);
      const detailsRes = await getGooglePlaceDetailsAction(
        prediction.placeId,
        isRtl ? 'ar' : 'en'
      );
      setLoading(false);

      if (detailsRes.success && detailsRes.details) {
        onPlaceSelect(detailsRes.details);
      } else {
        onPlaceSelect({
          placeId: prediction.placeId,
          formattedAddress: prediction.description,
          name: prediction.mainText,
        });
      }
    }
  };

  const clearInput = () => {
    setQuery('');
    onChange('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          placeholder={
            placeholder ||
            (isRtl ? 'ابحث في خرائط جوجل عن العنوان أو المعلم...' : 'Search Google Maps for address or place...')
          }
          className={clsx(
            "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
            isRtl ? "pl-16 pr-3.5" : "pr-16 pl-3.5",
            hasError ? "border-red-500 bg-red-50/20" : "border-slate-300 dark:border-slate-700",
            className
          )}
        />

        {/* Right action icons */}
        <div
          className={clsx(
            "absolute flex items-center gap-1.5",
            isRtl ? "left-2.5" : "right-2.5"
          )}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Autocomplete Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
          {/* Header */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span>{isRtl ? 'نتائج خرائط جوجل' : 'Google Maps Places'}</span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium">Google Maps</span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {predictions.map((p) => {
              const isChurch = p.types?.includes('church') || p.types?.includes('place_of_worship');
              const isBuilding = p.types?.includes('establishment') || p.types?.includes('point_of_interest');

              return (
                <li key={p.placeId}>
                  <button
                    type="button"
                    onClick={() => handleSelectPrediction(p)}
                    className="w-full text-start px-3.5 py-2.5 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 flex items-start gap-2.5 transition cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                      {isChurch ? (
                        <Church className="w-3.5 h-3.5 text-rose-500" />
                      ) : isBuilding ? (
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {p.mainText}
                      </p>
                      {p.secondaryText && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {p.secondaryText}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
