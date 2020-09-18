import {WEATHER_API_KEY} from './../../../src/client/js/apiKey';

test('API key should be defined', () => {
  expect(WEATHER_API_KEY).toBeDefined();
});
