/* Note(!): 'async' requires special babel plugin and config option to work.
 *           Fetch method is passed in to allow testing in a node-environment
 *           where there is no native fetch implementation available.
 */

/* GET existing trip data from the server.
 * If no id is specified, returns an array of all known records. */
const getTripData = async function(
    id = '',
    url = 'http://localhost:8080/trips',
    fetch = window.fetch) {
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(url + '/' + id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json; charset=utf-8',
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/* Store trip data on the server.
 * Will return 201 response with proper 'Location' header
 * and id'ed copy of the data in the request body. */
const postTripData = async function(
    objectData = {},
    url = 'http://localhost:8080/trips',
    fetch = window.fetch) {
  // Note(!): fetch will only reject on network errors!
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(objectData),
  });
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export {
  getTripData, postTripData,
};
