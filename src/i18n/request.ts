import { getRequestConfig } from 'next-intl/server';
import { isSupportedLocale, DEFAULT_LOCALE } from './locales';

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = { ...(source || {}), ...(target || {}) };
  for (const key of Object.keys(source || {})) {
    const sVal = (source as Record<string, unknown>)[key];
    const tVal = (target as Record<string, unknown>)[key];
    if (sVal && typeof sVal === 'object' && !Array.isArray(sVal)) {
      output[key] = deepMerge(
        (tVal && typeof tVal === 'object' && !Array.isArray(tVal) ? tVal : {}) as Record<string, unknown>,
        sVal as Record<string, unknown>
      );
    } else if (tVal === undefined) {
      output[key] = sVal;
    }
  }
  return output;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isSupportedLocale(locale)) {
    locale = DEFAULT_LOCALE;
  }

  // Always load default messages as base fallback
  let defaultCommon = {};
  let defaultSignin = {};
  let defaultForgot = {};
  let defaultRegister = {};
  let defaultErrors = {};
  let defaultCountries = {};

  try {
    defaultCommon = (await import(`../../messages/${DEFAULT_LOCALE}/common.json`)).default;
  } catch {}
  try {
    defaultSignin = (await import(`../../messages/${DEFAULT_LOCALE}/signin.json`)).default;
  } catch {}
  try {
    defaultForgot = (await import(`../../messages/${DEFAULT_LOCALE}/forgot.json`)).default;
  } catch {}
  try {
    defaultRegister = (await import(`../../messages/${DEFAULT_LOCALE}/register.json`)).default;
  } catch {}
  try {
    defaultErrors = (await import(`../../messages/${DEFAULT_LOCALE}/errors.json`)).default;
  } catch {}
  try {
    defaultCountries = (await import(`../../messages/${DEFAULT_LOCALE}/Countries.json`)).default;
  } catch {}

  let commonMessages = defaultCommon;
  let signinMessages = defaultSignin;
  let forgotMessages = defaultForgot;
  let registerMessages = defaultRegister;
  let errorMessages = defaultErrors;
  let countriesMessages = defaultCountries;

  if (locale !== DEFAULT_LOCALE) {
    try {
      const locCommon = (await import(`../../messages/${locale}/common.json`)).default;
      commonMessages = deepMerge(locCommon, defaultCommon);
    } catch {}

    try {
      const locSignin = (await import(`../../messages/${locale}/signin.json`)).default;
      signinMessages = deepMerge(locSignin, defaultSignin);
    } catch {}

    try {
      const locForgot = (await import(`../../messages/${locale}/forgot.json`)).default;
      forgotMessages = deepMerge(locForgot, defaultForgot);
    } catch {}

    try {
      const locRegister = (await import(`../../messages/${locale}/register.json`)).default;
      registerMessages = deepMerge(locRegister, defaultRegister);
    } catch {}

    try {
      const locErrors = (await import(`../../messages/${locale}/errors.json`)).default;
      errorMessages = deepMerge(locErrors, defaultErrors);
    } catch {}

    try {
      const locCountries = (await import(`../../messages/${locale}/Countries.json`)).default;
      countriesMessages = deepMerge(locCountries, defaultCountries);
    } catch {}
  }

  return {
    locale,
    messages: {
      common: commonMessages,
      signin: signinMessages,
      forgot: forgotMessages,
      register: registerMessages,
      errors: errorMessages,
      countries: countriesMessages,
    },
  };
});