import { test } from 'node:test';
import assert from 'node:assert/strict';
import { play } from '../src/rules/play.js';
import { makeRng, rndInt } from '../src/rules/rng.js';
import { DICE } from '../src/config.js';

const base = () => ({
  over: null, log: [], turn: 1, ap: 4, maxAp: 4, phase: 'player',
  rng: makeRng(1), lastTile: 'hall',
  player: { hp: 10, maxHp: 10, c: [3,4], weapon: 'pistol' },
  bag: [{id:'ammo',n:4}], bagMax: 6,
  enemies: [], nextId: 1, tokens: [], openDoors: [], unlockedDoors: [],
  deck: [{ id:'calm', title:'Silence', text:'Rien.' }], discard: [],
});
const zombie = (c) => ({ id:1, type:'zombie', name:'Zombie', hp:4, damage:2, speed:2, c });

// First seed whose successive rolls produce the wanted faces, in order.
function seedFor(wants){
  outer: for (let seed=1; seed<100000; seed++){
    const r = makeRng(seed);
    for (const w of wants)
      if (DICE[w.color][rndInt(r, DICE[w.color].length)] !== w.face) continue outer;
    return seed;
  }
  throw new Error('no seed rolls '+JSON.stringify(wants));
}

test('pistol 1-hit face pushes the enemy one cell away and deals no damage', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'blue',face:1}]));
  s.enemies = [zombie([5,4])];
  play(s, { type:'attack', target:1, cost:1 });
  assert.equal(s.enemies[0].hp, 4);
  assert.deepEqual(s.enemies[0].c, [6,4]);
});

test('pistol 2-hit face deals 1 damage and does not push', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'blue',face:2}]));
  s.enemies = [zombie([5,4])];
  play(s, { type:'attack', target:1, cost:1 });
  assert.equal(s.enemies[0].hp, 3);
  assert.deepEqual(s.enemies[0].c, [5,4]);
});

test('pistol 0-hit face has no effect', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'blue',face:0}]));
  s.enemies = [zombie([5,4])];
  play(s, { type:'attack', target:1, cost:1 });
  assert.equal(s.enemies[0].hp, 4);
  assert.deepEqual(s.enemies[0].c, [5,4]);
});

test('a push against a wall is lost: the enemy stays in place', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'blue',face:1}]));
  // [7,4] is the hall's east dead end: every cell further from Leon is walled off
  s.enemies = [zombie([7,4])];
  play(s, { type:'attack', target:1, cost:1 });
  assert.deepEqual(s.enemies[0].c, [7,4]);
});

test('a push into an occupied cell is lost', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'blue',face:1}]));
  s.enemies = [zombie([5,4]), { ...zombie([6,4]), id:2 }];
  play(s, { type:'attack', target:1, cost:1 });
  assert.deepEqual(s.enemies[0].c, [5,4]);
});

test('knife rolls one red die: a 2-hit face deals 2 damage', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'red',face:2}]));
  s.player.weapon = 'knife';
  s.enemies = [zombie([4,4])];
  play(s, { type:'attack', target:1, cost:1 });
  assert.equal(s.lastRolls[0].dice[0].color, 'red');
  assert.equal(s.enemies[0].hp, 2);
  // dmg travels with the roll: the board stages a floating damage fx from it
  assert.equal(s.lastRolls[0].dmg, 2);
  assert.equal(s.bag[0].n, 4); // the knife costs no ammo
});

test('shotgun rolls blue+red: two 2-hit faces deal 4 damage and kill the zombie', () => {
  const s = base();
  s.rng = makeRng(seedFor([{color:'blue',face:2},{color:'red',face:2}]));
  s.player.weapon = 'shotgun';
  s.enemies = [zombie([4,4])];
  play(s, { type:'attack', target:1, cost:1 });
  assert.deepEqual(s.lastRolls[0].dice.map(d=>d.color), ['blue','red']);
  assert.equal(s.enemies.length, 0);
  assert.ok(s.log.some(l=>l.m.includes("s'effondre")));
});

test('shotgun hits every enemy in range, one roll per target', () => {
  const s = base();
  s.player.weapon = 'shotgun';
  s.enemies = [zombie([4,4]), { ...zombie([5,4]), id:2 }];
  play(s, { type:'attack', target:1, cost:1 });
  assert.equal(s.lastRolls.length, 2);
  assert.equal(s.lastRolls[0].dice.length, 2);
});
