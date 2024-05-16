import { expect, test } from '@jest/globals';

import { get } from './get';

test('get - correct case', () => {
  expect(get(1, [])).toEqual(1);
  expect(get({ a: 1 }, ['a'])).toEqual(1);
  expect(get({ a: 1, b: { c: 2 } }, ['b'])).toEqual({ c: 2 });
  expect(get({ a: [{ b: { c: 2 } }, 1] }, ['a', 0, 'b'])).toEqual({ c: 2 });
});

test('get - wrong case', () => {
  expect(get(1, ['a'])).toEqual(undefined);
  expect(get({ a: 1 }, ['b'])).toEqual(undefined);
  expect(get({ a: 1, b: { c: 2 } }, ['a', 'c'])).toEqual(undefined);
  expect(get({ a: [{ b: { c: 2 } }, 1] }, ['b', 2, 1])).toEqual(undefined);
});
