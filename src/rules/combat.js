/* Dice combat: rolling a weapon profile and resolving its face effects. */
import { DICE } from '../config.js';
import { rndInt } from './rng.js';
import { cellDistance, canPass, sameCell, neighbors } from './board.js';

function rollProfile(s, weapon){
  const dice = [];
  for (const color of ['blue','red'])
    for (let i=0; i<(weapon.dice[color]||0); i++)
      dice.push({ color, face: DICE[color][rndInt(s.rng, DICE[color].length)] });
  return dice;
}

// One orthogonal cell strictly further from the player; null when blocked
// (wall, closed door, occupied cell) — the push is then lost.
function pushCell(s, target){
  const dist = cellDistance(s.player.c, target.c);
  const away = neighbors(target.c)
    .filter(c => cellDistance(s.player.c, c) > dist)
    .filter(c => canPass(s, target.c, c))
    .filter(c => !sameCell(c, s.player.c) && !s.enemies.some(e => e !== target && sameCell(e.c, c)));
  return away.sort((a,b) => cellDistance(s.player.c,b) - cellDistance(s.player.c,a))[0] || null;
}

export function resolveAttack(s, weapon, target){
  const dice = rollProfile(s, weapon);
  let damage = 0, pushed = null;
  for (const d of dice){
    const fx = weapon.effects[d.face];
    if (!fx) continue;
    if (fx.kind === 'damage') damage += fx.amount;
    if (fx.kind === 'push' && !pushed){
      const to = pushCell(s, target);
      if (to){ target.c = to; pushed = to; }
    }
  }
  target.hp -= damage;
  return { dice, damage, pushed };
}
