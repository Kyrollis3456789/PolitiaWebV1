'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { MapPin, Building, Home } from 'lucide-react';
import { Country, Governorate, City, Step5LocationPayload } from '@/types/database.types';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';

export interface Step5LocationsProps {
  countries?: Country[];
  governorates?: Governorate[];
  cities?: City[];
  defaultValues?: Partial<Step5LocationPayload>;
  isRtl?: boolean;
  onNext: (payload: Step5LocationPayload) => void;
  onBack: () => void;
}

// Built-in offline fallback data if database props are not yet loaded
const DEFAULT_COUNTRIES: Country[] = [
  { id: '11111111-1111-1111-1111-111111111111', code: 'EG', name_en: 'Egypt', name_ar: 'مصر' },
];

const DEFAULT_GOVERNORATES: Governorate[] = [
  { id: '22222222-2222-2222-2222-222222222221', country_id: '11111111-1111-1111-1111-111111111111', name_en: 'Cairo', name_ar: 'القاهرة' },
  { id: '22222222-2222-2222-2222-222222222222', country_id: '11111111-1111-1111-1111-111111111111', name_en: 'Alexandria', name_ar: 'الإسكندرية' },
  { id: '22222222-2222-2222-2222-222222222223', country_id: '11111111-1111-1111-1111-111111111111', name_en: 'Assiut', name_ar: 'أسيوط' },
];

const DEFAULT_CITIES: City[] = [
  // Cairo
  { id: '33333333-3333-3333-3333-333333333301', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Nasr City', name_ar: 'مدينة نصر' },
  { id: '33333333-3333-3333-3333-333333333302', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Heliopolis', name_ar: 'مصر الجديدة' },
  { id: '33333333-3333-3333-3333-333333333303', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Maadi', name_ar: 'المعادي' },
  { id: '33333333-3333-3333-3333-333333333304', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Downtown', name_ar: 'وسط البلد' },
  { id: '33333333-3333-3333-3333-333333333305', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Shoubra', name_ar: 'شبرا' },
  // Alexandria
  { id: '33333333-3333-3333-3333-333333333311', governorate_id: '22222222-2222-2222-2222-222222222222', name_en: 'Sidi Gaber', name_ar: 'سيدي جابر' },
  { id: '33333333-3333-3333-3333-333333333312', governorate_id: '22222222-2222-2222-2222-222222222222', name_en: 'Smouha', name_ar: 'سموحة' },
  { id: '33333333-3333-3333-3333-333333333313', governorate_id: '22222222-2222-2222-2222-222222222222', name_en: 'Montaza', name_ar: 'المنتزه' },
  { id: '33333333-3333-3333-3333-333333333314', governorate_id: '22222222-2222-2222-2222-222222222222', name_en: 'Mansheya', name_ar: 'المنشية' },
  // Assiut
  { id: '33333333-3333-3333-3333-333333333321', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'Assiut City', name_ar: 'مدينة أسيوط' },
  { id: '33333333-3333-3333-3333-333333333322', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'El Quseyya', name_ar: 'القوصية' },
  { id: '33333333-3333-3333-3333-333333333323', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'Manfalut', name_ar: 'منفلوط' },
  { id: '33333333-3333-3333-3333-333333333324', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'Dairut', name_ar: 'ديروط' },
  { id: '33333333-3333-3333-3333-333333333325', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'Abnoub', name_ar: 'أبنوب' },
  { id: '33333333-3333-3333-3333-333333333326', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'Sahel Selim', name_ar: 'ساحل سليم' },
];

export default function Step5Locations({
  countries = DEFAULT_COUNTRIES,
  governorates = DEFAULT_GOVERNORATES,
  cities = DEFAULT_CITIES,
  defaultValues,
  isRtl = false,
  onNext,
  onBack,
}: Step5LocationsProps) {
  // Use passed data or fallbacks
  const allCountries = countries.length > 0 ? countries : DEFAULT_COUNTRIES;
  const allGovernorates = governorates.length > 0 ? governorates : DEFAULT_GOVERNORATES;
  const allCities = cities.length > 0 ? cities : DEFAULT_CITIES;

  // Default initial country (Egypt if available)
  const initialCountryId =
    defaultValues?.country_id ||
    allCountries.find((c) => c.code === 'EG')?.id ||
    allCountries[0]?.id ||
    '';

  // --- State ---
  const [countryId, setCountryId] = useState<string>(initialCountryId);
  const [governorateId, setGovernorateId] = useState<string>(defaultValues?.governorate_id || '');
  const [cityId, setCityId] = useState<string>(defaultValues?.city_id || '');
  const [streetAddress, setStreetAddress] = useState<string>(defaultValues?.street_address || '');
  const [buildingNo, setBuildingNo] = useState<string>(defaultValues?.building_no || '');
  const [floorNo, setFloorNo] = useState<string>(defaultValues?.floor_no || '');
  const [apartment, setApartment] = useState<string>(defaultValues?.apartment || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Cascading Filtered Lists ---
  const availableGovernorates = useMemo(() => {
    if (!countryId) return [];
    return allGovernorates.filter((g) => g.country_id === countryId);
  }, [allGovernorates, countryId]);

  const availableCities = useMemo(() => {
    if (!governorateId) return [];
    return allCities.filter((c) => c.governorate_id === governorateId);
  }, [allCities, governorateId]);

  // Handle cascading reset when Country changes
  const handleCountryChange = (newCountryId: string) => {
    setCountryId(newCountryId);
    setGovernorateId('');
    setCityId('');
    setErrors((prev) => ({ ...prev, countryId: '', governorateId: '', cityId: '' }));
  };

  // Handle cascading reset when Governorate changes
  const handleGovernorateChange = (newGovId: string) => {
    setGovernorateId(newGovId);
    setCityId('');
    setErrors((prev) => ({ ...prev, governorateId: '', cityId: '' }));
  };

  // Validation & Next Handler
  const handleAdvance = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newErrors: Record<string, string> = {};

    if (!countryId) {
      newErrors.countryId = isRtl ? 'يرجى اختيار الدولة' : 'Please select a country';
    }
    if (!governorateId) {
      newErrors.governorateId = isRtl ? 'يرجى اختيار المحافظة' : 'Please select a governorate';
    }
    if (!cityId) {
      newErrors.cityId = isRtl ? 'يرجى اختيار المدينة / المركز' : 'Please select a city/district';
    }
    if (!streetAddress.trim()) {
      newErrors.streetAddress = isRtl ? 'يرجى إدخال اسم الشارع / العنوان' : 'Please enter street address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext({
      country_id: countryId,
      governorate_id: governorateId,
      city_id: cityId,
      street_address: streetAddress.trim(),
      building_no: buildingNo.trim() || undefined,
      floor_no: floorNo.trim() || undefined,
      apartment: apartment.trim() || undefined,
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
      {/* Vertically Centered Form Container */}
      <div className="flex-grow flex flex-col justify-center min-h-[300px] w-full py-4 animate-fadeIn">
        <div className="space-y-4 max-w-xl mx-auto w-full">
          
          {/* Row 1: Country Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isRtl ? 'الدولة' : 'Country'}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <select
              value={countryId}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={clsx(
                "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer",
                errors.countryId
                  ? "border-red-500 bg-red-50/20"
                  : "border-slate-300 dark:border-slate-700"
              )}
            >
              <option value="" className="bg-white dark:bg-slate-900">
                {isRtl ? 'اختر الدولة' : 'Select Country'}
              </option>
              {allCountries.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                  {isRtl ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
            {errors.countryId && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.countryId}</p>
            )}
          </div>

          {/* Row 2: Governorate and City (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Governorate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <span>{isRtl ? 'المحافظة' : 'Governorate'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={governorateId}
                onChange={(e) => handleGovernorateChange(e.target.value)}
                disabled={!countryId || availableGovernorates.length === 0}
                className={clsx(
                  "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                  errors.governorateId
                    ? "border-red-500 bg-red-50/20"
                    : "border-slate-300 dark:border-slate-700"
                )}
              >
                <option value="" className="bg-white dark:bg-slate-900">
                  {isRtl ? 'اختر المحافظة' : 'Select Governorate'}
                </option>
                {availableGovernorates.map((g) => (
                  <option key={g.id} value={g.id} className="bg-white dark:bg-slate-900">
                    {isRtl ? g.name_ar : g.name_en}
                  </option>
                ))}
              </select>
              {errors.governorateId && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.governorateId}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <span>{isRtl ? 'المدينة / المركز' : 'City / District'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setErrors((prev) => ({ ...prev, cityId: '' }));
                }}
                disabled={!governorateId || availableCities.length === 0}
                className={clsx(
                  "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                  errors.cityId
                    ? "border-red-500 bg-red-50/20"
                    : "border-slate-300 dark:border-slate-700"
                )}
              >
                <option value="" className="bg-white dark:bg-slate-900">
                  {isRtl ? 'اختر المدينة' : 'Select City'}
                </option>
                {availableCities.map((ct) => (
                  <option key={ct.id} value={ct.id} className="bg-white dark:bg-slate-900">
                    {isRtl ? ct.name_ar : ct.name_en}
                  </option>
                ))}
              </select>
              {errors.cityId && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.cityId}</p>
              )}
            </div>
          </div>

          {/* Row 3: Street Address with Google Maps Places Autocomplete */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isRtl ? 'اسم الشارع / العنوان (بحث في خرائط جوجل)' : 'Street Address (Search on Google Maps)'}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <GooglePlacesAutocomplete
              value={streetAddress}
              onChange={(val) => {
                setStreetAddress(val);
                setErrors((prev) => ({ ...prev, streetAddress: '' }));
              }}
              onPlaceSelect={(details) => {
                if (details.route || details.formattedAddress) {
                  setStreetAddress(details.route || details.formattedAddress);
                }
                if (details.streetNumber && !buildingNo) {
                  setBuildingNo(details.streetNumber);
                }
                setErrors((prev) => ({ ...prev, streetAddress: '' }));
              }}
              placeholder={isRtl ? 'ابحث في خرائط جوجل عن اسم الشارع أو العنوان...' : 'Search Google Maps for street or address...'}
              isRtl={isRtl}
              hasError={Boolean(errors.streetAddress)}
            />
            {errors.streetAddress && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.streetAddress}</p>
            )}
          </div>

          {/* Row 4: Building No, Floor No, Apartment (3 Columns) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Home className="w-3 h-3 text-slate-400" />
                <span>{isRtl ? 'رقم العمارة' : 'Bldg No.'}</span>
              </label>
              <input
                type="text"
                value={buildingNo}
                onChange={(e) => setBuildingNo(e.target.value)}
                placeholder={isRtl ? 'اختياري' : 'Optional'}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'الدور' : 'Floor'}
              </label>
              <input
                type="text"
                value={floorNo}
                onChange={(e) => setFloorNo(e.target.value)}
                placeholder={isRtl ? 'اختياري' : 'Optional'}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'رقم الشقة' : 'Apartment'}
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder={isRtl ? 'اختياري' : 'Optional'}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons (Pinned to bottom) */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-4 py-2 rounded-full cursor-pointer"
        >
          {isRtl ? 'السابق' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleAdvance}
          className="text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm bg-[#0B57D0] hover:bg-[#0842A0] text-white cursor-pointer"
        >
          {isRtl ? 'التالي' : 'Next'}
        </button>
      </div>
    </div>
  );
}
