/* Integration test cases.

   Thanks to Robert Gao for his blog post on setting up the tests.
   See https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/.

   Note(!): Tests will consume API credits. Do run only when necessary!
            Must call return to have tests exit cleanly!
            Keep an eye on issue https://github.com/visionmedia/supertest/issues/437.
            dealing with problems when shutting down the server after the tests.
*/

const request = require('supertest');
const {app} = require('../../../src/server/js/server');

describe('GET on /geodata', () => {
  test(`should yield one geo record given valid params`,
      () => {
        return/* ! */ request(app)
            .get(`/geodata?city=Berlin&country=DE`)
            .expect('Content-Type', /json/)
            .expect(200).then((res) => {
              expect(res.body.totalResultsCount).toBeGreaterThan(0);
              expect(res.body.geonames.length).toBe(1);
              const firstRecord = res.body.geonames[0];
              expect(firstRecord.name).toBe('Berlin');
              expect(firstRecord.countryCode).toBe('DE');
              expect(firstRecord.lng).toBe('13.41053');
              expect(firstRecord.lat).toBe('52.52437');
            });
      },
  );
});

describe('GET on /weather', () => {
  test(`should yield one forecast record given valid params`, () => {
    return/* ! */ request(app)
        .get('/weather?lat=52.52&long=13.41')
        .expect('Content-Type', /json/)
        .expect(200).then((res) => {
          expect(res.body.data.length).toBe(16);
          expect(res.body.city_name).toBe('Berlin');
          expect(res.body.lat).toBe(52.52);
          expect(res.body.lon).toBe(13.41);
          expect(res.body.country_code).toBe('DE');
          const firstRecord = res.body.data[0];
          expect(firstRecord.valid_date).toBeDefined();
          expect(firstRecord.max_temp).toBeDefined();
          expect(firstRecord.min_temp).toBeDefined();
          expect(firstRecord.pop).toBeDefined();
          expect(firstRecord.weather.icon).toBeDefined();
          expect(firstRecord.weather.code).toBeDefined();
          expect(firstRecord.weather.description).toBeDefined();
        });
  });
});

describe('GET on /imagedata', () => {
  test(`should yield one usable image record given valid params`, () => {
    return/* ! */ request(app)
        .get('/imagedata?loc=Berlin')
        .expect('Content-Type', /json/)
        .expect(200).then((res) => {
          expect(res.body.total).toBeGreaterThan(0);
          expect(res.body.totalHits).toBeGreaterThan(0);
          expect(res.body.hits.length).toBe(3);
          const firstRecord = res.body.hits[0];
          expect(firstRecord.id).toBeDefined();
          expect(firstRecord.type).toBe('photo');
          expect(firstRecord.previewURL).toBeDefined();
          expect(firstRecord.previewWidth).toBeDefined();
          expect(firstRecord.previewHeight).toBeDefined();
          expect(firstRecord.webformatURL).toBeDefined();
          expect(firstRecord.webformatWidth).toBeDefined();
          expect(firstRecord.webformatHeight).toBeDefined();
          expect(firstRecord.user).toBeDefined();
        });
  });
});
