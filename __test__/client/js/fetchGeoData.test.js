import {fetchGeoData}
  from './../../../src/client/js/fetchGeoData';
// Note(!): Fetch is not available natively in a node environment
import fetch, {FetchError} from 'node-fetch';

describe(`Function 'fetchGeoData'`, () => {
  test('should be exported from its module', () => {
    expect(fetchGeoData).toBeDefined();
  });

  test('should throw an error when server is offline', async () => {
    const deadEnd = 'http://localhost:9999/geodata';
    try {
      await fetchGeoData('', '', deadEnd, fetch);
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      expect(error.message)
          .toMatch(
              `request to ${deadEnd}?city=&country= failed, ` +
            'reason: connect ECONNREFUSED 127.0.0.1:9999',
          );
    }
  });

  test('should throw an error if response status is not OK', async () => {
    const baseUrl = 'http://localhost:8080/geodata';
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    try {
      await fetchGeoData('', '', baseUrl, mockFetch);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message)
          .toMatch(`${mockResponse.status}: ${mockResponse.statusText}`);
    }
    expect(mockFetch).toBeCalledTimes(1);
  });

  test('should return requested geo data if response status is OK',
      async () => {
        const route = 'http://localhost:8080/geodata';
        const mockGeoData = {geodata: 'I am a set of geo data'};
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockGeoData),
        };
        const mockFetch = jest.fn().mockResolvedValue(mockResponse);

        const result = await fetchGeoData('', '', route, mockFetch);

        expect(mockFetch).toBeCalledTimes(1);
        expect(result).toEqual(mockGeoData);
      });
});
