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

describe('GET on /geodata', () => {
  test(`should yield one geo record given valid params given`,
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
  test(`should fail with HTTP 400 given invalid param 'city'`,
      () => {
        return/* ! */ request(server)
            .get('/geodata?city=')
            .expect(400)
            .expect('Content-Type', /text\/html/)
            .then((res) => {
              expect(res.text)
                  .toMatch(/Param &#39;city&#39; must not be empty<br>/);
            });
      });
  test(`should fail with HTTP 400 given invalid param 'country'`,
      () => {
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
  test(`should fail with HTTP 400 given no query`,
      () => {
        return/* ! */ request(server)
            .get('/geodata')
            .expect(400)
            .expect('Content-Type', /text\/html/)
            .then((res) => {
              expect(res.text)
                  .toMatch(/Param &#39;city&#39; must not be empty<br>/);
            });
      });

  /* 500 is hard to provoke */
});
