/* Movement: reachable distances (BFS) and shortest path. */
import { BFS_MAX } from '../config.js';
import { key, sameCell, canPass, neighbors } from './board.js';

export function distances(s, from, forEnemy=false, max=BFS_MAX){
  const d = new Map([[key(from),0]]);
  const queue = [from];
  while (queue.length){
    const c = queue.shift();
    const dc = d.get(key(c));
    if (dc >= max) continue;
    for (const v of neighbors(c)){
      if (d.has(key(v))) continue;
      if (!canPass(s,c,v,forEnemy)) continue;
      d.set(key(v), dc+1); queue.push(v);
    }
  }
  return d;
}
export function firstStep(s, from, to, forEnemy=true){
  const queue=[[from]], seen=new Set([key(from)]);
  while(queue.length){
    const path=queue.shift(), t=path[path.length-1];
    if (sameCell(t,to)) return path.slice(1);
    for (const v of neighbors(t)){
      if (seen.has(key(v))) continue;
      if (!canPass(s,t,v,forEnemy)) continue;
      seen.add(key(v)); queue.push([...path,v]);
    }
  }
  return null;
}
