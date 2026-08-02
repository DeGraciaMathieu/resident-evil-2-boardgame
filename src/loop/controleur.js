/* Contrôleur de tour : intention → règle → mise à jour de l'écran. */
import { jouer } from '../rules/jouer.js';
import { maj } from '../render/hud.js';

export function acte(app, a){
  if (!a) return;
  const n = app.S.deck.length;
  jouer(app.S, a);
  maj(app, n !== app.S.deck.length);
}
