import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawTension } from '../src/rules/tension.js';

const base = () => ({
  over: null, log: [],
  player: { hp: 8, maxHp: 10, c: [3,4] },
  bag: [], bagMax: 6, enemies: [], nextId: 1, openedDoors: [],
  deck: [], discard: [], lastCard: undefined,
});

test('drawing from an empty deck loses the game', () => {
  const s = base();
  drawTension(s);
  assert.equal(s.over, 'defeat');
});

test('the drawn card moves from the deck to the discard pile', () => {
  const s = base();
  s.deck = [{ id:'calm', title:'Silence', text:'Rien.' }];
  drawTension(s);
  assert.equal(s.deck.length, 0);
  assert.equal(s.discard.length, 1);
  assert.equal(s.lastCard.id, 'calm');
});

test('« Ils arrivent » spawns a zombie', () => {
  const s = base();
  s.deck = [{ id:'approach', title:'Ils arrivent', text:'…' }];
  drawTension(s);
  assert.equal(s.enemies.length, 1);
  assert.equal(s.enemies[0].type, 'zombie');
  assert.ok(s.log.some(l=>l.m.includes('surgit')), 'the spawn is announced in the log');
});

test('« Reprendre souffle » heals one hp without exceeding the maximum', () => {
  const s = base();
  s.deck = [{ id:'breath', title:'Reprendre souffle', text:'…' }];
  drawTension(s);
  assert.equal(s.player.hp, 9);
  s.deck = [{ id:'breath', title:'Reprendre souffle', text:'…' }];
  s.player.hp = 10;
  drawTension(s);
  assert.equal(s.player.hp, 10);
});

test('« Fouille rapide » grants two rounds of ammo', () => {
  const s = base();
  s.deck = [{ id:'stash', title:'Fouille rapide', text:'…' }];
  drawTension(s);
  assert.deepEqual(s.bag, [{id:'ammo',n:2}]);
});
