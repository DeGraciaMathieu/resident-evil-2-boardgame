/* Enemies: activation (chase and strike) and spawning. */
import { SPAWN_POINTS, ENEMIES, INFINITE_DIST } from '../config.js';
import { key, sameCell, cellDistance, canPass } from './board.js';
import { distances, firstStep } from './movement.js';
import { say } from './log.js';

export function activate(s, bonus=0){
  for (const e of s.enemies){
    if (s.over) return;
    let steps = e.speed + bonus;
    while (steps > 0){
      if (cellDistance(e.c, s.player.c)===1 && canPass(s,e.c,s.player.c,true)){
        s.player.hp -= e.damage;
        say(s, `${e.name} vous frappe. −${e.damage} PV.`, 'bad');
        break;
      }
      const path = firstStep(s, e.c, s.player.c, true);
      if (!path || !path.length) break;
      const next = path[0];
      if (sameCell(next, s.player.c) || s.enemies.some(o=>o!==e && sameCell(o.c,next))) break;
      e.c = next; steps--;
    }
    if (s.player.hp<=0){ s.over='defeat'; say(s,'Vous ne vous relevez pas.','bad'); return; }
  }
}

export function spawnPoint(s, minDist){
  const d = distances(s, s.player.c, true);
  const free = SPAWN_POINTS.filter(p => !s.enemies.some(e=>sameCell(e.c,p)));
  const scored = free.map(p => ({ p, d: d.has(key(p)) ? d.get(key(p)) : INFINITE_DIST }))
                     .filter(o => o.d < INFINITE_DIST)
                     .sort((a,b)=>a.d-b.d);
  if (!scored.length) return null;
  return (scored.find(o=>o.d>=minDist) || scored[scored.length-1]).p;
}
export function spawn(s, type, minDist){
  const p = spawnPoint(s, minDist);
  if (!p) return;
  const d = ENEMIES[type];
  s.enemies.push({ id:s.nextId++, type, name:d.name, hp:d.hp, damage:d.damage, speed:d.speed, c:p });
}
