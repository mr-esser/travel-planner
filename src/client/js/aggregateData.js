/* Aggregate the data gathered from external APIs */
const buildTripData = async function(
    city,
    country,
    departureDate,
    returnDate,
    rawWeatherData,
    rawImageData) {
  const tripData = {
    city: city ?? '',
    country: country ?? '',
    departureDate: departureDate ?? '',
    returnDate: returnDate ?? '',
    duration: calculateDurationDays(departureDate, returnDate),
    forecasts: buildForecastData(rawWeatherData),
    image: buildImageData(rawImageData),
  };
  return tripData;
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
  return (diffMillis/(1000*60*60*24)) + Math.sign(diffMillis)*1;
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
  calculateDurationDays,
  buildForecastData,
  buildImageData,
  buildTripData,
};