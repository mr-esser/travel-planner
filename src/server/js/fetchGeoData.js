require('dotenv').config();
const fetch = require('node-fetch');

/* Function to GET geo data from third-party service. */
const fetchGeoData = async function(
    city = '',
    countryCode = '',
    check = checkParams,
    getServiceUrl=getGeoServiceUrl,
) {
  check(city, countryCode);

  const serviceUrl = getServiceUrl(city, countryCode);
  console.debug(serviceUrl);

  // Note(!): fetch will only reject on network errors!
  const serviceResponse = await fetch(serviceUrl);
  if (!serviceResponse.ok) {
    throw new Error(
        'Geo service responded with HTTP error code ' +
          serviceResponse.status,
    );
  }

  const result = await serviceResponse.json();
  if (result.totalResultsCount === undefined || result.geonames === undefined) {
    throw new Error(
        `Geo service responded with message: ${result.status.message ?? ''}`);
  }
  return result;
};

const checkParams = function(city, country) {
  if (!city || !city.trim()) {
    // TODO: Code should be set by express error handler!
    // TODO: ValidationError should probably be put in its own file, later.
    throw new ValidationError(400, `Param 'city' must not be empty`);
  }
  // TODO: Check regexp
  if (country && country.trim()) {
    const matches = country.match(/[A-Z][A-Z]$/i) ?? [];
    if (matches.length === 0) {
      throw new ValidationError(
          400, `Param 'country' must be a two-letter-code`,
      );
    }
  }
};

const getGeoServiceUrl = function(
    cityName='',
    countryCode='',
    baseUrl = process.env.GEO_URL,
    apiUsername = process.env.GEO_USERNAME,
) {
  const url = new URL(baseUrl);
  url.searchParams.append('username', apiUsername);
  url.searchParams.append('lang', 'EN');
  url.searchParams.append('maxRows', 1);
  url.searchParams.append('style', 'short');
  url.searchParams.append('name', cityName);
  url.searchParams.append('country', countryCode);
  return url;
};


class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ValidationError';
    this.statusMessage = message;
    this.statusCode = code;
  }
}

module.exports = {
  fetchGeoData: fetchGeoData,
  getGeoServiceUrl: getGeoServiceUrl,
  ValidationError: ValidationError,
};
