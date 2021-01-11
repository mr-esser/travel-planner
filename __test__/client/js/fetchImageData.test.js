import {fetchImageData}
  from '../../../src/client/js/fetchImageData';
// Note(!): Fetch is not available natively in a node environment
import fetch, {FetchError} from 'node-fetch';

describe(`Function 'fetchImageData'`, () => {
  test('should be exported from its module', () => {
    expect(fetchImageData).toBeDefined();
  });

  test('should throw an error when server is offline', async () => {
    const deadEnd = 'http://localhost:9999/imagedata';
    try {
      await fetchImageData('', deadEnd, fetch);
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      expect(error.message)
          .toMatch(
              `request to ${deadEnd}?loc= failed, ` +
            'reason: connect ECONNREFUSED 127.0.0.1:9999',
          );
    }
  });

  test('should throw an error if response status is not OK', async () => {
    const baseUrl = 'http://localhost:8080/imagedata';
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    try {
      await fetchImageData('', baseUrl, mockFetch);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message)
          .toMatch(`${mockResponse.status}: ${mockResponse.statusText}`);
    }
    expect(mockFetch).toBeCalledTimes(1);
  });

  test('should return requested image data if response status is OK',
      async () => {
        const baseUrl = 'http://localhost:8080/imagedata';
        const mockImageData = {imagedata: 'I am a set of image data'};
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockImageData),
        };
        const mockFetch = jest.fn().mockResolvedValue(mockResponse);

        const result = await fetchImageData('', baseUrl, mockFetch);

        expect(mockFetch).toBeCalledTimes(1);
        expect(result).toEqual(mockImageData);
      });
});
