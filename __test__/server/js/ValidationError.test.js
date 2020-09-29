import {ValidationError} from './../../../src/server/js/ValidationError';

test(`ValidationError should have properties 'message' and 'code'`, () => {
  const code = 400;
  const message = 'Error message';

  const validationError = new ValidationError(code, message);

  expect(validationError.statusCode).toBe(code);
  expect(validationError.statusMessage).toBe(message);
});