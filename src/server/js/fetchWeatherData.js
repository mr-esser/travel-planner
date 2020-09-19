// TODO: Consider defining server and port in .env, too
require('dotenv').config();
const fetch = require('node-fetch');

// Unit system used in weather map API requests
const UNITS = 'metric';

/* Function to GET weather data from third-party service. */
const fetchWeatherData = async function(
    zipAndCountryCode,
    getServiceUrl=getWeatherServiceUrl,
) {
  const serviceUrl = getServiceUrl(zipAndCountryCode);
  console.debug(serviceUrl);
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(serviceUrl);
  return response.json();
};

// TODO: Should use proper param encoding with URL and searchparams
const getWeatherServiceUrl = function(
    zipAndCountryCode, units=UNITS, appid=process.env.WEATHER_API_KEY) {
  return `http://api.openweathermap.org/data/2.5/weather?zip=${zipAndCountryCode}&units=${units}&appid=${appid}`;
};

module.exports = {
  fetchWeatherData: fetchWeatherData,
};
