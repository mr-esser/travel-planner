import {buildForecastData, calculateDurationDays, buildImageData}
  from '../../../src/client/js/aggregateData';

describe(`Function 'calculateDurationDays'`, () => {
  test('should be exported from its module', () => {
    expect(calculateDurationDays).toBeDefined();
  });

  test('should return 1 days if departure and return dates are identical',
      () => {
        const departureDate = new Date('2020-12-10');
        const returnDate = new Date(departureDate);
        expect(calculateDurationDays(departureDate, returnDate)).toBe(1);
      });

  test('should return 2 days if return date is on the next calendar day',
      () => {
        const departureDate = new Date('2020-12-22');
        const returnDate = new Date('2020-12-23');
        expect(calculateDurationDays(departureDate, returnDate)).toBe(2);
      });

  test('should return 3 days if return date is 2 calendar days after departure',
      () => {
        const departureDate = new Date('2020-12-22');
        const returnDate = new Date('2020-12-24');
        expect(calculateDurationDays(departureDate, returnDate)).toBe(3);
      });

  test('should return -2 days if return date is on day before departure',
      () => {
        const departureDate = new Date('2020-12-22');
        const returnDate = new Date('2020-12-21');
        expect(calculateDurationDays(departureDate, returnDate)).toBe(-2);
      });

  test(`should return 'unavailable' if first date is null`,
      () => {
        const departureDate = null;
        const returnDate = new Date();
        expect(calculateDurationDays(departureDate, returnDate))
            .toBe('unavailable');
      });

  test(`should return 'unavailable' if second date is undefined`,
      () => {
        const departureDate = new Date();
        const returnDate = undefined;
        expect(calculateDurationDays(departureDate, returnDate))
            .toBe('unavailable');
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

});
