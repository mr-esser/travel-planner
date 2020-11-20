/* Aggregate the data gathered from external APIs */
const buildTripData = async function(
    city,
    country,
    departureDate,
    returnDate,
    rawGeoData = {},
    rawWeatherData = {},
    rawImageData = {}) {
  const tripData = {
    city: city ?? 'unavailable',
    country: country ?? 'unavailable',
    departureDate: departureDate ?? Date.now(),
    returnDate: returnDate ?? Date.now(),
    duration: calculateDurationDays(departureDate, returnDate),
    forecast: buildForecastData(rawWeatherData),
    image: buildImageData(rawImageData),
  };
  return tripData;
};

const calculateDurationDays = function(startDate, endDate) {
  if (startDate === null || startDate === undefined ||
      endDate === null || endDate === undefined) {
    return 'unavailable';
  }
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  const diffMillis = (endDate - startDate);
  if (diffMillis === 0) {
    return 1;
  }
  return (diffMillis/(1000*60*60*24)) + Math.sign(diffMillis)*1;
};

const buildForecastData = function(rawWeatherData) {
  return {
    datetime: '2020-09-28',
    max_temp: 0,
    min_temp: 0,
    icon: 'x01x',
    code: 111,
    description: 'unavailable',
  };
};

const buildImageData = function(rawImageData) {
  return {
    url: 'unavailable',
    width: 0,
    height: 0,
    user: 'unknown user',
    // dummy image with unknown pic
  };
};

export {
  calculateDurationDays,
  buildForecastData,
  buildTripData,
};
