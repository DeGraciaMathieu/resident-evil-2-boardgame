/* Déplacement : distances atteignables (BFS) et chemin le plus court. */
import { cle, memeCase, passe, adjacentes } from './plateau.js';

export function distances(s, depart, pourEnnemi=false, max=99){
  const d = new Map([[cle(depart),0]]);
  const file = [depart];
  while (file.length){
    const c = file.shift();
    const dc = d.get(cle(c));
    if (dc >= max) continue;
    for (const v of adjacentes(c)){
      if (d.has(cle(v))) continue;
      if (!passe(s,c,v,pourEnnemi)) continue;
      d.set(cle(v), dc+1); file.push(v);
    }
  }
  return d;
}
export function premierPas(s, depuis, but, pourEnnemi=true){
  const file=[[depuis]], vus=new Set([cle(depuis)]);
  while(file.length){
    const ch=file.shift(), t=ch[ch.length-1];
    if (memeCase(t,but)) return ch.slice(1);
    for (const v of adjacentes(t)){
      if (vus.has(cle(v))) continue;
      if (!passe(s,t,v,pourEnnemi)) continue;
      vus.add(cle(v)); file.push([...ch,v]);
    }
  }
  return null;
}
