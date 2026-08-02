import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, rnd, rndInt, shuffle } from '../src/rules/rng.js';

test('le même seed produit la même séquence de tirages', () => {
  const a = makeRng(42), b = makeRng(42);
  for (let i = 0; i < 20; i++) assert.equal(rnd(a), rnd(b));
});

test('rndInt reste dans [0, n[', () => {
  const rng = makeRng(7);
  for (let i = 0; i < 100; i++){
    const v = rndInt(rng, 6);
    assert.ok(v >= 0 && v < 6 && Number.isInteger(v));
  }
});

test('shuffle est une permutation déterministe qui ne mute pas le deck', () => {
  const deck = ['approche','grogne','meute','calme','licker'];
  const a = shuffle(makeRng(3), deck);
  const b = shuffle(makeRng(3), deck);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort(), [...deck].sort());
  assert.deepEqual(deck, ['approche','grogne','meute','calme','licker']);
});
