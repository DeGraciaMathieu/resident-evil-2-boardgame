/* Souris sur le plateau : survol et clic (déplacement, tir, messages d'aide).
   Les effets (acte, maj, dessiner) sont injectés par main.js. */
import { ITEMS, ARMES, SECOUSSE_INITIALE } from '../config.js';
import { CASES, PORTE_INDEX, cle, memeCase, distCases } from '../rules/plateau.js';
import { distances } from '../rules/deplacement.js';
import { nbMunitions } from '../rules/sac.js';
import { actions } from '../rules/actions.js';

function caseSous(app, ev){
  const b=app.cv.getBoundingClientRect();
  const x=Math.floor((ev.clientX-b.left-app.G.ox)/app.G.t), y=Math.floor((ev.clientY-b.top-app.G.oy)/app.G.t);
  return CASES.has(x+','+y) ? [x,y] : null;
}

export function brancherSouris(app, { acte, maj, dessiner }){
  app.cv.addEventListener('mousemove', ev=>{
    if (!app.G) return;
    const c = caseSous(app, ev);
    const k = c?cle(c):null, k0 = app.survol?cle(app.survol):null;
    if (k!==k0){
      app.survol = c;
      const e = c && app.S.ennemis.find(e=>memeCase(e.c,c));
      app.cv.style.cursor = (c && (app.accessibles.has(k) || (e && app.cibles.has(e.id)))) ? 'pointer' : 'default';
      dessiner(app);
    }
  });
  app.cv.addEventListener('click', ev=>{
    const S = app.S;
    if (!S || S.fin || S.phase!=='joueur' || !app.G) return;
    const c = caseSous(app, ev); if(!c) return;
    const e = S.ennemis.find(e=>memeCase(e.c,c));
    if (e){
      if (app.cibles.has(e.id)){ app.secousse=SECOUSSE_INITIALE; return acte(app, actions(S).find(a=>a.type==='attaquer'&&a.cible===e.id)); }
      const arme=ARMES[S.joueur.arme];
      S.log.push({t:'mal', m: nbMunitions(S)<arme.mun ? 'Chargeur vide.'
        : distCases(S.joueur.c,e.c)>arme.portee ? `Trop loin (portée ${arme.portee}).` : 'Pas de ligne de vue.'});
      return maj(app);
    }
    const a = app.accessibles.get(cle(c));
    if (a) return acte(app, a);
    const d = distances(S, S.joueur.c, false, 1);
    for (const v of [[c[0]+1,c[1]],[c[0]-1,c[1]],[c[0],c[1]+1],[c[0],c[1]-1]]){
      const p = PORTE_INDEX.get(`${v}|${c}`);
      if (p && p.verrou && d.has(cle(v)) && !S.sac.some(i=>i.id===p.verrou)){
        S.log.push({t:'mal', m:'Verrouillée. Il faut : '+ITEMS[p.verrou].nom+'.'}); return maj(app);
      }
    }
  });
}
