import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canPass, tileAt } from '../src/rules/board.js';

test('movement is free between two cells of the same tile', () => {
  const s = { openedDoors: [], bag: [] };
  // [3,4] and [4,4] both belong to the main hall
  assert.equal(canPass(s, [3,4], [4,4]), true);
});

test('a wall between two tiles without a door blocks passage', () => {
  const s = { openedDoors: [], bag: [] };
  // [5,4] (hall) touches [5,5] (darkroom) but no door links them
  assert.notEqual(tileAt([5,4]), tileAt([5,5]));
  assert.equal(canPass(s, [5,4], [5,5]), false);
});

test('a locked door opens with the key, never for an enemy', () => {
  const door = [[10,3],[10,4]]; // lock: spade_key
  const without = { openedDoors: [], bag: [] };
  const withKey = { openedDoors: [], bag: [{id:'spade_key',n:1}] };
  assert.equal(canPass(without, ...door), false);
  assert.equal(canPass(withKey, ...door), true);
  assert.equal(canPass(withKey, ...door, true), false); // the enemy has no key
});

test('an unlocked door stays open for everyone', () => {
  const s = { openedDoors: ['10,3|10,4'], bag: [] };
  assert.equal(canPass(s, [10,3], [10,4], true), true);
});
