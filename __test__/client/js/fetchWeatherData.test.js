import {fetchWeatherData}
  from '../../../src/client/js/fetchWeatherData';
// Note(!): Fetch is not available natively in a node environment
import fetch, {FetchError} from 'node-fetch';

describe(`Function 'fetchWeatherData'`, () => {
  test('should be exported from its module', () => {
    expect(fetchWeatherData).toBeDefined();
  });

  test('should throw an error when server is offline', async () => {
    const deadEnd = 'http://localhost:9999/weather';
    try {
      await fetchWeatherData('', '', deadEnd, fetch);
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      expect(error.message)
          .toMatch(
              `request to ${deadEnd}?lat=&long= failed, ` +
            'reason: connect ECONNREFUSED 127.0.0.1:9999',
          );
    }
  });

  test('should throw an error if response status is not OK', async () => {
    const baseUrl = 'http://localhost:8080/weather';
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    try {
      await fetchWeatherData('', '', baseUrl, mockFetch);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message)
          .toMatch(`${mockResponse.status}: ${mockResponse.statusText}`);
    }
    expect(mockFetch).toBeCalledTimes(1);
  });

  test('should return requested forecast if response status is OK',
      async () => {
        const route = 'http://localhost:8080/weather';
        const mockWeatherData = {weather: 'I am the forecast'};
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockWeatherData),
        };
        const mockFetch = jest.fn().mockResolvedValue(mockResponse);

        const result = await fetchWeatherData('', '', route, mockFetch);

        expect(mockFetch).toBeCalledTimes(1);
        expect(result).toEqual(mockWeatherData);
      });
});
