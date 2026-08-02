import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distances, firstStep } from '../src/rules/movement.js';

test('from the start, one move action reaches cells at most 2 steps away', () => {
  const s = { openedDoors: [], bag: [] };
  const d = distances(s, [3,4], false, 2);
  assert.equal(d.get('4,4'), 1);   // hall, one cell east
  assert.equal(d.get('5,4'), 2);   // hall, two cells east
  assert.equal(d.has('6,4'), false); // three cells: out of range
  assert.equal(d.get('4,5'), 2);   // darkroom: crossing the [4,4]→[4,5] door is a normal step
});

test('the BFS does not cross walls between tiles without a door', () => {
  const s = { openedDoors: [], bag: [] };
  const d = distances(s, [3,4], false, 99);
  // Without key nor keycard, the armory stays unreachable
  assert.equal(d.has('11,2'), false);
});

test('firstStep returns the cell-by-cell path to the target', () => {
  const s = { openedDoors: [], bag: [] };
  const path = firstStep(s, [3,4], [5,4], false);
  assert.deepEqual(path, [[4,4],[5,4]]);
});

test('firstStep returns null when no route exists', () => {
  const s = { openedDoors: [], bag: [] };
  // An enemy cannot cross the armory's locked door
  assert.equal(firstStep(s, [3,4], [11,2], true), null);
});
