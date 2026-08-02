/* Légalité : le jeu d'actions possibles depuis l'état courant. */
import { ARMES, PORTEE_DEPLACEMENT, COUT_DEPLACEMENT, COUT_DEPLACEMENT_ENGAGE } from '../config.js';
import { memeCase, distCases, passe } from './plateau.js';
import { distances } from './deplacement.js';
import { vue } from './vue.js';
import { aObjet, nbMunitions } from './sac.js';

export function actions(s){
  if (s.fin || s.phase!=='joueur') return [];
  const out=[];
  const ici = s.joueur.c;

  // Se dégager : quitter le contact d'un ennemi coûte une action de plus.
  const engage = s.ennemis.some(e => distCases(e.c, ici)===1 && passe(s, e.c, ici, true));
  const coutDep = engage ? COUT_DEPLACEMENT_ENGAGE : COUT_DEPLACEMENT;
  if (s.pa >= coutDep){
    const d = distances(s, ici, false, PORTEE_DEPLACEMENT);
    for (const [k,dist] of d){
      if (dist===0) continue;
      const c = k.split(',').map(Number);
      if (s.ennemis.some(e=>memeCase(e.c,c))) continue; // case occupée
      out.push({ type:'deplacer', vers:c, dist, cout:coutDep, degage:engage });
    }
  }

  const arme = ARMES[s.joueur.arme];
  if (s.pa >= 1 && (arme.mun===0 || nbMunitions(s)>=arme.mun)){
    for (const e of s.ennemis){
      if (distCases(ici, e.c) > arme.portee) continue;
      if (!vue(s, ici, e.c)) continue;
      out.push({ type:'attaquer', cible:e.id, cout:1 });
    }
  }

  const jeton = s.jetons.find(j => memeCase(j.c, ici) && !j.pris);
  if (jeton && s.pa>=1) out.push({ type:'fouiller', cout:1 });

  if (s.pa>=1 && aObjet(s,'herbe_v') && s.joueur.pv<s.joueur.pvMax) out.push({ type:'soigner', cout:1 });
  if (s.pa>=1 && aObjet(s,'herbe_v') && aObjet(s,'herbe_r')) out.push({ type:'combiner', cout:1 });

  for (const a of ['couteau','pistolet','pompe'])
    if (s.joueur.arme!==a && (a!=='pompe' || aObjet(s,'pompe'))) out.push({ type:'arme', arme:a, cout:0 });

  out.push({ type:'finir', cout:0 });
  return out;
}
