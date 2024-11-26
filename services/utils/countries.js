import countries from 'i18n-iso-countries';

// Register the English locale
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// Retrieve official country names
const countryNames = countries.getNames('en', { select: 'official' });

// Create a mapping of lowercase country names to country codes
const countryNameToCodeMap = {};
for (const [code, name] of Object.entries(countryNames)) {
  countryNameToCodeMap[name.trim().toLowerCase()] = code;
}

/**
 * Retrieves the country code for a given country name, case-insensitive.
 * @param {string} countryName - The country name.
 * @returns {string|null} The ISO Alpha-2 country code or null if not found.
 */
export const getCountryCode = (countryName) => {
  if (!countryName) return null;
  const normalizedCountryName = countryName.trim().toLowerCase();
  return countryNameToCodeMap[normalizedCountryName] || null;
};

/**
 * Provides the list of official country names in English.
 * @returns {string[]} Array of official country names.
 */
export const getOfficialCountryNames = () => {
  return Object.values(countryNames);
};
