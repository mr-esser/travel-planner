import {handleSubmit} from '../../../src/client/js/client';

test(`Client module exports only 'handleSubmit' function`, () => {
  expect(handleSubmit).toBeDefined();
});
