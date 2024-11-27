import countries from 'i18n-iso-countries';

// Register the English locale
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

/**
 * Provides the list of all ISO Alpha-2 country codes.
 * @returns {string[]} Array of country codes.
 */
export const getAllCountryCodes = () => {
  return Object.keys(countries.getNames('en', { select: 'official' })).map((code) => code.toUpperCase());
};

/**
 * Retrieves the official country name for a given country code.
 * @param {string} countryCode - The ISO Alpha-2 country code.
 * @returns {string|null} The official country name or null if not found.
 */
export const getOfficialCountryName = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') return null;
  return countries.getName(countryCode.toUpperCase(), 'en', { select: 'official' }) || null;
};
