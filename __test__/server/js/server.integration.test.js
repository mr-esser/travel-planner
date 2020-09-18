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
