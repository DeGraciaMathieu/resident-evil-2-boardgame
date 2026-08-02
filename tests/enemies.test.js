import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activate, spawnPoint, spawn } from '../src/rules/enemies.js';
import { distances } from '../src/rules/movement.js';
import { key } from '../src/rules/board.js';
import { DOORS } from '../src/config.js';

const allOpen = DOORS.map(d => key(d.a)+'|'+key(d.b));
const base = () => ({
  over: null, log: [],
  player: { hp: 10, maxHp: 10, c: [3,4] },
  bag: [], enemies: [], nextId: 1, openDoors: [],
});

test('an enemy in contact strikes instead of moving', () => {
  const s = base();
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[4,4] }];
  activate(s);
  assert.equal(s.player.hp, 8);
  assert.deepEqual(s.enemies[0].c, [4,4]);
});

test('a distant enemy advances by its speed toward the player', () => {
  const s = base();
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[7,4] }];
  activate(s);
  assert.deepEqual(s.enemies[0].c, [5,4]); // two steps west along the hall
  assert.equal(s.player.hp, 10);
});

test('enemies do not cross closed doors', () => {
  const s = base();
  // West office: both of its doors are closed, no path to the hall
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[4,2] }];
  activate(s);
  assert.deepEqual(s.enemies[0].c, [4,2]);
  assert.equal(s.player.hp, 10);
});

test('the player dies when hp reaches zero: defeat', () => {
  const s = base();
  s.player.hp = 2;
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[4,4] }];
  activate(s);
  assert.equal(s.over, 'defeat');
});

test('a far spawn happens at minDist or more from the player', () => {
  const s = base();
  s.openDoors = [...allOpen]; // every spawn point reachable
  const p = spawnPoint(s, 6);
  assert.ok(p, 'a point must exist');
  const d = distances(s, s.player.c);
  assert.ok(d.get(key(p)) >= 6);
});

test('spawns only use points the enemies could reach: closed doors exclude them', () => {
  const s = base();
  const p = spawnPoint(s, 6);
  const d = distances(s, s.player.c);
  assert.ok(d.has(key(p))); // falls back to a reachable hall point
});

test('when no point reaches minDist, the farthest one is chosen', () => {
  const s = base();
  const p = spawnPoint(s, 999);
  assert.ok(p, 'a point is still returned as a fallback');
});

test('spawn places an enemy with the right profile on a free point', () => {
  const s = base();
  spawn(s, 'dog', 4);
  assert.equal(s.enemies.length, 1);
  const e = s.enemies[0];
  assert.equal(e.name, 'Chien');
  assert.equal(e.hp, 3);
  assert.equal(e.speed, 4);
  assert.equal(s.nextId, 2);
});
