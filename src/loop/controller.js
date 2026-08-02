/* Turn controller: intent → rule → screen update.
   When the player's AP run out, the end of turn is replayed step by step
   (one refresh per visible change) instead of resolving all at once. */
import { STEP_DELAYS } from '../config.js';
import { play } from '../rules/play.js';
import { turnOver, endTurnSteps } from '../rules/turn.js';
import { refresh } from '../render/hud.js';

export function act(app, a){
  if (!a || app.S.phase!=='player') return;
  const n = app.S.deck.length;
  play(app.S, a);
  refresh(app, n !== app.S.deck.length);
  if (turnOver(app.S)) playback(app, endTurnSteps(app.S));
}

function playback(app, steps){
  const S = app.S;
  const n = S.deck.length;
  const { value, done } = steps.next();
  app.focus = done ? null : value.id ?? null;
  refresh(app, n !== S.deck.length);
  if (done) return;
  // Ignore the pending step if a new game replaced the state meanwhile.
  setTimeout(()=>{ if (app.S===S) playback(app, steps); }, STEP_DELAYS[value.kind]);
}
