/* Legality: the set of possible actions from the current state. */
import { WEAPONS, MOVE_RANGE, MOVE_COST, DISENGAGE_MOVE_COST, DOOR_COST } from '../config.js';
import { sameCell, cellDistance, canPass, doorAt, doorKey } from './board.js';
import { distances } from './movement.js';
import { lineOfSight } from './sight.js';
import { hasItem, ammoCount } from './bag.js';

export function actions(s){
  if (s.over || s.phase!=='player') return [];
  const out=[];
  const here = s.player.c;

  // Disengaging: leaving an enemy's contact costs one extra action.
  const engaged = s.enemies.some(e => cellDistance(e.c, here)===1 && canPass(s, e.c, here));
  const moveCost = engaged ? DISENGAGE_MOVE_COST : MOVE_COST;
  if (s.ap >= moveCost){
    const d = distances(s, here, MOVE_RANGE);
    for (const [k,dist] of d){
      if (dist===0) continue;
      const c = k.split(',').map(Number);
      if (s.enemies.some(e=>sameCell(e.c,c))) continue; // occupied cell
      out.push({ type:'move', to:c, dist, cost:moveCost, disengage:engaged });
    }
  }

  const weapon = WEAPONS[s.player.weapon];
  if (s.ap >= 1 && (weapon.ammo===0 || ammoCount(s)>=weapon.ammo)){
    for (const e of s.enemies){
      if (cellDistance(here, e.c) > weapon.range) continue;
      if (!lineOfSight(s, here, e.c)) continue;
      out.push({ type:'attack', target:e.id, cost:1 });
    }
  }

  const token = s.tokens.find(t => sameCell(t.c, here) && !t.taken);
  if (token && s.ap>=1) out.push({ type:'search', cost:1 });

  // Toggling the adjacent door; opening a locked one requires its key.
  const door = doorAt(here);
  if (door && s.ap >= DOOR_COST){
    const dk = doorKey(door);
    const open = s.openDoors.includes(dk);
    const locked = door.lock && !s.unlockedDoors.includes(dk);
    if (open || !locked || hasItem(s, door.lock))
      out.push({ type:'door', a:door.a, b:door.b, opens:!open, cost:DOOR_COST });
  }

  if (s.ap>=1 && hasItem(s,'green_herb') && s.player.hp<s.player.maxHp) out.push({ type:'heal', cost:1 });
  if (s.ap>=1 && hasItem(s,'green_herb') && hasItem(s,'red_herb')) out.push({ type:'combine', cost:1 });

  for (const w of ['knife','pistol','shotgun'])
    if (s.player.weapon!==w && (w!=='shotgun' || hasItem(s,'shotgun'))) out.push({ type:'weapon', weapon:w, cost:0 });

  out.push({ type:'end', cost:0 });
  return out;
}
