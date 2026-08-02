/* Deck de tension : pioche et résolution de la carte. */
import { DIST_APPARITION, SOIN_SOUFFLE, MUNITIONS_TROUVAILLE, BONUS_GROUILLE } from '../config.js';
import { ajouter } from './sac.js';
import { activer, spawn } from './ennemis.js';
import { dit } from './journal.js';

export function tirerTension(s){
  if (!s.deck.length){ s.fin='defaite'; dit(s,'Le bâtiment est submergé. Plus aucune issue.','mal'); return; }
  const c = s.deck.shift(); s.defausse.push(c); s.derniereCarte=c;
  dit(s, `TENSION — ${c.titre} : ${c.texte}`, 'tension');
  switch(c.id){
    case 'approche': spawn(s,'zombie',DIST_APPARITION.approche); break;
    case 'grogne':   spawn(s,'zombie',DIST_APPARITION.grogne); break;
    case 'meute':    spawn(s,'chien',DIST_APPARITION.meute);  break;
    case 'licker':   spawn(s,'licker',DIST_APPARITION.licker); break;
    case 'souffle':  s.joueur.pv=Math.min(s.joueur.pvMax,s.joueur.pv+SOIN_SOUFFLE); break;
    case 'trouvaille': ajouter(s,'munitions',MUNITIONS_TROUVAILLE); break;
    case 'grouille': activer(s,BONUS_GROUILLE); break;
  }
}
