import {getTripData, postTripData}
  from '../../../src/client/js/syncTripData';
// Note(!): Fetch is not available natively in a node environment
import fetch, {FetchError} from 'node-fetch';

describe(`Function 'getTripData'`, () => {
  test('should be exported from its module', () => {
    expect(getTripData).toBeDefined();
  });

  test('should throw an error when server is offline', async () => {
    const deadEnd = 'http://localhost:9999/trips';
    try {
      await getTripData('', deadEnd, fetch);
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      expect(error.message)
          .toMatch(
              `request to ${deadEnd}/ failed, ` +
            'reason: connect ECONNREFUSED 127.0.0.1:9999',
          );
    }
  });

  test('should throw an error if response status is not OK', async () => {
    const baseUrl = 'http://localhost:8080/trips';
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    try {
      await getTripData('', baseUrl, mockFetch);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message)
          .toMatch(`${mockResponse.status}: ${mockResponse.statusText}`);
    }
    expect(mockFetch).toBeCalledTimes(1);
  });

  test('should return requested trip record if response status is OK',
      async () => {
        const route = 'http://localhost:8080/trips';
        const mockTripRecord = {id: 0, data: 'I am the trip data!'};
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockTripRecord),
        };
        const mockFetch = jest.fn().mockResolvedValue(mockResponse);

        const result = await getTripData('', route, mockFetch);

        expect(mockFetch).toBeCalledTimes(1);
        expect(result).toEqual(mockTripRecord);
      });
});

describe(`Function 'postTripData'`, () => {
  test('should be exported from its module', () => {
    expect(postTripData).toBeDefined();
  });

  test('should throw an error when server is offline', async () => {
    const deadEnd = 'http://localhost:9999/trips';
    try {
      await postTripData({}, deadEnd, fetch);
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      expect(error.message)
          .toMatch(
              `request to ${deadEnd} failed, ` +
            'reason: connect ECONNREFUSED 127.0.0.1:9999',
          );
    }
  });

  test('should throw an error if response status is not OK', async () => {
    const baseUrl = 'http://localhost:8080/trips';
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: 'You made an error',
    };
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    try {
      await postTripData({}, baseUrl, mockFetch);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message)
          .toMatch(`${mockResponse.status}: ${mockResponse.statusText}`);
    }
    expect(mockFetch).toBeCalledTimes(1);
  });

  test('should return requested trip record if response status is OK_CREATED',
      async () => {
        const route = 'http://localhost:8080/trips';
        const mockTripRecord = {id: 0, data: 'I am the trip data!'};
        const mockResponse = {
          ok: true,
          status: 201,
          statusText: 'OK',
          json: () => Promise.resolve(mockTripRecord),
        };
        const mockFetch = jest.fn().mockResolvedValue(mockResponse);

        const result = await postTripData({}, route, mockFetch);

        expect(mockFetch).toBeCalledTimes(1);
        expect(result).toEqual(mockTripRecord);
      });
});
