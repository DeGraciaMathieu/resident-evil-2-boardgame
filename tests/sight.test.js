import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lineOfSight } from '../src/rules/sight.js';

test('line of sight carries along a single tile', () => {
  const s = { openedDoors: [], bag: [] };
  // The north corridor is a straight 5-cell strip
  assert.equal(lineOfSight(s, [7,0], [11,0]), true);
});

test('a wall without a door cuts the line of sight', () => {
  const s = { openedDoors: [], bag: [] };
  // [5,4] (hall) and [5,5] (darkroom) touch without a door
  assert.equal(lineOfSight(s, [5,4], [5,5]), false);
});

test('a locked door cuts the line of sight without the key', () => {
  const without = { openedDoors: [], bag: [] };
  const withKey = { openedDoors: [], bag: [{id:'spade_key',n:1}] };
  assert.equal(lineOfSight(without, [10,3], [10,4]), false);
  assert.equal(lineOfSight(withKey, [10,3], [10,4]), true);
});
