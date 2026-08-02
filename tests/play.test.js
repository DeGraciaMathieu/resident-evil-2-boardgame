import { test } from 'node:test';
import assert from 'node:assert/strict';
import { play } from '../src/rules/play.js';
import { turnOver, endTurn } from '../src/rules/turn.js';
import { makeRng } from '../src/rules/rng.js';

const base = () => ({
  over: null, log: [], turn: 1, ap: 4, maxAp: 4, phase: 'player',
  rng: makeRng(1), lastTile: 'hall',
  player: { hp: 10, maxHp: 10, c: [3,4], weapon: 'pistol' },
  bag: [{id:'ammo',n:4}], bagMax: 6,
  enemies: [], nextId: 1, tokens: [], openedDoors: [],
  deck: [{ id:'calm', title:'Silence', text:'Rien.' }], discard: [],
});

test('moving follows the path and debits the AP cost', () => {
  const s = base();
  play(s, { type:'move', to:[5,4], cost:1 });
  assert.deepEqual(s.player.c, [5,4]);
  assert.equal(s.ap, 3);
});

test('crossing a locked door with the key unlocks it durably', () => {
  const s = base();
  s.bag.push({id:'spade_key',n:1});
  s.player.c = [10,3];
  play(s, { type:'move', to:[10,4], cost:1 });
  assert.ok(s.openedDoors.includes('10,3|10,4'));
});

test('reaching the parking exit wins the game', () => {
  const s = base();
  s.player.c = [13,8];
  s.openedDoors = ['13,8|13,9'];
  play(s, { type:'move', to:[13,9], cost:1 });
  assert.equal(s.over, 'victory');
});

test('attacking spends one round and deals the seeded dice', () => {
  const s = base();
  s.enemies = [{ id:1, type:'zombie', name:'Zombie', hp:4, damage:2, speed:2, c:[5,4] }];
  play(s, { type:'attack', target:1, cost:1 });
  assert.equal(s.bag[0].n, 3);
  const replay = base();
  replay.enemies = [{ id:1, type:'zombie', name:'Zombie', hp:4, damage:2, speed:2, c:[5,4] }];
  play(replay, { type:'attack', target:1, cost:1 });
  // same seed → same dice → same damage
  assert.deepEqual(s.enemies.map(e=>e.hp), replay.enemies.map(e=>e.hp));
});

test('searching picks up the token content, once only', () => {
  const s = base();
  s.tokens = [{ c:[3,4], type:'A', content:'green_herb' }];
  play(s, { type:'search', cost:1 });
  assert.ok(s.bag.some(i=>i.id==='green_herb'));
  assert.equal(s.tokens[0].taken, true);
});

test('running out of AP hands the turn over, then the end of turn brings it back', () => {
  const s = base();
  s.ap = 1;
  play(s, { type:'move', to:[4,4], cost:1 });
  assert.equal(turnOver(s), true);   // the caller now drives the end of turn
  endTurn(s);
  assert.equal(s.turn, 2);
  assert.equal(s.ap, s.maxAp);
  assert.equal(s.phase, 'player');
});
