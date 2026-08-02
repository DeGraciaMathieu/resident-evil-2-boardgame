/* Topologie du plateau : index des cases, portes, franchissabilité. */
import { TUILES, PORTES } from '../config.js';

export const CASES = new Map();       // "x,y" -> id de tuile
for (const t of TUILES)
  for (const [x,y,w,h] of t.rects)
    for (let i=0;i<w;i++) for (let j=0;j<h;j++) CASES.set(`${x+i},${y+j}`, t.id);

export const PORTE_INDEX = new Map(); // "x,y|x2,y2" -> porte
for (const p of PORTES){
  PORTE_INDEX.set(`${p.a}|${p.b}`, p);
  PORTE_INDEX.set(`${p.b}|${p.a}`, p);
}
export const BORNES = (()=>{
  let X=0,Y=0;
  for (const k of CASES.keys()){ const [x,y]=k.split(',').map(Number); X=Math.max(X,x); Y=Math.max(Y,y); }
  return { w:X+1, h:Y+1 };
})();

export const cle = (c) => `${c[0]},${c[1]}`;
export const tuileDe = (c) => CASES.get(cle(c));
export const tuile = (id) => TUILES.find(t=>t.id===id);
export const memeCase = (a,b) => a[0]===b[0] && a[1]===b[1];
export const distCases = (a,b) => Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]));

// Passage entre deux cases orthogonalement adjacentes.
export function passe(s, a, b, pourEnnemi=false){
  const ta = CASES.get(cle(a)), tb = CASES.get(cle(b));
  if (!ta || !tb) return false;
  if (ta === tb) return true;                       // même tuile : libre
  const p = PORTE_INDEX.get(`${a}|${b}`);
  if (!p) return false;                             // mur : pas de porte
  if (!p.verrou) return true;
  if (s.portesOuvertes.includes(cle(p.a)+'|'+cle(p.b))) return true;
  return pourEnnemi ? false : s.sac.some(i=>i.id===p.verrou);
}
export function adjacentes(c){
  return [[c[0]+1,c[1]],[c[0]-1,c[1]],[c[0],c[1]+1],[c[0],c[1]-1]];
}
