/* End of turn: enemies phase, then tension, then back to the player. */
import { activate } from './enemies.js';
import { drawTension } from './tension.js';

export function endTurn(s){
  s.phase='enemies'; activate(s); if (s.over) return;
  s.phase='tension'; drawTension(s); if (s.over) return;
  s.turn+=1; s.ap=s.maxAp; s.phase='player';
}
