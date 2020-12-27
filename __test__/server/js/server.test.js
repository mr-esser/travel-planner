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
