/* Tension deck: drawing and resolving the card. */
import { SPAWN_DIST, BREATH_HEAL, STASH_AMMO, SWARM_BONUS } from '../config.js';
import { addItem } from './bag.js';
import { activate, spawn } from './enemies.js';
import { say } from './log.js';

export function drawTension(s){
  if (!s.deck.length){ s.over='defeat'; say(s,'Le bâtiment est submergé. Plus aucune issue.','bad'); return; }
  const c = s.deck.shift(); s.discard.push(c); s.lastCard=c;
  say(s, `TENSION — ${c.title} : ${c.text}`, 'tension');
  switch(c.id){
    case 'approach': spawn(s,'zombie',SPAWN_DIST.approach); break;
    case 'growl':    spawn(s,'zombie',SPAWN_DIST.growl); break;
    case 'pack':     spawn(s,'dog',SPAWN_DIST.pack);  break;
    case 'licker':   spawn(s,'licker',SPAWN_DIST.licker); break;
    case 'breath':   s.player.hp=Math.min(s.player.maxHp,s.player.hp+BREATH_HEAL); break;
    case 'stash':    addItem(s,'ammo',STASH_AMMO); break;
    case 'swarm':    activate(s,SWARM_BONUS); break;
  }
}
