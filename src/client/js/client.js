/* Global Variables */

// Journal server info
const SERVER = 'localhost';
const PORT = 8080;

const getServiceUrl = function(route = '') {
  return `http://${SERVER}:${PORT}/${route}`;
};

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
  date = '',
  location = '',
  temperature = '',
  content = '',
}) {
  const container = document.querySelector('#entryHolder');
  // Trying to avoid several consecutive reflows/repaints here.
  // Does not seem to be worth the effort, though.
  container.style = 'display: none;';
  container.querySelector('#date').innerHTML = date;
  container.querySelector('#location').innerHTML = location;
  container.querySelector('#temp').innerHTML = temperature;
  container.querySelector('#content').innerHTML = content;
  container.style = '';
};

/* Main functions */

/* Function to POST project data to sever */
const postToServer = async function(url = '', objectData = {}) {
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objectData),
  });
  return response.json();
};

/* Function to GET project data from server */
const getFromServer = async function(url = '') {
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(url);
  return response.json();
};

/* MAIN function called by event listener on 'Generate' button */
const handleGenerate = async function handleGenerate(event) {
  const buildTripData = async function() {
    const tripData = buildTripData();
    try {
      const weatherUrl = getServiceUrl('weather');
      console.debug(weatherUrl);
      const zipData = {zipAndCountryCode: getInputText('#zip')};
      console.debug(JSON.stringify(zipData));
      const weatherData = await postToServer(weatherUrl, zipData);
      // Temperature unit is hard-coded. See constant UNITS.
      tripData.temperature = `${weatherData.main.temp} °C`;
      tripData.location = `${weatherData.name}, ${weatherData.sys.country}`;
    } catch (error) {
      // Data is incomplete, but it can still be posted and displayed.
      // So, log and then go on.
      console.info(error);
    }
    return tripData;
  };

  const synchronizeWithServer = async function(journalData) {
    console.debug(JSON.stringify(journalData));
    const route = 'all';
    await postToServer(getServiceUrl(route), journalData);
    return getFromServer(getServiceUrl(route));
  };

  try {
    const journalData = await buildTripData();
    const serverData = await synchronizeWithServer(journalData);
    updateUI(serverData);
  } catch (networkError) {
    // Probably unrecoverable networking error ,i.e.: fetch rejected and threw
    console.error(networkError);
    // Very lazy!! Should rather use a dedicated <div>
    // to display the error and hide the rest.
    updateUI({
      date: 'Ooops. Looks like the service is down. Please, try again later.',
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
  getFromServer(getServiceUrl('all'))
      .then((data) => updateUI(data))
      .catch((error) => console.error(error));
});
