import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lineOfSight } from '../src/rules/sight.js';

test('line of sight carries along a single tile', () => {
  const s = { openDoors: [] };
  // The north corridor is a straight 5-cell strip
  assert.equal(lineOfSight(s, [7,0], [11,0]), true);
});

test('a wall without a door cuts the line of sight', () => {
  const s = { openDoors: [] };
  // [5,4] (hall) and [5,5] (darkroom) touch without a door
  assert.equal(lineOfSight(s, [5,4], [5,5]), false);
});

test('a closed door cuts the line of sight, an open one restores it', () => {
  const closed = { openDoors: [] };
  const open = { openDoors: ['10,3|10,4'] };
  assert.equal(lineOfSight(closed, [10,3], [10,4]), false);
  assert.equal(lineOfSight(open, [10,3], [10,4]), true);
});
