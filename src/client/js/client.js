/* Main client-side module.
 * Reads from the UI, queries the server app for the required
 * pieces of information, combines them and finally displays
 * them in the UI. */
import {collectTravelInfo} from './aggregateData';
import {postTripData} from './syncTripData';
import defaultImage from './../media/luggage-640.jpg';

/* MAIN function reacting to 'Save' events. */
const handleSubmit = async function handleSubmit(event) {
  console.debug(':::Calling handleSubmit:::');
  // Note(!): Preventing the default event will also preserve
  // the form input (desired for the moment).
  event.preventDefault();
  try {
    // All inputs have been validated by the UI or are empty (trimmed)
    const city= getInputText('#city');
    const country= getInputText('#country');
    const departureDate= getInputText('#depart');
    const returnDate= getInputText('#return');
    // Note(!): Form inputs do not specify the 'required' attribute
    // to avoid errors on page load when fields are bound to still be empty.
    // Need to make sure that they are filled before executing any requests.
    const inputComplete = [city, country, departureDate, returnDate]
        .every( (f) => f.length > 0);
    if (!inputComplete) {
      return;
    }

    const trip =
      await collectTravelInfo(city, country, departureDate, returnDate);
    const tripRecord = await postTripData(trip);
    console.debug(`:::Complete trip data: ${JSON.stringify(tripRecord)}:::`);
    updateUI(tripRecord);
  } catch (fatalError) {
    // Most likely networking error;
    // i.e.: fetch sent to express backend rejected and threw.
    console.error(fatalError);
    showFatalError();
  }
};

/* Will not validate the input! */
const getInputText = function(selector) {
  const element = document.querySelector(selector);
  if (element && 'value' in element) {
    return element.value.trim();
  }
  return '';
};

/* Update the UI to show the most recent trip. */
/* All trip fields are expected to be present
 * and filled with reasonable defaults! */
const updateUI = function(trip) {
  const {
    city,
    country,
    departureDate,
    returnDate,
    countdown,
    duration,
    forecasts,
    image,
  } = trip;

  const dynamicContent = document.querySelectorAll('.container')[1];
  // Trying to avoid several consecutive reflows/repaints here.
  dynamicContent.style= 'display:none';

  // Set main image
  const figureDestination = document.querySelector('#img-dest');
  let imgSrc = defaultImage;
  if (image && image.url && image.url.length > 0) {
    imgSrc = image.url;
  }
  figureDestination.setAttribute('src', imgSrc);

  // Add trip summary.
  // Data will always be present because it is computed locally.
  // TODO: Add error message in case dates are in the past or don't make sense.
  const columnSummary= document.querySelector('#summary');
  const summaryHtml = `
  <p id="summary">
    Your trip to <b>${city}</b>, <b>${country}</b>
    from <b>${departureDate}</b> to <b>${returnDate}</b>
    is <b>${countdown}</b> days away and will last <b>${duration}</b> days.
  </p>
  `;
  columnSummary.innerHTML = summaryHtml;

  // Add forecasts (if any)
  const headerForecast = document.querySelector('#header-forecast');
  if (forecasts && forecasts.length > 0) {
    headerForecast.innerHTML =
    `<h2 class="header-forecast">Weather Forecast</h2>`;
  }
  const rowForecasts = document.querySelector('#forecasts');
  const forecastsHtml = forecasts.map((forecast) => {
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
      <div class="column date">${forecast.datetime}</div>
    </div>
  </div>
`;
  }).reduce((result, html) => {
    return result.concat(html);
  }, '');
  rowForecasts.innerHTML = forecastsHtml;

  // Make container visible again.
  dynamicContent.style = 'container';
};

const showFatalError = function() {
  // Show error message
  const columnSummary= document.querySelector('#summary');
  const summaryHtml = `
  <p class="error">
    Ooops. Something went terribly wrong. 
    Please, check your form input and try again later.
  </p>
  `;
  columnSummary.innerHTML = summaryHtml;

  // Reset figure
  const figureDestination = document.querySelector('#img-dest');
  figureDestination.setAttribute('src', defaultImage);
  // Reset forecasts
  const headerForecast = document.querySelector('#header-forecast');
  headerForecast.innerHTML ='';
  const rowForecasts = document.querySelector('#forecasts');
  rowForecasts.innerHTML = '';
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
