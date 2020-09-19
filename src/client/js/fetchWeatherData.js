import {WEATHER_API_KEY} from './apiKey';

// Unit system used in weather map API requests
const UNITS = 'metric';

/* Function to GET weather data from third-party service. */
const getWeatherData = async function(zipAndCountryCode) {
  const serviceUrl = getWeatherServiceUrl(zipAndCountryCode);
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(serviceUrl);
  return response.json();
};

const getWeatherServiceUrl = function(zipAndCountryCode) {
  return `http://api.openweathermap.org/data/2.5/weather?zip=${zipAndCountryCode}&units=${UNITS}&appid=${WEATHER_API_KEY}`;
};

export {getWeatherData};
