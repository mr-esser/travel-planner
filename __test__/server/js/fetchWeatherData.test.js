jest.mock('node-fetch');
const fetch = require('node-fetch');

const {fetchWeatherData, getWeatherServiceUrl} =
 require('./../../../src/server/js/fetchWeatherData');
const {ValidationError} =
 require('./../../../src/server/js/ValidationError');

// Note(!): Don't rely on default arguments to keep tests independent of env!
describe(`'getWeatherServiceUrl' should`, () => {
  test(`return a well-formed URL if all args are present`, () => {
    const url = getWeatherServiceUrl('55.5', '-67.9', 'https://api.superweather.io/forecast', 'humptydumpty');
    expect(url.toString())
        .toEqual('https://api.superweather.io/forecast?key=humptydumpty&lang=EN&units=M&days=16&lat=55.5&lon=-67.9');
  });

  test(`return a well-formed URL as long as base URL is a valid URL`, () => {
    const url = getWeatherServiceUrl(undefined, undefined, 'https://api.superweather.io/forecast', '');
    expect(url.toString())
        .toEqual('https://api.superweather.io/forecast?key=&lang=EN&units=M&days=16&lat=&lon=');
  });

  test(`throw an error if base URL is not a valid URL`, () => {
    expect(() => {
      getWeatherServiceUrl(
          undefined, undefined, 'abc', '', /* prevent fallback*/
      );
    }).toThrow();
  });
});

describe(`'fetchWeatherData' should`, () => {
  beforeEach( () => {
    // Note(!): This is essential!
    // It takes care of resetting the module mocks after each test.
    jest.clearAllMocks();
  });

  const expectedErrorMessage =
  `Params 'latitude' and 'longitude' must both be numbers`;
  test.each([
    ['       ', undefined, ValidationError, expectedErrorMessage],
    [undefined, undefined, ValidationError, expectedErrorMessage],
    [44.500000, '       ', ValidationError, expectedErrorMessage],
    [44.500000, undefined, ValidationError, expectedErrorMessage],
  ])(`throw a 'ValidationError' if 'latitude' = %s and 'longitude' = %s`,
      async (latitude, longitude, expectedErrorClass, expectedErrorMessage) => {
        expect.hasAssertions();
        try {
          await fetchWeatherData(latitude, longitude);
        } catch (error) {
          expect(error).toBeInstanceOf(expectedErrorClass);
          expect(error.message)
              .toMatch(expectedErrorMessage);
        }
      });

  // Happy path!
  test(`return valid json given valid 'latitude' and 'longitude'`,
      async () => {
        const latitude = 52.52;
        const longitude = 13.41;
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.superweather.io/searchWithSomeQuery';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        // Note(!): Actual API result
        const mockWeatherData = {
          data: [{
            moonrise_ts: 1601308688,
            wind_cdir: 'SE',
            rh: 62,
            pres: 1008.16,
            high_temp: 13.3,
            sunset_ts: 1601312026,
            ozone: 286.622,
            moon_phase: 0.927331,
            wind_gust_spd: 7.29277,
            snow_depth: 0,
            clouds: 90,
            ts: 1601244060,
            sunrise_ts: 1601269574,
            app_min_temp: 12.8,
            wind_spd: 1.91734,
            pop: 0,
            wind_cdir_full: 'southeast',
            slp: 1012.73,
            moon_phase_lunation: 0.38,
            valid_date: '2020-09-28',
            app_max_temp: 16.9,
            vis: 0,
            dewpt: 7.6,
            snow: 0,
            uv: 0.785006,
            weather: {
              icon: 'c04d',
              code: 804,
              description: 'Overcast clouds',
            },
            wind_dir: 135,
            max_dhi: null,
            clouds_hi: 34,
            precip: 0,
            low_temp: 11.3,
            max_temp: 16.9,
            moonset_ts: 1601258186,
            datetime: '2020-09-28',
            temp: 15.1,
            min_temp: 12.8,
            clouds_mid: 43,
            clouds_low: 44,
          },
          ],
          city_name: 'Berlin',
          lon: 13.41,
          timezone: 'Europe/Berlin',
          lat: 52.52,
          country_code: 'DE',
          state_code: '16',
        };
        const mockFnJson = jest.fn().mockResolvedValue(mockWeatherData);
        const mockServiceResponse = {
          ok: true,
          status: 200,
          json: mockFnJson,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        const result = await fetchWeatherData(latitude, longitude, mockFnCheck,
            mockFnGetServiceUrl);

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnCheck.mock.calls[0][0]).toBe(latitude);
        expect(mockFnCheck.mock.calls[0][1]).toBe(longitude);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl.mock.calls[0][0]).toBe(latitude);
        expect(mockFnGetServiceUrl.mock.calls[0][1]).toBe(longitude);
        expect(mockFnGetServiceUrl).toReturnWith(mockServiceUrl);
        expect(fetch).toBeCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe(mockServiceUrl);
        expect(fetch).toReturnWith(Promise.resolve(mockServiceResponse));
        expect(mockFnJson).toBeCalledTimes(1);
        expect(mockFnJson).toReturnWith(Promise.resolve(mockFnJson));
        expect(result).toBe(mockWeatherData);
      });

  test(`throw an error if weather service is unavailable`, async () => {
    expect.hasAssertions();

    const mockFnCheck = jest.fn();
    const mockFnGetServiceUrl = jest.fn();
    const mockError = new Error('Service unavailable');
    fetch.mockRejectedValue(mockError);
    try {
      await fetchWeatherData(52.52, 13.41, mockFnCheck, mockFnGetServiceUrl);
    } catch (error) {
      expect(error).toBe(mockError);
    }
  });

  test(`throw an error if service response code is not OK`, async () => {
    expect.assertions(5);

    const latitude = 52.52;
    const longitude = 13.42;
    const mockFnCheck = jest.fn();
    const mockServiceUrl = 'http://api.superweather.io/searchWithSomeQuery';
    const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
    const mockErrorObj = {
      error: 'API key not valid, or not yet activated.',
    };
    const mockFnJson = jest.fn().mockResolvedValue(mockErrorObj);
    const mockServiceResponse = {ok: false, status: 403, json: mockFnJson};
    fetch.mockResolvedValue(mockServiceResponse);

    try {
      await fetchWeatherData(latitude, longitude, mockFnCheck,
          mockFnGetServiceUrl);
    } catch (error) {
      expect(error.message).toMatch(
          'Weather service responded with HTTP code ' +
        mockServiceResponse.status + ' and message ' + mockErrorObj.error,
      );
    }
    expect(mockFnCheck).toBeCalledTimes(1);
    expect(mockFnGetServiceUrl).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(1);
    expect(mockFnJson).toBeCalledTimes(1);
  });

  test(`throw an error if weather service response body is no valid json`,
      async () => {
        expect.assertions(5);

        const latitude = 52.52;
        const longitude = 13.42;
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.superweather.io/searchWithSomeQuery';
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
          await fetchWeatherData(latitude, longitude, mockFnCheck,
              mockFnGetServiceUrl);
        } catch (error) {
          expect(error).toBe(mockError);
        }

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(mockFnJson).toBeCalledTimes(1);
      });
});
