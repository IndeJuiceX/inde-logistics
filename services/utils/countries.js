import countries from 'i18n-iso-countries';
// Register the English locale
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// Retrieve official country names
const countryNames = countries.getNames('en', { select: 'official' });

// Create a list of official country names
const officialCountryNames = Object.values(countryNames);
/**
 * Retrieves the country code for a given country name.
 * @param {string} countryName - The official country name.
 * @returns {string|null} The ISO Alpha-2 country code or null if not found.
 */
export const getCountryCode = (countryName) => {
    return countries.getAlpha2Code(countryName, 'en');
};

/**
 * Provides the list of official country names in English.
 * @returns {string[]} Array of official country names.
 */
export const getOfficialCountryNames = () => {
    return officialCountryNames;
};