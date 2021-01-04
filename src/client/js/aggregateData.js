import {fetchGeoData} from './fetchGeoData';
import {fetchWeatherData} from './fetchWeatherData';
import {fetchImageData} from './fetchImageData';

const collectTravelInfo = async function(
    city,
    country,
    departureDate,
    returnDate,
    fetchGeo = fetchGeoData,
    fetchWeather = fetchWeatherData,
    fetchImage = fetchImageData,
) {
  let rawWeatherData;
  let rawImageData;

  try {
  // TODO: Error handling
    console.debug(`Fetching geo data for: ${city}, ${country}`);
    const geoData = await fetchGeo(city, country);
    const {lat, lng} = geoData.geonames[0];
    // TODO: Run in parallel
    console.debug(`Fetching forecast for: ${lat} and ${lng}`);
    rawWeatherData = await fetchWeather(lat, lng);
    console.debug(`Fetching image for: ${city} and ${country}`);
    rawImageData = await fetchImage(city);
  } catch (error) {
    // Data is incomplete, but it can still be posted and displayed.
    // So, log and then go on.
    console.info(error);
  }
  const tripData = buildTripData(
      city, country, departureDate, returnDate, rawWeatherData, rawImageData,
  );
  return tripData;
};

/* Aggregate the data gathered from external APIs */
const buildTripData = async function(
    city,
    country,
    departureDate,
    returnDate,
    rawWeatherData,
    rawImageData) {
  const duration = calculateDurationDays(departureDate, returnDate);
  const dailyForecasts = buildForecastData(rawWeatherData);
  const relevantForecasts = filterRelevantForecasts(
      dailyForecasts, duration, departureDate, returnDate,
  );
  return {
    city: city ?? '',
    country: country ?? '',
    departureDate: departureDate ?? '',
    returnDate: returnDate ?? '',
    duration: duration,
    forecasts: relevantForecasts,
    image: buildImageData(rawImageData),
  };
};

const calculateDurationDays = function(start, end) {
  const startMillis = Date.parse(start);
  const endMillis = Date.parse(end);
  if (Number.isNaN(startMillis) || Number.isNaN(endMillis)) {
    return 0;
  }
  const startDate = new Date(startMillis);
  const endDate = new Date(endMillis);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  const diffMillis = (endDate - startDate);
  if (diffMillis === 0) {
    return 1;
  }
  return Math.round(diffMillis/(1000*60*60*24)) + Math.sign(diffMillis)*1;
};

const buildForecastData = function(rawForecast) {
  const buildCompactDailyForecast = function(rawRecord) {
    return {
      datetime: rawRecord.datetime,
      max_temp: rawRecord.max_temp,
      min_temp: rawRecord.min_temp,
      icon: `https://www.weatherbit.io/static/img/icons/${rawRecord.weather.icon}.png`,
      description: rawRecord.weather.description,
    };
  };
  return rawForecast?.data?.map(buildCompactDailyForecast) ?? [];
};

const filterRelevantForecasts = function(
    dailyForecasts,
    duration,
    departureDate,
    returnDate,
    today,
) {
  // No data available
  if (!dailyForecasts || dailyForecasts.length === 0) return [];
  // Discard all forecasts. This is impossible
  if (duration <= 0) return [];
  // String based comparison. Assuming date format YYYY-MM-DD here.
  // Trip now or in the future.
  if (!today || today.length === 0) {
    today = getToday();
  }
  if (departureDate >= today) {
    return dailyForecasts.filter(
        (forecast) => {
          return forecast.datetime >= departureDate &&
          forecast.datetime <= returnDate;
        });
  }
  return [];
};

/* yyyy-mm-dd */
const getToday = function() {
  return new Date().toLocaleDateString('en-CA');
};

const buildImageData = function(rawImageData) {
  const firstHit = rawImageData?.hits?.reverse()?.pop();
  if (firstHit) {
    return {
      url: firstHit.webformatURL,
      width: firstHit.webformatWidth,
      height: firstHit.webformatHeight,
      user: firstHit.user,
    };
  }
  return {};
};

export {
  collectTravelInfo,
  calculateDurationDays,
  buildForecastData,
  buildImageData,
  buildTripData,
  filterRelevantForecasts,
};
