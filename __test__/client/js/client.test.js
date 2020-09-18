import * as Client from '../../../src/client/js/client';

test('No API properties should be accessible', () => {
  expect(Object.keys(Client).length).toBe(1);
  expect(Object.keys(Client)[0]).toBe('default');
  expect(Object.values(Client)[0]).toEqual({});
});
