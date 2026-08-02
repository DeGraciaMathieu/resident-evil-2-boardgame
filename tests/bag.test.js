import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, removeItem, ammoCount } from '../src/rules/bag.js';

test('ammo stacks on the same slot up to the stack size', () => {
  const s = { bag: [{id:'ammo',n:4}], bagMax: 6 };
  assert.equal(addItem(s, 'ammo', 2), true);
  assert.deepEqual(s.bag, [{id:'ammo',n:6}]);
  assert.equal(ammoCount(s), 6);
});

test('a full bag refuses a new item, without losing it silently', () => {
  const s = { bag: [
    {id:'ammo',n:8},{id:'green_herb',n:1},{id:'red_herb',n:1},
    {id:'spade_key',n:1},{id:'keycard',n:1},{id:'shotgun',n:1},
  ], bagMax: 6 };
  assert.equal(addItem(s, 'green_herb'), false);
  assert.equal(s.bag.length, 6);
});

test('removing the last unit frees the slot', () => {
  const s = { bag: [{id:'green_herb',n:1}], bagMax: 6 };
  assert.equal(removeItem(s, 'green_herb'), true);
  assert.deepEqual(s.bag, []);
  assert.equal(removeItem(s, 'green_herb'), false);
});
