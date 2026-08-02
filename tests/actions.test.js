import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actions } from '../src/rules/actions.js';

const base = () => ({
  ap: 4, phase: 'player', over: null,
  player: { hp: 10, maxHp: 10, c: [3,4], weapon: 'pistol' },
  bag: [{id:'ammo',n:4}], bagMax: 6,
  enemies: [], tokens: [], openDoors: [], unlockedDoors: [],
});

test('outside the player phase or once the game is over, no action is possible', () => {
  assert.deepEqual(actions({ ...base(), phase: 'enemies' }), []);
  assert.deepEqual(actions({ ...base(), over: 'defeat' }), []);
});

test('searching is only offered on a token not yet taken', () => {
  const s = base();
  s.tokens = [{ c:[3,4], type:'A', content:'ammo' }];
  assert.ok(actions(s).some(a => a.type === 'search'));
  s.tokens[0].taken = true;
  assert.ok(!actions(s).some(a => a.type === 'search'));
});

test('disengaging from an enemy in contact costs two actions', () => {
  const s = base();
  s.enemies = [{ id:1, c:[4,4], hp:4 }];
  const move = actions(s).find(a => a.type === 'move');
  assert.equal(move.cost, 2);
  assert.equal(move.disengage, true);
});

test('attacking requires ammo and a visible target within range', () => {
  const s = base();
  s.enemies = [{ id:1, c:[5,4], hp:4 }]; // 2 cells away, in sight, pistol range 5
  assert.ok(actions(s).some(a => a.type === 'attack' && a.target === 1));
  s.bag = []; // empty magazine
  assert.ok(!actions(s).some(a => a.type === 'attack'));
});

test('the door action is offered next to a door, and needs the key while locked', () => {
  const s = base();
  assert.ok(!actions(s).some(a => a.type === 'door')); // no door touches [3,4]
  s.player.c = [4,4]; // door [4,4]|[4,5], no lock
  const a = actions(s).find(x => x.type === 'door');
  assert.equal(a.opens, true);
  assert.equal(a.cost, 1);
  s.player.c = [10,3]; // door [10,3]|[10,4], lock: spade_key
  assert.ok(!actions(s).some(x => x.type === 'door'));
  s.bag.push({id:'spade_key',n:1});
  assert.ok(actions(s).some(x => x.type === 'door'));
});

test('next to an open door, the action becomes closing it', () => {
  const s = base();
  s.player.c = [4,4];
  s.openDoors = ['4,4|4,5'];
  const a = actions(s).find(x => x.type === 'door');
  assert.equal(a.opens, false);
});

test('switching weapons only offers the shotgun when it is in the bag', () => {
  const s = base();
  assert.ok(!actions(s).some(a => a.type === 'weapon' && a.weapon === 'shotgun'));
  s.bag.push({id:'shotgun',n:1});
  assert.ok(actions(s).some(a => a.type === 'weapon' && a.weapon === 'shotgun'));
});
