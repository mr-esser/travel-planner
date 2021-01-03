import * as Client from '../../../src/client/js/client';

test(`Client module exports only 'handleSubmit' function`, () => {
  expect(Object.keys(Client).length).toBe(1);
  expect(Object.keys(Client)[0]).toBe('handleSubmit');
  expect(Object.values(Client)[0]).toBeInstanceOf(Function);
});
