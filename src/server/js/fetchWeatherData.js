require('dotenv').config();
const fetch = require('node-fetch');
const {ValidationError} = require('./ValidationError');

/* Function to GET geo data from third-party service. */
const fetchWeatherData = async function(
    latitude = '',
    longitude = '',
    check = checkParams,
    getServiceUrl=getWeatherServiceUrl,
) {
  check(latitude, longitude);

  const serviceUrl = getServiceUrl(latitude, longitude);
  // console.debug(serviceUrl?.toString());

  // Note(!): fetch will only reject on network errors!
  // Weather service uses proper HTTP response codes.
  const serviceResponse = await fetch(serviceUrl);
  const result = await serviceResponse.json();
  if (!serviceResponse.ok) {
    throw new Error(
        'Weather service responded with HTTP code ' +
        serviceResponse.status + ' and message ' + result.error,
    );
  }
  return result;
};

/* Weather API is very benevolent with regard to lat and long.
 * It seems to accept any number.
 * Since this code is expected to be called with valid coordinates
 * obtained for an existing city's name, anyway,
 * being too strict here does not seem to make much sense. */
const checkParams = function(latitude, longitude) {
  const isInvalidLatitude = Number.isNaN(Number.parseFloat(latitude));
  const isInvalidLongitude = Number.isNaN(Number.parseFloat(longitude));

  if (isInvalidLatitude||isInvalidLongitude) {
    // TODO: Code should be set by express error handler!
    throw new ValidationError(
        400,
        `Params 'latitude' and 'longitude' must both be numbers`);
  }
};

const getWeatherServiceUrl = function(
    latitude='',
    longitude='',
    baseUrl = process.env.WEATHER_URL,
    apiKey = process.env.WEATHER_API_KEY,
) {
  const url = new URL(baseUrl);
  url.searchParams.append('key', apiKey);
  url.searchParams.append('lang', 'EN'); // default
  url.searchParams.append('units', 'M'); // default
  url.searchParams.append('days', 16); // default
  url.searchParams.append('lat', latitude);
  url.searchParams.append('lon', longitude);
  return url;
};

module.exports = {
  fetchWeatherData: fetchWeatherData,
  getWeatherServiceUrl: getWeatherServiceUrl,
};
