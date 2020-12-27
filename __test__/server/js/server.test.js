/* Server API test cases.

   Thanks to Robert Gao for his blog post on setting up the tests.
   See https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/.

   Note(!): Tests will NOT call external web APIs
            and will NOT consume any API credits.
            Must call return to have tests exit cleanly!
            Keep an eye on issue https://github.com/visionmedia/supertest/issues/437.
            dealing with problems when shutting down the server after the tests.
*/

const request = require('supertest');
const http = require('http');
const {app, resetTripData} =
 require('./../../../src/server/js/server');

test('GET / should yield 200', () => {
  resetTripData();
  return/* ! */ request(app)
      .get('/')
      .expect(200);
});

describe('GET on /geodata should fail with 400', () => {
  test.each([
    [
      `invalid param 'city'`,
      '/geodata?city',
      /Param &#39;city&#39; must not be empty<br>/,
    ],
    [
      `invalid param 'country'`,
      '/geodata?city=Berlin&country=DUCK',
      /Param &#39;country&#39; must be a two-letter-code<br>/,
    ],
    [
      'no query',
      '/geodata',
      /Param &#39;city&#39; must not be empty<br>/,
    ],
  ])(`when called with '%s'`,
      (label, query, errorMessage) => {
        return/* ! */ request(app)
            .get(query)
            .expect(400)
            .expect('Content-Type', /text\/html/)
            .then((res) => {
              expect(res.text)
                  .toMatch(errorMessage);
            });
      });
});

describe('GET on /weather should fail with 400', () => {
  test.each([
    [
      `invalid param 'lat'`,
      '/weather?lat=abc&long=44.3',
      'Params &#39;latitude&#39; and &#39;longitude&#39; ' +
        'must both be numbers\<br\>',
    ],
    [
      `invalid param 'long'`,
      '/weather?lat=44.3&long=bcd',
      'Params &#39;latitude&#39; and &#39;longitude&#39; ' +
        'must both be numbers\<br\>',
    ],
    [
      'no query',
      '/weather',
      'Params &#39;latitude&#39; and &#39;longitude&#39; ' +
        'must both be numbers\<br\>',
    ],
  ])(`when called with '%s'`,
      (label, query, errorMessage) => {
        return/* ! */ request(app)
            .get(query)
            .expect(400)
            .expect('Content-Type', /text\/html/)
            .then((res) => {
              expect(res.text)
                  .toMatch(new RegExp(errorMessage));
            });
      });
});

describe('GET on /imagedata should fail with 400', () => {
  test.each([
    [
      `invalid param 'loc'`,
      '/imagedata?loc=',
      'Param &#39;location&#39; must not be empty',
    ],
    [
      'no query',
      '/imagedata',
      'Param &#39;location&#39; must not be empty',
    ],
  ])(`when called with '%s'`,
      (label, query, errorMessage) => {
        return/* ! */ request(app)
            .get(query)
            .expect(400)
            .expect('Content-Type', /text\/html/)
            .then((res) => {
              expect(res.text)
                  .toMatch(new RegExp(errorMessage));
            });
      });
  /* 500 is hard to provoke */
});

describe('Synchronize aggregated trip data with express server', () => {
  test('Given no trips GET /trips should yield empty array', () => {
    resetTripData();
    return/* ! */ request(app)
        .get('/trips')
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual([]);
        });
  });

  test('POST /trips should yield 400 when request body is empty', () => {
    resetTripData();
    return/* ! */ request(app)
        .post('/trips')
        .expect(400)
        .expect('Content-Type', /text\/html/)
        .then((res) => {
          expect(res.text)
              .toMatch('No trip data provided!');
        });
  });

  test('POST /trips should yield new entry given valid trip data'
      , async () => {
        resetTripData();
        const server = http.createServer(app).listen(8080);
        try {
          await request(server).post('/trips')
              .set('Content-Type', 'application/json')
              .send({data: 'test'})
              .expect(201)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .expect('Location', 'http://127.0.0.1:8080/trips/0')
              .then((res) => {
                expect(res.body).toEqual({id: '0', data: 'test'});
              });
        } finally {
          server.close();
        }
      });

  test('POST /trips should sucessfully store data for multiple trips',
      async () => {
        resetTripData();
        const server = http.createServer(app).listen(8081);
        try {
          await request(server).post('/trips')
              .set('Content-Type', 'application/json')
              .send({data: 'test0'})
              .expect(201);
          await request(server).post('/trips')
              .set('Content-Type', 'application/json')
              .send({data: 'test1'})
              .expect(201);
          await request(server).post('/trips')
              .set('Content-Type', 'application/json')
              .send({data: 'test2'})
              .expect(201)
              .then((res) =>
                expect(res.body).toEqual({id: '2', data: 'test2'}),
              );
          return await request(server).get('/trips')
              .set('Accept', 'application/json')
              .expect(200)
              .then((res) => {
                expect(res.body).toEqual([
                  {id: '0', data: 'test0'},
                  {id: '1', data: 'test1'},
                  {id: '2', data: 'test2'},
                ]);
              });
        } finally {
          server.close();
        }
      });

  test('GET /trips/:tripId should return existing trip data',
      async () => {
        resetTripData();
        const server = http.createServer(app).listen(8082);
        try {
          await request(server).post('/trips')
              .set('Content-Type', 'application/json')
              .send({data: 'test0'})
              .expect(201);
          await request(server).post('/trips')
              .set('Content-Type', 'application/json')
              .send({data: 'test1'})
              .expect(201);
          await request(server)
              .get('/trips/0')
              .expect(200)
              .then( (res) => {
                expect(res.body).toEqual( {id: '0', data: 'test0'});
              });
          return await request(server)
              .get('/trips/1')
              .expect(200)
              .then( (res) => {
                expect(res.body).toEqual( {id: '1', data: 'test1'});
              });
        } finally {
          server.close();
        }
      });
});
