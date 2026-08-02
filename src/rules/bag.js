/* Bag: adding, removing, stacks and capacity. */
import { ITEMS } from '../config.js';

export const hasItem=(s,id)=>s.bag.some(i=>i.id===id);
export function addItem(s,id,n=1){
  const def=ITEMS[id];
  const slot=s.bag.find(i=>i.id===id && i.n<def.stack);
  if(slot){ slot.n=Math.min(def.stack,slot.n+n); return true; }
  if(s.bag.length>=s.bagMax) return false;
  s.bag.push({id,n}); return true;
}
export function removeItem(s,id,n=1){
  const i=s.bag.findIndex(x=>x.id===id);
  if(i<0) return false;
  s.bag[i].n-=n; if(s.bag[i].n<=0) s.bag.splice(i,1);
  return true;
}
export const ammoCount=(s)=>s.bag.filter(i=>i.id==='ammo').reduce((a,b)=>a+b.n,0);
