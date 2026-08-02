/* End of turn: enemies phase, then tension, then back to the player.
   endTurnSteps yields after each visible change so the caller can replay
   the resolution step by step; endTurn drains it in one go. */
import { activateSteps } from './enemies.js';
import { drawTensionSteps } from './tension.js';

export const turnOver = s => s.phase==='player' && s.ap<=0 && !s.over;

export function* endTurnSteps(s){
  s.phase='enemies';
  yield { kind:'phase' };
  yield* activateSteps(s);
  if (s.over) return;
  s.phase='tension';
  yield { kind:'phase' };
  yield* drawTensionSteps(s);
  if (s.over) return;
  s.turn+=1; s.ap=s.maxAp; s.phase='player';
  yield { kind:'turn' };
}

export function endTurn(s){ for (const _ of endTurnSteps(s)); }
