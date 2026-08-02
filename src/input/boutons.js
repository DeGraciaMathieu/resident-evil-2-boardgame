/* Boutons du bandeau : fouille, soins, arme, fin de tour.
   L'effet (acte) est injecté par main.js. */
import { actions } from '../rules/actions.js';

export function brancherBoutons(app, { acte }){
  const clic=(id,fn)=>document.getElementById(id).addEventListener('click',fn);
  clic('bFouiller',()=>acte(app, actions(app.S).find(a=>a.type==='fouiller')));
  clic('bSoin',    ()=>acte(app, actions(app.S).find(a=>a.type==='soigner')));
  clic('bComb',    ()=>acte(app, actions(app.S).find(a=>a.type==='combiner')));
  clic('bArme',    ()=>{
    const S = app.S;
    const ordre=['couteau','pistolet','pompe'].filter(a=>a!=='pompe'||S.sac.some(i=>i.id==='pompe'));
    const suiv=ordre[(ordre.indexOf(S.joueur.arme)+1)%ordre.length];
    acte(app, actions(S).find(a=>a.type==='arme'&&a.arme===suiv));
  });
  clic('bFin',     ()=>acte(app, actions(app.S).find(a=>a.type==='finir')));
}
