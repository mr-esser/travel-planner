jest.mock('node-fetch');
const fetch = require('node-fetch');
const {fetchGeoData, getGeoServiceUrl} =
 require('./../../../src/server/js/fetchGeoData');
const {ValidationError} =
 require('./../../../src/server/js/ValidationError');

// Note(!): Don't rely on default arguments to keep tests independent of env!
describe(`'getGeoServiceUrl' should`, () => {
  test(`return a well-formed URL if all args are present`, () => {
    const url = getGeoServiceUrl('Berlin', 'DE', 'http://api.geonames.org/search', 'humptydumpty');
    expect(url.toString()).toEqual('http://api.geonames.org/search?username=humptydumpty&lang=EN&maxRows=1&style=short&name=Berlin&country=DE');
  });

  test(`return a well-formed URL as long as base URL is a valid URL`, () => {
    const url = getGeoServiceUrl(undefined, undefined, 'http://api.geonames.org/search', ''/* prevent fallback*/);
    expect(url.toString()).toEqual('http://api.geonames.org/search?username=&lang=EN&maxRows=1&style=short&name=&country=');
  });

  test(`throw an error if base URL is not a valid URL`, () => {
    expect(() => {
      getGeoServiceUrl(undefined, undefined, 'abc', ''/* prevent fallback*/);
    }).toThrow();
  });
});

describe(`'fetchGeoData' should`, () => {
  beforeEach( () => {
    // Note(!): This is essential.
    // It takes care of resetting the module mocks after each test.
    jest.clearAllMocks();
  });

  test(`throw a 'ValidationError' if 'city' is empty`, async () => {
    expect.hasAssertions();
    try {
      await fetchGeoData('  ');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toMatch(`Param 'city' must not be empty`);
    }
  });

  test(`throw a 'ValidationError' if 'city' is undefined`, async () => {
    expect.hasAssertions();
    try {
      await fetchGeoData(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toMatch(`Param 'city' must not be empty`);
    }
  });

  test(`throw a 'ValidationError' if 'country' is not a 2char code`,
      async () => {
        expect.hasAssertions();
        try {
          await fetchGeoData('Berlin', '9AB');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.message)
              .toMatch(`Param 'country' must be a two-letter-code`);
        }
      });

  // Happy path!
  test(`return valid json if 'city'/'country' could be found`,
      async () => {
        const city = 'Berlin';
        const country = 'DE';
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.geonames.org/searchWithSomeQuery';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        // Note(!): Actual API result
        const mockGeoData = {
          totalResultsCount: 2964,
          geonames: [{
            lng: 13.41053,
            geonameId: 2950159,
            countryCode: 'DE',
            name: 'Berlin',
            toponymName: 'Berlin',
            lat: 52.52437,
            fcl: 'P',
            fcode: 'PPLC',
          }],
        };
        const mockFnJson = jest.fn().mockResolvedValue(mockGeoData);
        const mockServiceResponse = {
          ok: true,
          status: 200,
          json: mockFnJson,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        const result =
          await fetchGeoData(city, country, mockFnCheck, mockFnGetServiceUrl);

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnCheck.mock.calls[0][0]).toBe(city);
        expect(mockFnCheck.mock.calls[0][1]).toBe(country);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl.mock.calls[0][0]).toBe(city);
        expect(mockFnGetServiceUrl.mock.calls[0][1]).toBe(country);
        expect(mockFnGetServiceUrl).toReturnWith(mockServiceUrl);
        expect(fetch).toBeCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe(mockServiceUrl);
        expect(fetch).toReturnWith(Promise.resolve(mockServiceResponse));
        expect(mockFnJson).toBeCalledTimes(1);
        expect(mockFnJson).toReturnWith(Promise.resolve(mockFnJson));
        expect(result).toBe(mockGeoData);
      });

  test(`return valid json even if 'city'/'country' could not be found`,
      async () => {
        const city = 'Berlin';
        const country = 'DE';
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.geonames.org/searchWithSomeQuery';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        // Note(!): Actual API result
        const mockGeoData = {
          totalResultsCount: 0,
          geonames: [],
        };
        const mockFnJson = jest.fn().mockResolvedValue(mockGeoData);
        const mockServiceResponse = {
          ok: true,
          status: 200,
          json: mockFnJson,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        const result =
          await fetchGeoData(city, country, mockFnCheck, mockFnGetServiceUrl);

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(mockFnJson).toBeCalledTimes(1);
        expect(result).toBe(mockGeoData);
      });

  test(`throw an error if geo service is not available`, async () => {
    expect.hasAssertions();

    const mockFnCheck = jest.fn();
    const mockFnGetServiceUrl = jest.fn();
    const mockError = new Error('Service unavailable');
    fetch.mockRejectedValue(mockError);
    try {
      await fetchGeoData('Berlin', 'DE', mockFnCheck, mockFnGetServiceUrl);
    } catch (error) {
      expect(error).toBe(mockError);
    }
  });

  test(`throw an error if geo service response code is not OK`, async () => {
    expect.assertions(4);

    const city = 'Unknown';
    const country = 'DE';
    const mockFnCheck = jest.fn();
    const mockServiceUrl = 'http://api.geonames.org/searchWithoutUsername';
    const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
    const mockServiceResponse = {ok: false, status: 401};
    fetch.mockResolvedValue(mockServiceResponse);
    try {
      await fetchGeoData(city, country, mockFnCheck, mockFnGetServiceUrl);
    } catch (error) {
      expect(error.message).toMatch(
          'Geo service responded with HTTP error code ' +
            mockServiceResponse.status,
      );
    }
    expect(mockFnCheck).toBeCalledTimes(1);
    expect(mockFnGetServiceUrl).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(1);
  });

  test(`throw an error if geo service response body is no valid json`,
      async () => {
        expect.assertions(5);

        const city = 'Berlin';
        const country = 'DE';
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.geonames.org/searchWithSomeQuery';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        const mockError = new Error('Invalid JSON');
        const mockFnJson = jest.fn().mockRejectedValue(mockError);
        const mockServiceResponse = {
          ok: true,
          status: 200,
          json: mockFnJson,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        try {
          await fetchGeoData(city, country, mockFnCheck, mockFnGetServiceUrl);
        } catch (error) {
          expect(error).toBe(mockError);
        }

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(mockFnJson).toBeCalledTimes(1);
      });

  test(`throw an error if geo service response body contains application error`,
      async () => {
        expect.assertions(5);

        const city = 'Berlin';
        const country = 'DE';
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.geonames.org/searchThatExceedsCredit';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        // Note(!): Actual API result with abbreviated message.
        const mockGeoData = {
          status: {
            message: 'the daily limit of 20000 credits ... .',
            value: 18,
          },
        };
        const mockFnJson = jest.fn().mockResolvedValue(mockGeoData);
        const mockServiceResponse = {
          ok: true,
          status: 200,
          json: mockFnJson,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        try {
          await fetchGeoData(city, country, mockFnCheck, mockFnGetServiceUrl);
        } catch (error) {
          expect(error.message).toMatch(
              'Geo service responded with message: ' +
              mockGeoData.status.message,
          );
        }

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(mockFnJson).toBeCalledTimes(1);
      });
});
