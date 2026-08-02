/* Ennemis : activation (poursuite et attaque) et apparition. */
import { APPARITIONS, ENNEMIS } from '../config.js';
import { cle, memeCase, distCases, passe } from './plateau.js';
import { distances, premierPas } from './deplacement.js';
import { dit } from './journal.js';

export function activer(s, bonus=0){
  for (const e of s.ennemis){
    if (s.fin) return;
    let pas = e.vitesse + bonus;
    while (pas > 0){
      if (distCases(e.c, s.joueur.c)===1 && passe(s,e.c,s.joueur.c,true)){
        s.joueur.pv -= e.degats;
        dit(s, `${e.nom} vous frappe. −${e.degats} PV.`, 'mal');
        break;
      }
      const chemin = premierPas(s, e.c, s.joueur.c, true);
      if (!chemin || !chemin.length) break;
      const suivant = chemin[0];
      if (memeCase(suivant, s.joueur.c) || s.ennemis.some(o=>o!==e && memeCase(o.c,suivant))) break;
      e.c = suivant; pas--;
    }
    if (s.joueur.pv<=0){ s.fin='defaite'; dit(s,'Vous ne vous relevez pas.','mal'); return; }
  }
}

export function pointApparition(s, distMin){
  const d = distances(s, s.joueur.c, true);
  const libres = APPARITIONS.filter(p => !s.ennemis.some(e=>memeCase(e.c,p)));
  const notes = libres.map(p => ({ p, d: d.has(cle(p)) ? d.get(cle(p)) : 999 }))
                      .filter(o => o.d < 999)
                      .sort((a,b)=>a.d-b.d);
  if (!notes.length) return null;
  return (notes.find(o=>o.d>=distMin) || notes[notes.length-1]).p;
}
export function spawn(s, type, distMin){
  const p = pointApparition(s, distMin);
  if (!p) return;
  const d = ENNEMIS[type];
  s.ennemis.push({ id:s.prochainId++, type, nom:d.nom, pv:d.pv, degats:d.degats, vitesse:d.vitesse, c:p });
}
