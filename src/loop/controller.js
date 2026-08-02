/* Turn controller: intent → rule → screen update.
   When the player's AP run out, the end of turn is replayed step by step
   (one refresh per visible change) instead of resolving all at once; each
   step is staged as a visual effect (banner, tween, pop, floating damage). */
import { STEP_DELAYS, SHAKE_INITIAL } from '../config.js';
import { play } from '../rules/play.js';
import { turnOver, endTurnSteps } from '../rules/turn.js';
import { refresh, banner } from '../render/hud.js';
import { addFx } from '../render/canvas.js';

export function act(app, a){
  if (!a || app.S.phase!=='player') return;
  const n = app.S.deck.length;
  play(app.S, a);
  if (a.type==='attack')
    for (const r of app.S.lastRolls) addFx(app, { kind:'dice', dice:r.dice, c:r.c });
  refresh(app, n !== app.S.deck.length);
  if (turnOver(app.S)) playback(app, endTurnSteps(app.S));
}

function playback(app, steps){
  const S = app.S;
  const n = S.deck.length;
  const { value, done } = steps.next();
  if (!done) stage(app, value);
  app.focus = done ? null : value.id ?? null;
  refresh(app, n !== S.deck.length);
  if (done) return;
  // Ignore the pending step if a new game replaced the state meanwhile.
  setTimeout(()=>{ if (app.S===S) playback(app, steps); }, STEP_DELAYS[value.kind]);
}

function stage(app, step){
  const S = app.S;
  switch(step.kind){
    case 'phase':
      banner(S.phase==='enemies' ? 'Les ennemis agissent' : 'Tension', S.phase==='enemies'?'enemy':'tension');
      break;
    case 'turn':
      banner(`Tour ${S.turn} — À vous`, 'player');
      break;
    case 'move':
      addFx(app, { kind:'tween', id:step.id, from:step.from, to:step.to });
      break;
    case 'strike':
      addFx(app, { kind:'hit', dmg:step.dmg, c:S.player.c });
      app.shake = SHAKE_INITIAL;
      break;
    case 'spawn': {
      const e = S.enemies.find(x=>x.id===step.id);
      if (e) addFx(app, { kind:'spawn', id:e.id });
      break;
    }
  }
}
