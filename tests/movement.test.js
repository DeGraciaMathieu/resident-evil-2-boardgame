import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distances, firstStep } from '../src/rules/movement.js';

test('from the start, one move action reaches cells at most 2 steps away', () => {
  const s = { openDoors: [] };
  const d = distances(s, [3,4], 2);
  assert.equal(d.get('4,4'), 1);     // hall, one cell east
  assert.equal(d.get('5,4'), 2);     // hall, two cells east
  assert.equal(d.has('6,4'), false); // three cells: out of range
  assert.equal(d.has('4,5'), false); // darkroom: its door is closed by default
});

test('an open door is crossed as a normal step', () => {
  const s = { openDoors: ['4,4|4,5'] };
  const d = distances(s, [3,4], 2);
  assert.equal(d.get('4,5'), 2);
});

test('the BFS does not cross walls between tiles without a door', () => {
  const s = { openDoors: [] };
  const d = distances(s, [3,4], 99);
  assert.equal(d.has('11,2'), false); // the armory stays unreachable
});

test('firstStep returns the cell-by-cell path to the target', () => {
  const s = { openDoors: [] };
  const path = firstStep(s, [3,4], [5,4]);
  assert.deepEqual(path, [[4,4],[5,4]]);
});

test('firstStep returns null when no route exists', () => {
  const s = { openDoors: [] };
  assert.equal(firstStep(s, [3,4], [11,2]), null);
});
