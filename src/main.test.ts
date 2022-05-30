import test from 'ava';
import {
  validatePreConditions,
  getContributionFrequency,
  getMultiContribCount,
} from './main.js';

test('validatePreconditions', (t) => {
  const dir = '/Users/non-existent/repo';
  const error = t.throws(() => {
    validatePreConditions(dir, 'packages');
  });
  t.is(
    error?.message,
    `${dir} does not exist`,
    'The repo directory should exist',
  );
});

test('getContributionFrequency', (t) => {
  const contributors: Array<Record<string, number>> = [
    { userA: 1 },
    { userB: 1, userA: 1 },
    { userC: 1, userB: 1 },
  ];
  const contribFreq = getContributionFrequency(contributors);
  t.deepEqual(contribFreq, { userA: 2, userB: 2, userC: 1 });
});

test('getMultiContribCount', (t) => {
  const contribsPerUser = { userA: 2, userB: 2, userC: 1 };
  const multiContribCount = getMultiContribCount(contribsPerUser);
  t.is(multiContribCount, 2);
});
