import { test } from 'node:test';
import assert from 'node:assert/strict';
import { endTurn, endTurnSteps } from '../src/rules/turn.js';

const base = () => ({
  over: null, log: [], turn: 1, ap: 0, maxAp: 4, phase: 'player',
  player: { hp: 10, maxHp: 10, c: [3,4] },
  bag: [], bagMax: 6, enemies: [], nextId: 1, openedDoors: [],
  deck: [{ id:'calm', title:'Silence', text:'Rien.' }], discard: [],
});

test('the end of turn activates the enemies, draws a card and hands back to the player', () => {
  const s = base();
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[4,4] }];
  endTurn(s);
  assert.equal(s.player.hp, 8);        // the zombie in contact struck
  assert.equal(s.discard.length, 1);   // a tension card was drawn
  assert.equal(s.turn, 2);
  assert.equal(s.ap, 4);
  assert.equal(s.phase, 'player');
});

test('the end of turn replays one visible change at a time: each enemy step, then the card', () => {
  const s = base();
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[6,4] }];
  const kinds = [], cells = [];
  for (const step of endTurnSteps(s)){
    kinds.push(step.kind);
    if (step.kind==='move') cells.push([...s.enemies[0].c]);
  }
  assert.deepEqual(kinds, ['phase','move','move','phase','card']);
  assert.deepEqual(cells, [[5,4],[4,4]]); // one cell per step, visible each time
  assert.equal(s.phase, 'player');
  assert.equal(s.turn, 2);
});

test('a defeat during the enemies phase interrupts the turn', () => {
  const s = base();
  s.player.hp = 2;
  s.enemies = [{ id:1, name:'Zombie', hp:4, damage:2, speed:2, c:[4,4] }];
  endTurn(s);
  assert.equal(s.over, 'defeat');
  assert.equal(s.discard.length, 0);   // no card drawn after death
  assert.equal(s.turn, 1);
});
