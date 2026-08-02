import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/state/game.js';
import { tileAt } from '../src/rules/board.js';

test('the same seed produces exactly the same game', () => {
  const a = createGame(123), b = createGame(123);
  assert.deepEqual(a.tokens, b.tokens);
  assert.deepEqual(a.deck, b.deck);
});

test('the setup honours the scenario invariants', () => {
  const s = createGame(77);
  // The armory always holds the keycard and the shotgun
  const armoryToken = s.tokens.find(t => tileAt(t.c) === 'armory');
  assert.equal(armoryToken.content, 'keycard');
  assert.equal(armoryToken.bonus, 'shotgun');
  // The spade key is hidden outside the armory
  const keyToken = s.tokens.find(t => t.content === 'spade_key');
  assert.ok(keyToken);
  assert.notEqual(tileAt(keyToken.c), 'armory');
  // The licker never shows up among the first 8 cards
  assert.ok(!s.deck.slice(0,8).some(c => c.id === 'licker'));
  assert.equal(s.deck.length, 14);
});

test('Leon starts in the hall with his starting gear', () => {
  const s = createGame(5);
  assert.equal(tileAt(s.player.c), 'hall');
  assert.equal(s.player.hp, 10);
  assert.equal(s.ap, 4);
  assert.deepEqual(s.bag, [{id:'ammo',n:4},{id:'green_herb',n:1}]);
});
