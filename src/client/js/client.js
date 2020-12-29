import {fetchGeoData} from './fetchGeoData';
import {fetchWeatherData} from './fetchWeatherData';
import {fetchImageData} from './fetchImageData';
import {buildTripData} from './aggregateData';
import {postTripData} from './syncTripData';

/* Will not validate the input! */
const getInputText = function(selector) {
  const element = document.querySelector(selector);
  if (element && 'value' in element) {
    return element.value.trim();
  }
  return '';
};

/* Update the most recent entry in the UI */
const updateUI = function({
  city = '',
  country = '',
  departureDate = '',
  returnDate = '',
  duration = '',
  forecasts = [],
  image = '',
}) {
  const container = document.querySelector('#entryHolder');
  // Trying to avoid several consecutive reflows/repaints here.
  // Does not seem to be worth the effort, though.
  container.style = 'display: none;';
  container.querySelector('#depart-date').innerHTML = departureDate;
  container.querySelector('#return-date').innerHTML = returnDate;
  container.querySelector('#duration').innerHTML =
    duration.toString() + ' days';
  container.querySelector('#location').innerHTML = `${city}, ${country}`;
  container.querySelector('#pic').innerHTML = `<img
  src="${image.url}"
  alt="Image showing landmark of ${city}, ${country}">`;
  container.querySelector('#weather').innerHTML = `<div> 
  <div>${forecasts[0].datetime}</div>
  <img src="${forecasts[0].icon}">
  <div>${forecasts[0].description}</div>
  <div>${forecasts[0].min_temp}</div>
  <div>${forecasts[0].max_temp}</div>
  </div>`;
  container.style = '';
};

/* Main functions */


/* MAIN function called by event listener on 'Generate' button */
const handleGenerate = async function handleGenerate(event) {
  const buildDisplayData = async function() {
    let displayData = {};
    try {
      const city = getInputText('#city');
      console.debug('city: ' + city);
      const country = getInputText('#country');
      console.debug('country: ' + country);
      // Assuming that inputs have been validated by the UI
      const depart = getInputText('#depart');
      console.debug('departure: ' + depart);
      const ret = getInputText('#return');
      console.debug('return: ' + ret);

      // TODO: Run things in parallel!
      const geoData = await fetchGeoData(city, country);
      const lng = geoData.geonames[0].lng;
      const lat = geoData.geonames[0].lat;
      console.debug(`fetch forecast for: ${lat} and ${lng}`);
      const weatherData = await fetchWeatherData(lat, lng);
      const imageData = await fetchImageData(city);
      displayData =
        buildTripData(city, country, depart, ret, weatherData, imageData);
      // TODO: Temperature unit is hard-coded?
    } catch (error) {
      // Data is incomplete, but it can still be posted and displayed.
      // So, log and then go on.
      console.info(error);
    }
    return displayData;
  };


  try {
    const tripData = await buildDisplayData();
    const serverRecord = await postTripData(tripData);
    console.debug('Complete data: ' + JSON.stringify(serverRecord));
    updateUI(serverRecord);
  } catch (networkError) {
    // Probably unrecoverable networking error ,i.e.: fetch rejected and threw
    console.error(networkError);
    // Very lazy!! Should rather use a dedicated <div>
    // to display the error and hide the rest.
    updateUI({
      departureDate:
        'Ooops. Looks like the service is down. Please, try again later.',
    });
  }
};

// Event listener to add function to existing 'Generate' button.
window.addEventListener('DOMContentLoaded', () => {
  console.debug('::::: Script loaded! :::::');
  // Note(!) Button will not generate a 'submit' event
  // because it is not tied to a form.
  const generateButton = document.querySelector('#generate');
  generateButton.addEventListener('click', handleGenerate);
  // Try to load data from the server on startup.
  // There may already be some available.
  // TODO: Re-enable!
  // getFromServer(getServiceUrl('all'))
  //     .then((data) => updateUI(data))
  //     .catch((error) => console.error(error));
});
