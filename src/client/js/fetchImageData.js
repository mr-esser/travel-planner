/* Note(!): 'async' requires special babel plugin and config option to work.
 *           Fetch method is passed in to allow testing in a node-environment
 *           where there is no native fetch implementation available.
 */
async function fetchImageData(
    location = '',
    serverBaseUrl = 'http://localhost:8080/imagedata',
    fetch = window.fetch) {
  const response =
    await fetch(buildImageUrl(serverBaseUrl, location), {
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

const buildImageUrl = function( baseUrl = '', location = '') {
  const url = new URL(baseUrl);
  url.searchParams.append('loc', location);
  return url;
};

export {
  fetchImageData,
};
