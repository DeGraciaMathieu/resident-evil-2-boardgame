/* Turn controller: intent → rule → screen update. */
import { play } from '../rules/play.js';
import { refresh } from '../render/hud.js';

export function act(app, a){
  if (!a) return;
  const n = app.S.deck.length;
  play(app.S, a);
  refresh(app, n !== app.S.deck.length);
}
