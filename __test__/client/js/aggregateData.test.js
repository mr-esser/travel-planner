import {calculateDurationDays}
  from '../../../src/client/js/aggregateData';

describe(`Function 'calculateDurationDays'`, () => {
  test('should be exported from its module', () => {
    expect(calculateDurationDays).toBeDefined();
  });

  test('should return 1 days if departure and return dates are identical',
      () => {
        const departureDate = new Date('2020-12-10');
        const returnDate = new Date(departureDate);
        expect(calculateDurationDays(departureDate, returnDate)).toBe(1);
      });

  test('should return 2 days if return date is on the next calendar day',
      () => {
        const departureDate = new Date('2020-12-22');
        const returnDate = new Date('2020-12-23');
        expect(calculateDurationDays(departureDate, returnDate)).toBe(2);
      });

  test('should return 3 days if return date is 2 calendar days after departure',
      () => {
        const departureDate = new Date('2020-12-22');
        const returnDate = new Date('2020-12-24');
        expect(calculateDurationDays(departureDate, returnDate)).toBe(3);
      });

  test('should return -2 days if return date is on day before departure',
      () => {
        const departureDate = new Date('2020-12-22');
        const returnDate = new Date('2020-12-21');
        expect(calculateDurationDays(departureDate, returnDate)).toBe(-2);
      });

  test(`should return 'unavailable' if first date is null`,
      () => {
        const departureDate = null;
        const returnDate = new Date();
        expect(calculateDurationDays(departureDate, returnDate))
            .toBe('unavailable');
      });

  test(`should return 'unavailable' if second date is undefined`,
      () => {
        const departureDate = new Date();
        const returnDate = undefined;
        expect(calculateDurationDays(departureDate, returnDate))
            .toBe('unavailable');
      });

  test(`should return only full days`, () => {
    const departureDate = new Date(2011, 1, 1, 1, 2, 33, 444);
    const returnDate = new Date(2011, 1, 4, 4, 3, 22, 111);
    expect(calculateDurationDays(departureDate, returnDate))
        .toBe(4);
  });
});
