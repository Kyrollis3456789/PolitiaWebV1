'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  MapPin,
  Building,
  Home,
  Crosshair,
  Loader2,
  Map as MapIcon,
  Search,
  Plus,
  Trash2,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Country, Governorate, City, Step5LocationPayload } from '@/types/database.types';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';
import GoogleMapPlacePicker from '@/components/ui/GoogleMapPlacePicker';
import { reverseGeocodeLocationAction } from '@/app/actions/places-search';
import { fetchWorldLocationsAction } from '@/app/actions/location-data';

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
  { id: '33333333-3333-3333-3333-333333333301', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Nasr City', name_ar: 'مدينة نصر' },
  { id: '33333333-3333-3333-3333-333333333302', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Heliopolis', name_ar: 'مصر الجديدة' },
  { id: '33333333-3333-3333-3333-333333333303', governorate_id: '22222222-2222-2222-2222-222222222221', name_en: 'Maadi', name_ar: 'المعادي' },
  { id: '33333333-3333-3333-3333-333333333321', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'Assiut City', name_ar: 'مدينة أسيوط' },
  { id: '33333333-3333-3333-3333-333333333322', governorate_id: '22222222-2222-2222-2222-222222222223', name_en: 'New Assiut', name_ar: 'أسيوط الجديدة' },
];

// Popular Street Recommendations grouped by Governorate
const POPULAR_STREET_SUGGESTIONS: Record<string, { ar: string; en: string }[]> = {
  cairo: [
    { ar: 'شارع الجمهورية', en: 'El Gomhoureya St.' },
    { ar: 'شارع طلعت حرب', en: 'Talaat Harb St.' },
    { ar: 'شارع عباس العقاد', en: 'Abbas El Akkad St.' },
    { ar: 'شارع مكرم عبيد', en: 'Makram Ebeid St.' },
    { ar: 'شارع شبرا', en: 'Shoubra St.' },
    { ar: 'شارع 9 المعادي', en: 'Street 9 Maadi' },
  ],
  alexandria: [
    { ar: 'طريق الجيش (الكورنيش)', en: 'El Geish Rd. (Corniche)' },
    { ar: 'شارع جمال عبد الناصر', en: 'Gamal Abdel Nasser St.' },
    { ar: 'شارع أبو قير (طريق الحرية)', en: 'Abou Qir St.' },
    { ar: 'شارع فؤاد', en: 'Fouad St.' },
    { ar: 'شارع سموحة', en: 'Smouha St.' },
  ],
  assiut: [
    { ar: 'شارع الجمهورية', en: 'El Gomhoureya St.' },
    { ar: 'شارع يسري راغب', en: 'Yousri Ragheb St.' },
    { ar: 'شارع النميس', en: 'El Nemis St.' },
    { ar: 'شارع المحطة', en: 'El Mahatta St.' },
    { ar: 'شارع الجلاء', en: 'El Galaa St.' },
    { ar: 'شارع الهلالي', en: 'El Helaly St.' },
    { ar: 'شارع المحافظة', en: 'El Mohafaza St.' },
  ],
};

const SECONDARY_ADDRESS_TYPES = [
  { id: 'work', ar: 'عنوان العمل / الوظيفة', en: 'Work / Workplace' },
  { id: 'second_home', ar: 'مقر إقامة ثانٍ', en: 'Second Residence' },
  { id: 'vacation', ar: 'سكن صيفي / شاليه', en: 'Vacation / Summer Home' },
  { id: 'family', ar: 'بيت العائلة / الوالدين', en: 'Family / Parents Home' },
  { id: 'other', ar: 'عنوان آخر', en: 'Other Address' },
];

export default function Step5Locations({
  countries,
  governorates,
  cities,
  defaultValues,
  isRtl = false,
  onNext,
  onBack,
}: Step5LocationsProps) {
  const [dbCountries, setDbCountries] = useState<Country[]>(countries || []);
  const [dbGovernorates, setDbGovernorates] = useState<Governorate[]>(governorates || []);
  const [dbCities, setDbCities] = useState<City[]>(cities || []);

  useEffect(() => {
    let isMounted = true;
    fetchWorldLocationsAction().then((res) => {
      if (isMounted && res.success && res.data) {
        if (res.data.countries.length > 0) setDbCountries(res.data.countries);
        if (res.data.governorates.length > 0) setDbGovernorates(res.data.governorates);
        if (res.data.cities.length > 0) setDbCities(res.data.cities);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const allCountries = dbCountries.length > 0 ? dbCountries : DEFAULT_COUNTRIES;
  const allGovernorates = dbGovernorates.length > 0 ? dbGovernorates : DEFAULT_GOVERNORATES;
  const allCities = dbCities.length > 0 ? dbCities : DEFAULT_CITIES;

  const initialCountryId =
    defaultValues?.country_id ||
    allCountries.find((c) => c.code === 'EG')?.id ||
    allCountries[0]?.id ||
    '';

  // --- Primary Address State ---
  const [countryId, setCountryId] = useState<string>(initialCountryId);
  const [governorateId, setGovernorateId] = useState<string>(defaultValues?.governorate_id || '');
  const [cityId, setCityId] = useState<string>(defaultValues?.city_id || '');
  const [streetAddress, setStreetAddress] = useState<string>(defaultValues?.street_address || '');
  const [buildingNo, setBuildingNo] = useState<string>(defaultValues?.building_no || '');
  const [floorNo, setFloorNo] = useState<string>(defaultValues?.floor_no || '');
  const [apartment, setApartment] = useState<string>(defaultValues?.apartment || '');

  // --- Secondary Address State ---
  const [hasSecondaryAddress, setHasSecondaryAddress] = useState<boolean>(
    defaultValues?.has_secondary_address || Boolean(defaultValues?.secondary_street_address)
  );
  const [secondaryAddressType, setSecondaryAddressType] = useState<string>(
    defaultValues?.secondary_address_type || 'work'
  );
  const [secondaryCountryId, setSecondaryCountryId] = useState<string>(
    defaultValues?.secondary_country_id || initialCountryId
  );
  const [secondaryGovernorateId, setSecondaryGovernorateId] = useState<string>(
    defaultValues?.secondary_governorate_id || ''
  );
  const [secondaryCityId, setSecondaryCityId] = useState<string>(
    defaultValues?.secondary_city_id || ''
  );
  const [secondaryStreetAddress, setSecondaryStreetAddress] = useState<string>(
    defaultValues?.secondary_street_address || ''
  );
  const [secondaryBuildingNo, setSecondaryBuildingNo] = useState<string>(
    defaultValues?.secondary_building_no || ''
  );
  const [secondaryFloorNo, setSecondaryFloorNo] = useState<string>(
    defaultValues?.secondary_floor_no || ''
  );
  const [secondaryApartment, setSecondaryApartment] = useState<string>(
    defaultValues?.secondary_apartment || ''
  );

  const [locatingGps, setLocatingGps] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Cascading Filtered Lists (Primary) ---
  const availableGovernorates = useMemo(() => {
    if (!countryId) return [];
    return allGovernorates.filter((g) => g.country_id === countryId);
  }, [allGovernorates, countryId]);

  const availableCities = useMemo(() => {
    if (!governorateId) return [];
    return allCities.filter((c) => c.governorate_id === governorateId);
  }, [allCities, governorateId]);

  const selectedGovObj = useMemo(() => {
    return allGovernorates.find((g) => g.id === governorateId);
  }, [allGovernorates, governorateId]);

  // --- Cascading Filtered Lists (Secondary) ---
  const availableSecondaryGovernorates = useMemo(() => {
    if (!secondaryCountryId) return [];
    return allGovernorates.filter((g) => g.country_id === secondaryCountryId);
  }, [allGovernorates, secondaryCountryId]);

  const availableSecondaryCities = useMemo(() => {
    if (!secondaryGovernorateId) return [];
    return allCities.filter((c) => c.governorate_id === secondaryGovernorateId);
  }, [allCities, secondaryGovernorateId]);

  const selectedSecondaryGovObj = useMemo(() => {
    return allGovernorates.find((g) => g.id === secondaryGovernorateId);
  }, [allGovernorates, secondaryGovernorateId]);

  // Street Suggestions
  const streetSuggestions = useMemo(() => {
    if (!selectedGovObj) return POPULAR_STREET_SUGGESTIONS.cairo;
    const key = selectedGovObj.name_en.toLowerCase();
    if (key.includes('cairo')) return POPULAR_STREET_SUGGESTIONS.cairo;
    if (key.includes('alex')) return POPULAR_STREET_SUGGESTIONS.alexandria;
    if (key.includes('assiut') || key.includes('asyut')) return POPULAR_STREET_SUGGESTIONS.assiut;
    return POPULAR_STREET_SUGGESTIONS.cairo;
  }, [selectedGovObj]);

  const secondaryStreetSuggestions = useMemo(() => {
    if (!selectedSecondaryGovObj) return POPULAR_STREET_SUGGESTIONS.cairo;
    const key = selectedSecondaryGovObj.name_en.toLowerCase();
    if (key.includes('cairo')) return POPULAR_STREET_SUGGESTIONS.cairo;
    if (key.includes('alex')) return POPULAR_STREET_SUGGESTIONS.alexandria;
    if (key.includes('assiut') || key.includes('asyut')) return POPULAR_STREET_SUGGESTIONS.assiut;
    return POPULAR_STREET_SUGGESTIONS.cairo;
  }, [selectedSecondaryGovObj]);

  const handleCountryChange = (newCountryId: string) => {
    setCountryId(newCountryId);
    setGovernorateId('');
    setCityId('');
    setErrors((prev) => ({ ...prev, countryId: '', governorateId: '', cityId: '' }));
  };

  const handleGovernorateChange = (newGovId: string) => {
    setGovernorateId(newGovId);
    setCityId('');
    setErrors((prev) => ({ ...prev, governorateId: '', cityId: '' }));
  };

  const handleSecondaryCountryChange = (newCountryId: string) => {
    setSecondaryCountryId(newCountryId);
    setSecondaryGovernorateId('');
    setSecondaryCityId('');
  };

  const handleSecondaryGovernorateChange = (newGovId: string) => {
    setSecondaryGovernorateId(newGovId);
    setSecondaryCityId('');
  };

  // GPS Auto-Detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(isRtl ? 'المتصفح لا يدعم تحديد الموقع' : 'Geolocation is not supported by your browser');
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await reverseGeocodeLocationAction(
          latitude,
          longitude,
          isRtl ? 'ar' : 'en'
        );
        setLocatingGps(false);

        if (res.success && res.details) {
          const d = res.details;
          if (d.route || d.formattedAddress) {
            setStreetAddress(d.route || d.formattedAddress);
          }
          if (d.streetNumber && !buildingNo) {
            setBuildingNo(d.streetNumber);
          }

          if (d.governorate) {
            const matchedGov = allGovernorates.find(
              (g) =>
                g.name_en.toLowerCase().includes(d.governorate!.toLowerCase()) ||
                g.name_ar.includes(d.governorate!) ||
                d.governorate!.includes(g.name_ar)
            );
            if (matchedGov) {
              setGovernorateId(matchedGov.id);
            }
          }
          setErrors({});
        }
      },
      (err) => {
        setLocatingGps(false);
        console.warn('Geolocation warning:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAdvance = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newErrors: Record<string, string> = {};
    if (!countryId) newErrors.countryId = isRtl ? 'يرجى اختيار الدولة' : 'Please select a country';
    if (!governorateId) newErrors.governorateId = isRtl ? 'يرجى اختيار المحافظة' : 'Please select a governorate';
    if (!cityId) newErrors.cityId = isRtl ? 'يرجى اختيار المدينة / المركز' : 'Please select a city/district';
    if (!streetAddress.trim()) newErrors.streetAddress = isRtl ? 'يرجى إدخال اسم الشارع / العنوان' : 'Please enter street address';

    if (hasSecondaryAddress) {
      if (!secondaryGovernorateId && secondaryStreetAddress.trim()) {
        newErrors.secondaryGovernorateId = isRtl ? 'يرجى اختيار المحافظة للعنوان الثانوي' : 'Please select governorate';
      }
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

      // Secondary Address Payload
      has_secondary_address: hasSecondaryAddress,
      secondary_address_type: hasSecondaryAddress ? secondaryAddressType : undefined,
      secondary_country_id: hasSecondaryAddress ? secondaryCountryId : undefined,
      secondary_governorate_id: hasSecondaryAddress ? secondaryGovernorateId : undefined,
      secondary_city_id: hasSecondaryAddress ? secondaryCityId : undefined,
      secondary_street_address: hasSecondaryAddress ? secondaryStreetAddress.trim() || undefined : undefined,
      secondary_building_no: hasSecondaryAddress ? secondaryBuildingNo.trim() || undefined : undefined,
      secondary_floor_no: hasSecondaryAddress ? secondaryFloorNo.trim() || undefined : undefined,
      secondary_apartment: hasSecondaryAddress ? secondaryApartment.trim() || undefined : undefined,
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
      {/* Form Container */}
      <div className="flex-grow flex flex-col justify-center min-h-[300px] w-full py-2 animate-fadeIn">
        <div className="space-y-4 max-w-xl mx-auto w-full">
          
          {/* PRIMARY ADDRESS CARD */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            {/* Top Row: Location Header & GPS Detection Button */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isRtl ? 'العنوان الأساسي (محل الإقامة)' : 'Primary Residence Address'}</span>
              </span>

              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={locatingGps}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2.5 py-1 rounded-full transition cursor-pointer"
              >
                {locatingGps ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Crosshair className="w-3 h-3" />
                )}
                <span>{isRtl ? 'موقعي الحالي (GPS)' : 'Use GPS'}</span>
              </button>
            </div>

            {/* Row 1: Country Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <span>{isRtl ? 'الدولة' : 'Country'}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={countryId}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={clsx(
                  "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer",
                  errors.countryId ? "border-red-500 bg-red-50/20" : "border-slate-300 dark:border-slate-700"
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
              {errors.countryId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.countryId}</p>}
            </div>

            {/* Row 2: Governorate and City (Side by Side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <span>{isRtl ? 'المحافظة / الولاية' : 'Governorate / State'}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={governorateId}
                  onChange={(e) => handleGovernorateChange(e.target.value)}
                  disabled={!countryId || availableGovernorates.length === 0}
                  className={clsx(
                    "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    errors.governorateId ? "border-red-500 bg-red-50/20" : "border-slate-300 dark:border-slate-700"
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
                {errors.governorateId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.governorateId}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <span>{isRtl ? 'المدينة / المركز / الحي' : 'City / District'}</span>
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
                    "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    errors.cityId ? "border-red-500 bg-red-50/20" : "border-slate-300 dark:border-slate-700"
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
                {errors.cityId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.cityId}</p>}
              </div>
            </div>

            {/* Row 3: Street Address Header & Mode Switcher */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{isRtl ? 'اسم الشارع / العنوان' : 'Street Address'}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>

                {/* Toggle between Autocomplete Search and Interactive Map */}
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className={clsx(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer",
                      !showMap
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <Search className="w-3 h-3" />
                    <span>{isRtl ? 'بحث سريع' : 'Search'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className={clsx(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer",
                      showMap
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <MapIcon className="w-3 h-3" />
                    <span>{isRtl ? 'خريطة تفاعلية' : 'Map Picker'}</span>
                  </button>
                </div>
              </div>

              {showMap ? (
                <div className="mt-2 animate-fadeIn">
                  <GoogleMapPlacePicker
                    isRtl={isRtl}
                    onPlaceSelect={(place) => {
                      if (place.formattedAddress) {
                        setStreetAddress(place.formattedAddress);
                        setErrors((prev) => ({ ...prev, streetAddress: '' }));
                      }
                    }}
                    placeholder={isRtl ? 'ابحث عن مكان أو حدده على الخريطة...' : 'Search or pick on map...'}
                  />
                </div>
              ) : (
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
                  defaultSuggestions={streetSuggestions}
                />
              )}

              {errors.streetAddress && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.streetAddress}</p>
              )}
            </div>

            {/* Row 4: Building No, Floor No, Apartment (3 Columns) */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Home className="w-3 h-3 text-slate-400" />
                  <span>{isRtl ? 'رقم العمارة' : 'Bldg No.'}</span>
                </label>
                <input
                  type="text"
                  value={buildingNo}
                  onChange={(e) => setBuildingNo(e.target.value)}
                  placeholder={isRtl ? 'اختياري' : 'Optional'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'الدور' : 'Floor'}
                </label>
                <input
                  type="text"
                  value={floorNo}
                  onChange={(e) => setFloorNo(e.target.value)}
                  placeholder={isRtl ? 'اختياري' : 'Optional'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'رقم الشقة' : 'Apartment'}
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder={isRtl ? 'اختياري' : 'Optional'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECONDARY ADDRESS OPTION */}
          {!hasSecondaryAddress ? (
            <button
              type="button"
              onClick={() => setHasSecondaryAddress(true)}
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 text-xs font-semibold text-blue-600 dark:text-blue-400 transition flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{isRtl ? 'إضافة عنوان إضافي (مقر عمل / سكن ثانٍ / سكن صيفي)' : '+ Add Secondary Address (Work / 2nd Home / Vacation)'}</span>
            </button>
          ) : (
            <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 p-4 shadow-xs space-y-3.5 animate-fadeIn">
              {/* Secondary Address Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{isRtl ? 'العنوان الإضافي / الثانوي' : 'Secondary Address'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setHasSecondaryAddress(false)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isRtl ? 'حذف العنوان الإضافي' : 'Remove'}</span>
                </button>
              </div>

              {/* Secondary Address Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>{isRtl ? 'نوع العنوان الإضافي' : 'Address Type'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECONDARY_ADDRESS_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSecondaryAddressType(type.id)}
                      className={clsx(
                        "px-2.5 py-1.5 text-[11px] font-medium rounded-xl border transition-all text-center cursor-pointer",
                        secondaryAddressType === type.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      )}
                    >
                      {isRtl ? type.ar : type.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'الدولة' : 'Country'}
                </label>
                <select
                  value={secondaryCountryId}
                  onChange={(e) => handleSecondaryCountryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
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
              </div>

              {/* Secondary Governorate & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'المحافظة / الولاية' : 'Governorate / State'}
                  </label>
                  <select
                    value={secondaryGovernorateId}
                    onChange={(e) => handleSecondaryGovernorateChange(e.target.value)}
                    disabled={!secondaryCountryId || availableSecondaryGovernorates.length === 0}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">
                      {isRtl ? 'اختر المحافظة' : 'Select Governorate'}
                    </option>
                    {availableSecondaryGovernorates.map((g) => (
                      <option key={g.id} value={g.id} className="bg-white dark:bg-slate-900">
                        {isRtl ? g.name_ar : g.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'المدينة / المركز / الحي' : 'City / District'}
                  </label>
                  <select
                    value={secondaryCityId}
                    onChange={(e) => setSecondaryCityId(e.target.value)}
                    disabled={!secondaryGovernorateId || availableSecondaryCities.length === 0}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">
                      {isRtl ? 'اختر المدينة' : 'Select City'}
                    </option>
                    {availableSecondaryCities.map((ct) => (
                      <option key={ct.id} value={ct.id} className="bg-white dark:bg-slate-900">
                        {isRtl ? ct.name_ar : ct.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secondary Street Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? 'اسم الشارع / العنوان الإضافي' : 'Secondary Street Address'}</span>
                </label>
                <GooglePlacesAutocomplete
                  value={secondaryStreetAddress}
                  onChange={(val) => setSecondaryStreetAddress(val)}
                  onPlaceSelect={(details) => {
                    if (details.route || details.formattedAddress) {
                      setSecondaryStreetAddress(details.route || details.formattedAddress);
                    }
                    if (details.streetNumber && !secondaryBuildingNo) {
                      setSecondaryBuildingNo(details.streetNumber);
                    }
                  }}
                  placeholder={isRtl ? 'ابحث عن اسم الشارع أو العنوان...' : 'Search street or address...'}
                  isRtl={isRtl}
                  defaultSuggestions={secondaryStreetSuggestions}
                />
              </div>

              {/* Secondary Building No, Floor No, Apartment */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'رقم العمارة' : 'Bldg No.'}
                  </label>
                  <input
                    type="text"
                    value={secondaryBuildingNo}
                    onChange={(e) => setSecondaryBuildingNo(e.target.value)}
                    placeholder={isRtl ? 'اختياري' : 'Optional'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'الدور' : 'Floor'}
                  </label>
                  <input
                    type="text"
                    value={secondaryFloorNo}
                    onChange={(e) => setSecondaryFloorNo(e.target.value)}
                    placeholder={isRtl ? 'اختياري' : 'Optional'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'رقم الشقة' : 'Apartment'}
                  </label>
                  <input
                    type="text"
                    value={secondaryApartment}
                    onChange={(e) => setSecondaryApartment(e.target.value)}
                    placeholder={isRtl ? 'اختياري' : 'Optional'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

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
