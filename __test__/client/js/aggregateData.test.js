import {
  collectTravelInfo, buildForecastData, calculateDurationDays,
  buildImageData, buildTripData,
} from '../../../src/client/js/aggregateData';

describe(`Function 'calculateDurationDays'`, () => {
  test('should be exported from its module', () => {
    expect(calculateDurationDays).toBeDefined();
  });

  test.each([
    ['2020-12-10', '2020-12-10', +1],
    ['2020-12-10', '2020-12-11', +2],
    ['2020-12-10', '2020-12-14', +5],
    ['2020-12-10', '2020-12-09', -2],
    [null, null, 0],
    [undefined, undefined, 0],
    ['Hello, world!', '2020-12-10', 0],
    ['2020-12-10', 'Hello, world!', 0],
  ])(`when called with '%s' and '%s' should yield '%i'`,
      (start, end, expected) => {
        expect(calculateDurationDays(start, end)).toBe(expected);
      });

  test(`should return only full days`, () => {
    const departureDate = new Date(2011, 1, 1, 1, 2, 33, 444);
    const returnDate = new Date(2011, 1, 4, 4, 3, 22, 111);
    expect(calculateDurationDays(departureDate, returnDate))
        .toBe(4);
  });
});

describe(`Function 'buildForecastData'`, () => {
  test('should be exported from its module', () => {
    expect(buildForecastData).toBeDefined();
  });

  test.each([
    [undefined, []],
    [null, []],
    [{}, []],
    [{data: []}, []],
  ])(`should return an empty array if raw input is (%s)`, (raw, expected) => {
    expect(buildForecastData(raw)).toEqual(expected);
  });

  test(`should return array of compacted forecast records given raw input `,
      () => {
        expect(buildForecastData({
          data: [
            {
              moonrise_ts: 1605871652,
              wind_cdir: 'W',
              rh: 84,
              pres: 1027.22,
              high_temp: 2.3,
              sunset_ts: 1605885016,
              ozone: 296.988,
              moon_phase: 0.365761,
              wind_gust_spd: 8.23168,
              snow_depth: 0,
              clouds: 29,
              ts: 1605826860,
              sunrise_ts: 1605854336,
              app_min_temp: -3.4,
              wind_spd: 2.0879,
              pop: 10,
              wind_cdir_full: 'west',
              slp: 1032.05,
              moon_phase_lunation: 0.17,
              valid_date: '2020-11-20',
              app_max_temp: 2.4,
              vis: 0,
              dewpt: 1.1,
              snow: 0,
              uv: 0.757605,
              weather: {
                icon: 'c02d',
                code: 802,
                description: 'Scattered clouds',
              },
              wind_dir: 274,
              max_dhi: null,
              clouds_hi: 0,
              precip: 0.0898438,
              low_temp: 1,
              max_temp: 5.8,
              moonset_ts: 1605903374,
              datetime: '2020-11-20',
              temp: 3.5,
              min_temp: 1.2,
              clouds_mid: 4,
              clouds_low: 27,
            },
          ],
          city_name: 'Berlin',
          lon: 13.41,
          timezone: 'Europe\/Berlin',
          lat: 52.52,
          country_code: 'DE',
          state_code: 16,
        })).toEqual([{
          datetime: '2020-11-20',
          max_temp: 5.8,
          min_temp: 1.2,
          icon: `https://www.weatherbit.io/static/img/icons/c02d.png`,
          description: 'Scattered clouds',
        }]);
      });
});

describe(`Function 'buildImageData'`, () => {
  test('should be exported from its module', () => {
    expect(buildImageData).toBeDefined();
  });

  test.each([
    [undefined, {}],
    [null, {}],
    [{}, {}],
    [{hits: []}, {}],
  ])(`should return an empty object if raw input is (%s)`, (raw, expected) => {
    expect(buildImageData(raw)).toEqual(expected);
  });

  test(`should return one compact image record given raw input`, () => {
    expect(buildImageData({
      total: 299,
      totalHits: 299,
      hits: [{
        id: 201939,
        pageURL: 'https://pixabay.com/photos/brandenburger-tor-dusk-dawn-201939/',
        type: 'photo',
        tags: 'brandenburger tor, dusk, dawn',
        previewURL: 'https://cdn.pixabay.com/photo/2013/10/28/18/51/brandenburger-tor-201939_150.jpg',
        previewWidth: 150,
        previewHeight: 112,
        webformatURL: 'https://pixabay.com/get/54e0d44a495bb10ff3d8992cc62034781036dfe04e507749702772d7944bc7_640.jpg',
        webformatWidth: 640,
        webformatHeight: 480,
        largeImageURL: 'https://pixabay.com/get/54e0d44a495bb108f5d0846096293f7d133ad7e4564c704f752a73dd944ec35a_1280.jpg',
        imageWidth: 2560,
        imageHeight: 1920,
        imageSize: 741393,
        views: 174229,
        downloads: 110408,
        favorites: 447,
        likes: 578,
        comments: 112,
        user_id: 5337,
        user: 'ArtTower',
        userImageURL: 'https://cdn.pixabay.com/user/2019/07/27/00-12-46-447_250x250.jpg',
      }],
    })).toEqual({
      url: 'https://pixabay.com/get/54e0d44a495bb10ff3d8992cc62034781036dfe04e507749702772d7944bc7_640.jpg',
      width: 640,
      height: 480,
      user: 'ArtTower',
    });
  });
});
describe(`Function 'buildTripData'`, () => {
  test('should be exported from its module', () => {
    expect(buildTripData).toBeDefined();
  });

  test('should return a default object given no input data', async () => {
    expect(await buildTripData(null, undefined,
        null, undefined, null, undefined))
        .toEqual({
          city: '',
          country: '',
          departureDate: '',
          returnDate: '',
          duration: 0,
          forecasts: [],
          image: {},
        });
  });

  test('should return correctly filled result object given adequate input data',
      async () => {
        expect(
            await buildTripData('Berlin', 'DE', '1979-07-12', '1979-07-15',
                {
                  data: [
                    {
                      sunset_ts: 1605885016,
                      moon_phase: 0.365761,
                      datetime: '1979-07-12',
                      app_max_temp: 2.4,
                      uv: 0.757605,
                      weather: {
                        icon: 'c02d',
                        code: 802,
                        description: 'Scattered clouds',
                      },
                      max_dhi: null,
                      clouds_hi: 0,
                      max_temp: 5.8,
                      min_temp: 1.2,
                    },
                    {
                      sunset_ts: 1605885014,
                      moon_phase: 0.365762,
                      datetime: '1979-07-13',
                      app_max_temp: 3.4,
                      uv: 0.657605,
                      weather: {
                        icon: 'c03d',
                        code: 802,
                        description: 'Other clouds',
                      },
                      clouds_hi: 6,
                      max_temp: 7.8,
                      min_temp: 4.3,
                    },
                  ],
                  city_name: 'Berlin',
                  lon: 13.41,
                  timezone: 'Europe\/Berlin',
                  lat: 52.52,
                  country_code: 'DE',
                  state_code: 16,
                },
                {
                  total: 299,
                  totalHits: 299,
                  hits: [
                    {
                      id: 201939,
                      pageURL: 'https://pixabay.com/photos/brandenburger-tor-dusk-dawn-201939/',
                      type: 'photo',
                      tags: 'brandenburger tor, dusk, dawn',
                      previewURL: 'https://cdn.pixabay.com/photo/2013/10/28/18/51/brandenburger-tor-201939_150.jpg',
                      previewWidth: 150,
                      previewHeight: 112,
                      webformatURL: 'https://pixabay.com/get/54e0d44a495bb10ff3d8992cc62034781036dfe04e507749702772d7944bc7_640.jpg',
                      webformatWidth: 640,
                      webformatHeight: 480,
                      user_id: 5337,
                      user: 'ArtTower',
                    },
                    {
                      id: 401737,
                      pageURL: 'https://pixabay.com/photos/brandenburger-tor-401737/',
                      type: 'photo',
                      tags: 'brandenburger tor',
                      previewURL: 'https://cdn.pixabay.com/photo/2013/10/28/18/51/brandenburger-tor-201939_150.jpg',
                      previewWidth: 350,
                      previewHeight: 412,
                      webformatURL: 'https://pixabay.com/get/54e0d44a495bb10ff3d8992cc62034781036dfe04e507749702772d7944bc7_640.jpg',
                      webformatWidth: 740,
                      webformatHeight: 489,
                      user_id: 5338,
                      user: 'HighTower',
                    },
                  ]})).toEqual({
          city: 'Berlin',
          country: 'DE',
          departureDate: '1979-07-12',
          returnDate: '1979-07-15',
          duration: 4,
          forecasts: [
            {
              datetime: '1979-07-12',
              max_temp: 5.8,
              min_temp: 1.2,
              icon: `https://www.weatherbit.io/static/img/icons/c02d.png`,
              description: 'Scattered clouds',
            },
            {
              datetime: '1979-07-13',
              max_temp: 7.8,
              min_temp: 4.3,
              icon: `https://www.weatherbit.io/static/img/icons/c03d.png`,
              description: 'Other clouds',
            },
          ],
          image: {
            url: 'https://pixabay.com/get/54e0d44a495bb10ff3d8992cc62034781036dfe04e507749702772d7944bc7_640.jpg',
            width: 640,
            height: 480,
            user: 'ArtTower',
          },
        });
      });
});

describe(`Function 'collectTravelInfo'`, () => {
  let mockGeoData;
  let mockFnFetchGeoData;
  let mockFnFetchWeatherData;
  let mockFnFetchImageData;
  let mockFetchError;
  let expectedTripData;

  beforeEach(() => {
    mockGeoData = {geonames: [{lat: 44, lng: 33}]};
    mockFnFetchGeoData = jest.fn().mockResolvedValue(mockGeoData);
    mockFnFetchWeatherData = jest.fn().mockResolvedValue({});
    mockFnFetchImageData = jest.fn().mockResolvedValue({});
    mockFetchError = new Error('Fetching data failed!');
    expectedTripData = {
      city: 'Berlin',
      country: 'DE',
      departureDate: '2020-12-30',
      duration: 2,
      forecasts: [],
      image: {},
      returnDate: '2020-12-31',
    };
  });

  test('should be exported from its module', () => {
    expect(collectTravelInfo).toBeDefined();
  });

  test('should return a trip when all fetch calls succeed', async () => {
    const tripData = await collectTravelInfo(
        'Berlin', 'DE', '2020-12-30', '2020-12-31',
        mockFnFetchGeoData, mockFnFetchWeatherData, mockFnFetchImageData,
    );
    expect(mockFnFetchGeoData).toBeCalledTimes(1);
    expect(mockFnFetchGeoData.mock.calls[0][0]).toBe('Berlin');
    expect(mockFnFetchGeoData.mock.calls[0][1]).toBe('DE');
    expect(mockFnFetchGeoData).toReturnWith(
        Promise.resolve({geonames: [{lat: 44, lng: 33}]}),
    );
    expect(mockFnFetchWeatherData).toBeCalledTimes(1);
    expect(mockFnFetchWeatherData.mock.calls[0][0]).toBe(44);
    expect(mockFnFetchWeatherData.mock.calls[0][1]).toBe(33);
    expect(mockFnFetchGeoData).toReturnWith(Promise.resolve({}));
    expect(mockFnFetchImageData).toBeCalledTimes(1);
    expect(mockFnFetchImageData.mock.calls[0][0]).toBe('Berlin');
    expect(mockFnFetchGeoData).toReturnWith(Promise.resolve({}));
    expect(tripData).toEqual(expectedTripData);
  });

  test('should return a trip when fetch geo data throws', async () => {
    mockFnFetchGeoData = jest.fn().mockRejectedValue(mockFetchError);
    const tripData = await collectTravelInfo(
        'Berlin', 'DE', '2020-12-30', '2020-12-31',
        mockFnFetchGeoData, mockFnFetchWeatherData, mockFnFetchImageData,
    );
    expect(mockFnFetchGeoData).toBeCalledTimes(1);
    expect(mockFnFetchWeatherData).toBeCalledTimes(0);
    expect(mockFnFetchImageData).toBeCalledTimes(0);
    expect(tripData).toEqual(expectedTripData);
  });

  test('should return a trip when fetch weather data throws', async () => {
    mockFnFetchWeatherData = jest.fn().mockRejectedValue(mockFetchError);
    const tripData = await collectTravelInfo(
        'Berlin', 'DE', '2020-12-30', '2020-12-31',
        mockFnFetchGeoData, mockFnFetchWeatherData, mockFnFetchImageData,
    );
    expect(mockFnFetchGeoData).toBeCalledTimes(1);
    expect(mockFnFetchWeatherData).toBeCalledTimes(1);
    expect(mockFnFetchImageData).toBeCalledTimes(0);
    expect(tripData).toEqual(expectedTripData);
  });

  test('should return a trip when fetch image data throws', async () => {
    mockFnFetchImageData = jest.fn().mockRejectedValue(mockFetchError);
    const tripData = await collectTravelInfo(
        'Berlin', 'DE', '2020-12-30', '2020-12-31',
        mockFnFetchGeoData, mockFnFetchWeatherData, mockFnFetchImageData,
    );
    expect(mockFnFetchGeoData).toBeCalledTimes(1);
    expect(mockFnFetchWeatherData).toBeCalledTimes(1);
    expect(mockFnFetchImageData).toBeCalledTimes(1);
    expect(tripData).toEqual(expectedTripData);
  });
});
