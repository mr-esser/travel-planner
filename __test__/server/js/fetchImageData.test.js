jest.mock('node-fetch');
const fetch = require('node-fetch');

const {fetchImageData, getImageServiceUrl} =
 require('../../../src/server/js/fetchImageData');
const {ValidationError} =
 require('../../../src/server/js/ValidationError');

// Note(!): Don't rely on default arguments to keep tests independent of env!
describe(`'getImageServiceUrl' should`, () => {
  test(`return a well-formed URL if all args are present`, () => {
    const url = getImageServiceUrl('Berlin', 'https://api.superpix.io/images', 'humptydumpty');
    expect(url.toString())
        .toEqual('https://api.superpix.io/images?key=humptydumpty&q=Berlin%2Blandmark&image_type=photo&lang=EN&page=1&per_page=3');
  });

  test(`return a well-formed URL as long as base URL is a valid URL`, () => {
    const url = getImageServiceUrl(undefined, 'https://api.superpix.io/images', '');
    expect(url.toString())
        .toEqual('https://api.superpix.io/images?key=&q=%2Blandmark&image_type=photo&lang=EN&page=1&per_page=3');
  });

  test(`throw an error if base URL is not a valid URL`, () => {
    expect(() => {
      getImageServiceUrl(
          undefined, 'abc', '', /* prevent fallback*/
      );
    }).toThrow();
  });
});

describe(`'fetchImageData' should`, () => {
  beforeEach( () => {
    // Note(!): This is essential!
    // It takes care of resetting the module mocks after each test.
    jest.clearAllMocks();
  });

  const longLocationName =
  'lllllllllllllllllllllllllllllllllllllll' +
  'lllllllllllllllllllllllllllllllllllllll' +
  'llllllllllllllllllllllll';
  const expectedErrorMessageLocationEmpty =
    `Param 'location' must not be empty`;
  const expectedErrorMessageLocationTooLong =
    `Param 'location' must not exceed ` +
    `${100-('+location'.length)} characters`;

  test.each([
    ['       ', ValidationError, expectedErrorMessageLocationEmpty],
    [undefined, ValidationError, expectedErrorMessageLocationEmpty],
    [longLocationName, ValidationError, expectedErrorMessageLocationTooLong],
  ])(`throw a 'ValidationError' if 'location' = '%s'`,
      async (location, expectedErrorClass, expectedErrorMessage) => {
        expect.hasAssertions();
        try {
          await fetchImageData(location);
        } catch (error) {
          expect(error).toBeInstanceOf(expectedErrorClass);
          expect(error.message)
              .toMatch(expectedErrorMessage);
        }
      });

  // ///////
  // Happy path!
  test(`return valid json given valid 'location'`, async () => {
    const location = 'Berlin';
    const mockFnCheck = jest.fn();
    const mockServiceUrl = 'http://api.superpix.io/searchWithSomeQuery';
    const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
    // Note(!): Actual API result
    const mockImageData = {
      total: 297,
      totalHits: 297,
      hits: [
        {
          id: 201939,
          pageURL: 'https://pixabay.com/photos/brandenburger-tor-dusk-dawn-201939/',
          type: 'photo',
          tags: 'brandenburger tor, dusk, dawn',
          previewURL: 'https://cdn.pixabay.com/photo/2013/10/28/18/51/brandenburger-tor-201939_150.jpg',
          previewWidth: 150,
          previewHeight: 112,
          webformatURL: 'https://pixabay.com/get/54e0d44a495bb10ff3d8992cc62034781036dfe04e507749742779dc904dc0_640.jpg',
          webformatWidth: 640,
          webformatHeight: 480,
          largeImageURL: 'https://pixabay.com/get/54e0d44a495bb108f5d0846096293f7d133ad7e4564c704f752e73d69f4ac55d_1280.jpg',
          imageWidth: 2560,
          imageHeight: 1920,
          imageSize: 741393,
          views: 168647,
          downloads: 106533,
          favorites: 435,
          likes: 561,
          comments: 111,
          user_id: 5337,
          user: 'ArtTower',
          userImageURL: 'https://cdn.pixabay.com/user/2019/07/27/00-12-46-447_250x250.jpg',
        },
      ],
    };
    const mockFnJson = jest.fn().mockResolvedValue(mockImageData);
    const mockServiceResponse = {
      ok: true,
      status: 200,
      json: mockFnJson,
    };
    fetch.mockResolvedValue(mockServiceResponse);

    const result = await fetchImageData(location, mockFnCheck,
        mockFnGetServiceUrl);

    expect(mockFnCheck).toBeCalledTimes(1);
    expect(mockFnCheck.mock.calls[0][0]).toBe(location);
    expect(mockFnGetServiceUrl).toBeCalledTimes(1);
    expect(mockFnGetServiceUrl.mock.calls[0][0]).toBe(location);
    expect(mockFnGetServiceUrl).toReturnWith(mockServiceUrl);
    expect(fetch).toBeCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(mockServiceUrl);
    expect(fetch).toReturnWith(Promise.resolve(mockServiceResponse));
    expect(mockFnJson).toBeCalledTimes(1);
    expect(mockFnJson).toReturnWith(Promise.resolve(mockFnJson));
    expect(result).toBe(mockImageData);
  });

  test(`throw an error if image service is unavailable`, async () => {
    expect.hasAssertions();

    const mockFnCheck = jest.fn();
    const mockServiceUrl = 'http://api.superpix.io/searchWithSomeQuery';
    const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
    const mockError = new Error('Service unavailable');
    fetch.mockRejectedValue(mockError);
    try {
      await fetchImageData('Berlin', mockFnCheck, mockFnGetServiceUrl);
    } catch (error) {
      expect(error).toBe(mockError);
    }
  });

  test(`throw an error if service response code is not OK`, async () => {
    expect.assertions(5);

    const location = 'Berlin';
    const mockFnCheck = jest.fn();
    const mockServiceUrl = 'http://api.superpix.io/searchWithSomeQuery';
    const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
    const mockErrorText =
       '[ERROR 400] Invalid or missing API key (https://superpix.io/api/docs/).'
    ;
    const mockFnText = jest.fn().mockResolvedValue(mockErrorText);
    const mockServiceResponse = {ok: false, status: 400, text: mockFnText};
    fetch.mockResolvedValue(mockServiceResponse);

    try {
      await fetchImageData(location, mockFnCheck,
          mockFnGetServiceUrl);
    } catch (error) {
      expect(error.message).toMatch(
          'Image service responded with ' + mockErrorText,
      );
    }
    expect(mockFnCheck).toBeCalledTimes(1);
    expect(mockFnGetServiceUrl).toBeCalledTimes(1);
    expect(fetch).toBeCalledTimes(1);
    expect(mockFnText).toBeCalledTimes(1);
  });

  test(`throw an error if service response is ERROR and message not present`,
      async () => {
        expect.assertions(6);

        const location = 'Berlin';
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.superpix.io/searchWithSomeQuery';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        const mockFnJson = jest.fn();
        const mockFnText =
          jest.fn().mockRejectedValue(new Error('Sorry, no message'));
        const mockServiceResponse = {
          ok: false,
          status: 400,
          text: mockFnText,
          json: mockFnJson,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        try {
          await fetchImageData(location, mockFnCheck,
              mockFnGetServiceUrl);
        } catch (error) {
          expect(error.message).toMatch(
              'Image service responded with no particular error message',
          );
        }
        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(mockFnText).toBeCalledTimes(1);
        expect(mockFnJson).not.toBeCalled();
      });


  test(`throw an error if image service response body is no valid json`,
      async () => {
        expect.assertions(6);

        const location = 'Berlin';
        const mockFnCheck = jest.fn();
        const mockServiceUrl = 'http://api.superpix.io/searchWithSomeQuery';
        const mockFnGetServiceUrl = jest.fn().mockReturnValue(mockServiceUrl);
        const mockError = new Error('Invalid JSON');
        const mockFnText = jest.fn();
        const mockFnJson = jest.fn().mockRejectedValue(mockError);
        const mockServiceResponse = {
          ok: true,
          status: 200,
          json: mockFnJson,
          text: mockFnText,
        };
        fetch.mockResolvedValue(mockServiceResponse);

        try {
          await fetchImageData(location, mockFnCheck,
              mockFnGetServiceUrl);
        } catch (error) {
          expect(error).toBe(mockError);
        }

        expect(mockFnCheck).toBeCalledTimes(1);
        expect(mockFnGetServiceUrl).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(mockFnText).not.toBeCalled();
        expect(mockFnJson).toBeCalledTimes(1);
      });
});
