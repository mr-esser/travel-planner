/* Note(!): 'async' requires special babel plugin and config option to work.
 *           Fetch method is passed in to allow testing in a node-environment
 *           where there is no native fetch implementation available.
 */
async function fetchWeatherData(
    latitude = '',
    longitude = '',
    serverBaseUrl = 'http://localhost:8080/weather',
    fetch = window.fetch) {
  const response =
    await fetch(buildWeatherUrl(serverBaseUrl, latitude, longitude), {
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

const buildWeatherUrl = function( baseUrl = '', latitude='', longitude='') {
  const url = new URL(baseUrl);
  url.searchParams.append('lat', latitude);
  url.searchParams.append('long', longitude);
  return url;
};

export {
  fetchWeatherData,
};
