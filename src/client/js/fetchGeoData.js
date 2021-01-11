/* Note(!): 'async' requires special babel plugin and config option to work.
 *           Fetch method is passed in to allow testing in a node-environment
 *           where there is no native fetch implementation available.
 */
async function fetchGeoData(
    city = '',
    country = '',
    serverBaseUrl = 'http://localhost:8080/geodata',
    fetch = window.fetch) {
  const response = await fetch(buildGeoUrl(serverBaseUrl, city, country), {
    method: 'GET',
    headers: {
      'Accept': 'application/json;charset=utf-8',
    },
  });
  if (!response.ok) {
    throw new Error(
        `${response.status}: ${response.statusText}`,
    );
  }
  return response.json();
}

const buildGeoUrl = function(
    baseUrl = '',
    city='',
    country='',
) {
  const url = new URL(baseUrl);
  url.searchParams.append('city', city);
  url.searchParams.append('country', country);
  return url;
};

export {
  fetchGeoData,
};
