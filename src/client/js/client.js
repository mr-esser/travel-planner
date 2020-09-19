import {WEATHER_API_KEY} from './apiKey';

/* Global Variables */
// Unit system used in weather map API requests
const UNITS = 'metric';

// Journal server info
const SERVER = 'localhost';
const PORT = 8080;

/* Public helper functions */
// Today's date printed in an unambiguous format (e.g.: 'Thu Jan 01 1970').
// App could be up for a long time, so not making this a constant.
const createDisplayDate = function() {
  return new Date().toDateString();
};

const getWeatherServiceUrl = function(zipAndCountryCode) {
  return `http://api.openweathermap.org/data/2.5/weather?zip=${zipAndCountryCode}&units=${UNITS}&appid=${WEATHER_API_KEY}`;
};

const getJournalServiceUrl = function(route = 'all') {
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
/* Function to GET weather data from third-party service. */
const getWeatherData = async function(zipAndCountryCode) {
  const serviceUrl = getWeatherServiceUrl(zipAndCountryCode);
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(serviceUrl);
  return response.json();
};

/* Function to POST project data to sever */
const postJournalData = async function(url = '', journalData = {}) {
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(journalData),
  });
  return response.json();
};

/* Function to GET project data from server */
const getJournalData = async function(url = '') {
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(url);
  return response.json();
};

/* MAIN function called by event listener on 'Generate' button */
const handleGenerate = async function handleGenerate(event) {
  const buildJournalData = async function() {
    const journalData = {
      date: createDisplayDate(),
      location: 'unavailable',
      temperature: 'unavailable',
      content: getInputText('#feelings'),
    };
    try {
      const weatherData = await getWeatherData(getInputText('#zip'));
      // Temperature unit is hard-coded. See constant UNITS.
      journalData.temperature = `${weatherData.main.temp} °C`;
      journalData.location = `${weatherData.name}, ${weatherData.sys.country}`;
    } catch (error) {
      // Data is incomplete, but it can still be posted and displayed.
      // So, log and then go on.
      console.info(error);
    }
    return journalData;
  };

  const synchronizeWithServer = async function(journalData) {
    await postJournalData(getJournalServiceUrl(), journalData);
    return getJournalData(getJournalServiceUrl());
  };

  try {
    const journalData = await buildJournalData();
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
  getJournalData(getJournalServiceUrl())
      .then((data) => updateUI(data))
      .catch((error) => console.error(error));
});
