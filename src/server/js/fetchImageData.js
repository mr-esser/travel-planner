require('dotenv').config();
const fetch = require('node-fetch');
const {ValidationError} = require('./ValidationError');

const QUERY_MAX_CHAR = 100;
const DEFAULT_SEARCH_TERM = '+landmark';

/* Function to GET image data from third-party service. */
const fetchImageData = async function(
    location = '',
    check = checkParams,
    getServiceUrl=getImageServiceUrl,
) {
  check(location);

  const serviceUrl = getServiceUrl(location);
  console.debug(serviceUrl.toString());

  // Note(!): fetch will only reject on network errors!
  // Image service uses proper HTTP response codes.
  const serviceResponse = await fetch(serviceUrl);
  if (!serviceResponse.ok) {
    const errorMessage = await extractErrorMessage(serviceResponse);
    throw new Error(
        'Image service responded with ' + errorMessage,
    );
  }
  return serviceResponse.json();
};

const extractErrorMessage = async function(response) {
  try {
    return await response.text();
  } catch (error) {
    return 'no particular error message';
  }
};

const checkParams = function(location) {
  if (!location || !location.trim()) {
    // TODO: Code should be set by express error handler!
    throw new ValidationError(400, `Param 'location' must not be empty`);
  }

  if (location.length + DEFAULT_SEARCH_TERM.length > QUERY_MAX_CHAR) {
    // TODO: Code should be set by express error handler!
    throw new ValidationError(400,
        `Param 'location' must not exceed ` +
        `${QUERY_MAX_CHAR-(DEFAULT_SEARCH_TERM.length)} characters`,
    );
  }
};

const getImageServiceUrl = function(
    location='',
    baseUrl = process.env.IMAGE_URL,
    apiKey = process.env.IMAGE_API_KEY,
) {
  const url = new URL(baseUrl);
  url.searchParams.append('key', apiKey);
  url.searchParams.append('q', `${location}${DEFAULT_SEARCH_TERM}`);
  url.searchParams.append('image_type', 'photo');
  url.searchParams.append('lang', 'EN'); // default
  url.searchParams.append('page', 1); // default
  url.searchParams.append('per_page', 3); // minimum
  return url;
};

module.exports = {
  fetchImageData: fetchImageData,
  getImageServiceUrl: getImageServiceUrl,
};
