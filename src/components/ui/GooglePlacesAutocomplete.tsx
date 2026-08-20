'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { MapPin, Search, Loader2, X, Building2, Church, Navigation, Sparkles } from 'lucide-react';
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
  defaultSuggestions?: { ar: string; en: string }[];
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
  defaultSuggestions = [],
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert default suggestions to PlacePrediction format for the dropdown downlist
  const formattedDefaultSuggestions: PlacePrediction[] = React.useMemo(() => {
    return defaultSuggestions.map((s, idx) => ({
      placeId: `sugg_${idx}`,
      description: isRtl ? s.ar : s.en,
      mainText: isRtl ? s.ar : s.en,
      secondaryText: isRtl ? 'اقتراح شائع' : 'Popular Street',
      types: ['route', 'street_address'],
    }));
  }, [defaultSuggestions, isRtl]);

  // Active items to show in dropdown
  const activeItems = React.useMemo(() => {
    if (predictions.length > 0) return predictions;
    if (!query.trim() && formattedDefaultSuggestions.length > 0) {
      return formattedDefaultSuggestions;
    }
    return [];
  }, [predictions, query, formattedDefaultSuggestions]);

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

  // Debounced places search while writing
  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(text);
    setSelectedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setPredictions([]);
      setIsOpen(formattedDefaultSuggestions.length > 0);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const res = await searchGooglePlacesAction(trimmed, {
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
    }, 200);
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setQuery(prediction.mainText);
    onChange(prediction.mainText);
    setIsOpen(false);
    setPredictions([]);
    setSelectedIndex(-1);

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
          route: prediction.mainText,
        });
      }
    }
  };

  const clearInput = () => {
    setQuery('');
    onChange('');
    setPredictions([]);
    setSelectedIndex(-1);
    setIsOpen(false);
  };

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || activeItems.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < activeItems.length) {
        e.preventDefault();
        handleSelectPrediction(activeItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (activeItems.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (isRtl ? 'ابحث في خرائط جوجل عن اسم الشارع أو العنوان...' : 'Search Google Maps for street or address...')
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

      {/* Dropdown Suggestions List (Downlist) */}
      {isOpen && activeItems.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn max-h-64 overflow-y-auto">
          {/* Header */}
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              {predictions.length > 0 ? (
                <>
                  <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{isRtl ? 'شوارع وعناوين مقترحة' : 'Street & Address Suggestions'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isRtl ? 'شوارع مقترحة في منطقتك' : 'Suggested Streets in Your Area'}</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Google Maps</span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {activeItems.map((p, idx) => {
              const isRoute = p.types?.includes('route') || p.types?.includes('street_address');
              const isChurch = p.types?.includes('church') || p.types?.includes('place_of_worship');
              const isBuilding = p.types?.includes('establishment') || p.types?.includes('point_of_interest');
              const isSelected = idx === selectedIndex;

              return (
                <li key={p.placeId || idx}>
                  <button
                    type="button"
                    onClick={() => handleSelectPrediction(p)}
                    className={clsx(
                      "w-full text-start px-3.5 py-2.5 flex items-start gap-2.5 transition cursor-pointer",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100"
                        : "hover:bg-blue-50/60 dark:hover:bg-slate-800/80"
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                      {isChurch ? (
                        <Church className="w-3.5 h-3.5 text-rose-500" />
                      ) : isRoute ? (
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
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
