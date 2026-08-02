/* Fin de tour : phase ennemis, puis tension, puis retour au joueur. */
import { activer } from './ennemis.js';
import { tirerTension } from './tension.js';

export function finDeTour(s){
  s.phase='ennemis'; activer(s); if (s.fin) return;
  s.phase='tension'; tirerTension(s); if (s.fin) return;
  s.tour+=1; s.pa=s.paMax; s.phase='joueur';
}
