/* Tension deck: drawing and resolving the card.
   drawTensionSteps yields after each visible change (the card, then its
   effect) so the caller can replay it step by step; drawTension drains it. */
import { SPAWN_DIST, BREATH_HEAL, STASH_AMMO, SWARM_BONUS } from '../config.js';
import { addItem } from './bag.js';
import { activateSteps, spawn } from './enemies.js';
import { say } from './log.js';

function spawnStep(s, type, minDist){
  const before = s.enemies.length;
  spawn(s, type, minDist);
  return { kind:'spawn', id: s.enemies.length>before ? s.enemies[s.enemies.length-1].id : null };
}

export function* drawTensionSteps(s){
  if (!s.deck.length){ s.over='defeat'; say(s,'Le bâtiment est submergé. Plus aucune issue.','bad'); return; }
  const c = s.deck.shift(); s.discard.push(c); s.lastCard=c;
  say(s, `TENSION — ${c.title} : ${c.text}`, 'tension');
  yield { kind:'card' };
  switch(c.id){
    case 'approach': yield spawnStep(s,'zombie',SPAWN_DIST.approach); break;
    case 'growl':    yield spawnStep(s,'zombie',SPAWN_DIST.growl); break;
    case 'pack':     yield spawnStep(s,'dog',SPAWN_DIST.pack); break;
    case 'licker':   yield spawnStep(s,'licker',SPAWN_DIST.licker); break;
    case 'breath':   s.player.hp=Math.min(s.player.maxHp,s.player.hp+BREATH_HEAL); break;
    case 'stash':    addItem(s,'ammo',STASH_AMMO); break;
    case 'swarm':    yield* activateSteps(s,SWARM_BONUS); break;
  }
}

export function drawTension(s){ for (const _ of drawTensionSteps(s)); }
