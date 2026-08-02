/* Application d'une action légale sur l'état. */
import { ITEMS, ARMES, DE, MUNITIONS_PAR_JETON, SOIN_HERBE_VERTE } from '../config.js';
import { rndInt } from './rng.js';
import { PORTE_INDEX, cle, tuileDe, tuile, memeCase, distCases } from './plateau.js';
import { premierPas } from './deplacement.js';
import { vue } from './vue.js';
import { ajouter, retirer } from './sac.js';
import { dit } from './journal.js';
import { finDeTour } from './tour.js';

export function jouer(s, action){
  if (s.fin) return s;
  s.pa -= action.cout||0;

  switch(action.type){
    case 'deplacer': {
      const chemin = premierPas(s, s.joueur.c, action.vers, false) || [];
      for (const pas of chemin){
        const p = PORTE_INDEX.get(`${s.joueur.c}|${pas}`);
        if (p && p.verrou && !s.portesOuvertes.includes(cle(p.a)+'|'+cle(p.b))){
          s.portesOuvertes.push(cle(p.a)+'|'+cle(p.b));
          dit(s, `La ${ITEMS[p.verrou].nom.toLowerCase()} tourne dans la serrure.`, 'bien');
        }
        s.joueur.c = pas;
      }
      const t = tuileDe(s.joueur.c);
      if (t !== s.derniereTuile){ dit(s, `→ ${tuile(t).nom}`); s.derniereTuile = t; }
      if (t === 'parking'){ s.fin='victoire'; dit(s,'Vous poussez la porte. Air froid, sirènes au loin.','bien'); }
      break;
    }
    case 'attaquer': {
      const arme = ARMES[s.joueur.arme];
      if (arme.mun) retirer(s,'munitions',arme.mun);
      const cibles = arme.zone
        ? s.ennemis.filter(e => distCases(s.joueur.c,e.c)<=arme.portee && vue(s,s.joueur.c,e.c))
        : [s.ennemis.find(e=>e.id===action.cible)].filter(Boolean);
      for (const cible of cibles){
        const des = Array.from({length:arme.des}, ()=>DE[rndInt(s.rng,6)]);
        const total = des.reduce((a,b)=>a+b,0);
        cible.pv -= total;
        dit(s, `${arme.nom} → ${cible.nom} · dés [${des.join(' ')}] = ${total}`, total?'bien':'mal');
        if (cible.pv<=0){ s.ennemis=s.ennemis.filter(e=>e.id!==cible.id); dit(s,`${cible.nom} s'effondre.`,'bien'); }
      }
      break;
    }
    case 'fouiller': {
      const j = s.jetons.find(x=>memeCase(x.c,s.joueur.c) && !x.pris);
      j.pris = true;
      if (j.bonus){ ajouter(s,j.bonus); dit(s,`Trouvé : ${ITEMS[j.bonus].nom}.`,'bien'); }
      if (j.contenu==='rien') dit(s,'Des tiroirs vides.','mal');
      else if (!ajouter(s, j.contenu, j.contenu==='munitions'?MUNITIONS_PAR_JETON:1)) dit(s,`${ITEMS[j.contenu].nom} — sac plein, laissé sur place.`,'mal');
      else dit(s,`Trouvé : ${ITEMS[j.contenu].nom}.`,'bien');
      break;
    }
    case 'soigner': retirer(s,'herbe_v'); s.joueur.pv=Math.min(s.joueur.pvMax,s.joueur.pv+SOIN_HERBE_VERTE); dit(s,'Herbe verte. +3 PV.','bien'); break;
    case 'combiner': retirer(s,'herbe_v'); retirer(s,'herbe_r'); s.joueur.pv=s.joueur.pvMax; dit(s,'Verte + rouge. Santé complète.','bien'); break;
    case 'arme': s.joueur.arme=action.arme; dit(s,`Arme en main : ${ARMES[action.arme].nom}.`); break;
    case 'finir': s.pa=0; break;
  }

  if (s.pa<=0 && !s.fin) finDeTour(s);
  return s;
}
