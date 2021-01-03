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
  // TODO: Nothing happening here yet. Static UI for the moment.
  // Try to avoid several consecutive reflows/repaints here.
  // container.style = 'display: none;';
  // container.style = '';
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
