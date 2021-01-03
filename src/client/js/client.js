/* Main client-side module.
 * Reads from the UI, queries the server app for the required
 * pieces of information, combines them and finally displays
 * them in the UI. */
import {collectTravelInfo} from './aggregateData';
import {postTripData} from './syncTripData';

// TODO: Re-arrange functions
/* Will not validate the input! */
const getInputText = function(selector) {
  const element = document.querySelector(selector);
  if (element && 'value' in element) {
    return element.value.trim();
  }
  return '';
};

/* Update UI to show the most recent tripl */
/* All trip fields are expected to be present
 * and filled with reasonable defaults! */
// TODO: Add appropriate test.
const updateUI = function(trip) {
  const {
    city,
    country = '',
    departureDate = '',
    returnDate = '',
    duration = '',
    forecasts = [],
    image = '',
  } = trip;
  const container = document.querySelector('.container');
  // Trying to avoid several consecutive reflows/repaints here.
  container.style= 'display:none';

  // Add image
  const img = document.querySelector('#city-img');
  img.setAttribute('src', image.url);

  // Add trip summary
  const rowTrip= document.querySelector('#trip');
  const tripText = `
  <p>
     Your trip to ${city}, ${country} from ${departureDate} to ${returnDate} 
     is ??? days away and will last ${duration} days.
  </p> 
  `;
  rowTrip.innerHTML = tripText;

  // Add forecasts
  const rowForecasts = document.querySelector('#forecasts');
  const foreCastHtml = forecasts.map( (forecast) => {
    return `<div class="column column-25 forecast">
        <p class="row"><span class="date">${forecast.datetime}</span></p>
        <div class="row info">
         <figure class="column icon">
           <img src="${forecast.icon}">
         </figure>
         <p class="column temp">
           <span class="row temp-high">${forecast.max_temp}°C</span>
            <span class="row temp-low">${forecast.min_temp}°C</span>
          </p>
        </div>
        <p class="row">
          <span class="description">${forecast.description}</span>
        </p>
      </div>
      `;
  }).reduce((result, html) => {
    return result.concat(html);
  }, '');
  rowForecasts.innerHTML = foreCastHtml;
  container.style = 'container';
};

/* Main functions */


/* MAIN function called by event listener on 'Generate' button */
const handleSubmit = async function handleSubmit(event) {
  // Note(!): Will also preserve the form input (desired for the moment).
  event.preventDefault();
  try {
    // Assuming that all inputs have been validated by the UI or are empty
    const city= getInputText('#city');
    const country= getInputText('#country');
    const departureDate= getInputText('#departure');
    const returnDate= getInputText('#return');

    // Note(!): Need this because inputs do not have the 'required' attribute.
    // This avoids errors on load when fields are bound to still be empty.
    const inputComplete = [city, country, departureDate, returnDate]
        .every( (f) => f.length > 0);
    if (!inputComplete) return;

    const trip =
      await collectTravelInfo(city, country, departureDate, returnDate);
    const tripRecord = await postTripData(trip);
    console.debug('Complete data: ' + JSON.stringify(tripRecord));
    updateUI(tripRecord);
  } catch (networkError) {
    // TODO: Update error handling.
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

// Event listener to reload existing data
window.addEventListener('DOMContentLoaded', () => {
  console.debug('::::: Script loaded! :::::');
  // TODO: Re-enable!
  // Try to load data from the server on startup.
  // There may already be some available.
  // getFromServer(getServiceUrl('all'))
  //     .then((data) => updateUI(data))
  //     .catch((error) => console.error(error));
});

export {handleSubmit};
