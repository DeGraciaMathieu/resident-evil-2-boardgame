/* Sac : ajout, retrait, piles et capacité. */
import { ITEMS } from '../config.js';

export const aObjet=(s,id)=>s.sac.some(i=>i.id===id);
export function ajouter(s,id,n=1){
  const def=ITEMS[id];
  const slot=s.sac.find(i=>i.id===id && i.n<def.pile);
  if(slot){ slot.n=Math.min(def.pile,slot.n+n); return true; }
  if(s.sac.length>=s.sacMax) return false;
  s.sac.push({id,n}); return true;
}
export function retirer(s,id,n=1){
  const i=s.sac.findIndex(x=>x.id===id);
  if(i<0) return false;
  s.sac[i].n-=n; if(s.sac[i].n<=0) s.sac.splice(i,1);
  return true;
}
export const nbMunitions=(s)=>s.sac.filter(i=>i.id==='munitions').reduce((a,b)=>a+b.n,0);
