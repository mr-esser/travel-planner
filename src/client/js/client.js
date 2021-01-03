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

  const dynamicContent = document.querySelectorAll('.container')[1];
  // Trying to avoid several consecutive reflows/repaints here.
  dynamicContent.style= 'display:none';

  // Add image // TODO: Add null-check
  const figureDestination = document.querySelector('#img-dest');
  figureDestination.setAttribute('src', image.url);

  // Add trip summary
  const columnSummary= document.querySelector('#summary');
  const summaryHtml = `
  <p id="summary">
    Your trip to <b>${city}</b>, <b>${country}</b>
    from <b>${departureDate}</b> to <b>${returnDate}</b>
    is <b>N</b> days away
    and will last <b>${duration}</b> days.
  </p>
  `;
  columnSummary.innerHTML = summaryHtml;

  // Add forecasts
  const rowForecasts = document.querySelector('#forecasts');
  const forecastsHtml = forecasts.map( (forecast) => {
    return `
  <div class="column column-25 column-forecast">
    <div class="row row-no-padding force-flex-direction-row">
      <div class="column column-25">
       <figure class="icon">
         <img src="${forecast.icon}" title="${forecast.description}">
      </figure>
     </div>
    <div class="column temp">
      <div class="temp-high">${forecast.max_temp}°C</div>
      <div class="temp-low">${forecast.min_temp}°C</div>
    </div>
    </div>
    <div class="row row-no-padding force-flex-direction-row">
      <div class="column date">
        ${forecast.datetime}
      </div>
    </div>
  </div>
`;
  }).reduce((result, html) => {
    return result.concat(html);
  }, '');
  rowForecasts.innerHTML = forecastsHtml;
  dynamicContent.style = 'container';
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
    const departureDate= getInputText('#depart');
    const returnDate= getInputText('#return');
    console.debug('Calling handleSubmit');
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
