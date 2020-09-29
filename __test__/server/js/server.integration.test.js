/* Integration test cases.

   Thanks to Robert Gao for his blog post on setting up the tests.
   See https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/.

   Note(!): Tests will consume API credits. Do run only when necessary!
            Must call return to have tests exit cleanly!
            Keep an eye on issue https://github.com/visionmedia/supertest/issues/437.
            dealing with problems when shutting down the server after the tests.
*/

const request = require('supertest');
const server = require('../../../src/server/js/server');

test('GET / should yield 200', () => {
  return/* ! */ request(server)
      .get('/')
      .expect(200);
});

// TODO: Reduce duplication with table
describe('GET on /geodata', () => {
  test(`should yield one geo record given valid params`,
      () => {
        return/* ! */ request(server)
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
  test(`should fail with HTTP 400 given invalid param 'city'`, () => {
    return/* ! */ request(server)
        .get('/geodata?city=')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => {
          expect(res.text)
              .toMatch(/Param &#39;city&#39; must not be empty<br>/);
        });
  });
  test(`should fail with HTTP 400 given invalid param 'country'`, () => {
    return/* ! */ request(server)
        .get('/geodata?city=Berlin&country=DUCK')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => {
          expect(res.text)
              .toMatch(
                  /Param &#39;country&#39; must be a two-letter-code<br>/,
              );
        });
  });
  test(`should fail with HTTP 400 given no query`, () => {
    return/* ! */ request(server)
        .get('/geodata')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => {
          expect(res.text)
              .toMatch(/Param &#39;city&#39; must not be empty<br>/);
        });
  });
});
describe('GET on /weather', () => {
  test(`should yield one geo record given valid params`, () => {
    return/* ! */ request(server)
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
  test(`should fail with HTTP 400 given invalid param 'lat'`, () => {
    return/* ! */ request(server)
        .get('/weather?lat=abc&long=44.3')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => expect(res.text).toMatch(new RegExp(
            'Params &#39;latitude&#39; and &#39;longitude&#39; ' +
              'must both be numbers\<br\>',
        )));
  });
  test(`should fail with HTTP 400 given invalid param 'long'`, () => {
    return/* ! */ request(server)
        .get('/weather?lat=44.3&long=bcd')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => expect(res.text).toMatch(new RegExp(
            'Params &#39;latitude&#39; and &#39;longitude&#39; ' +
                  'must both be numbers\<br\>',
        )));
  });
  test(`should fail with HTTP 400 given no query`, () => {
    return/* ! */ request(server)
        .get('/weather')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => expect(res.text).toMatch(new RegExp(
            'Params &#39;latitude&#39; and &#39;longitude&#39; ' +
                  'must both be numbers\<br\>',
        )));
  });

  /* 500 is hard to provoke */
});
