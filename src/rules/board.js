/* Board topology: cell index, doors, passability. */
import { TILES, DOORS } from '../config.js';

export const CELLS = new Map();       // "x,y" -> tile id
for (const t of TILES)
  for (const [x,y,w,h] of t.rects)
    for (let i=0;i<w;i++) for (let j=0;j<h;j++) CELLS.set(`${x+i},${y+j}`, t.id);

export const DOOR_INDEX = new Map(); // "x,y|x2,y2" -> door
for (const d of DOORS){
  DOOR_INDEX.set(`${d.a}|${d.b}`, d);
  DOOR_INDEX.set(`${d.b}|${d.a}`, d);
}
export const BOUNDS = (()=>{
  let X=0,Y=0;
  for (const k of CELLS.keys()){ const [x,y]=k.split(',').map(Number); X=Math.max(X,x); Y=Math.max(Y,y); }
  return { w:X+1, h:Y+1 };
})();

export const key = (c) => `${c[0]},${c[1]}`;
export const tileAt = (c) => CELLS.get(key(c));
export const tile = (id) => TILES.find(t=>t.id===id);
export const sameCell = (a,b) => a[0]===b[0] && a[1]===b[1];
export const cellDistance = (a,b) => Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]));

// Passage between two orthogonally adjacent cells.
export function canPass(s, a, b, forEnemy=false){
  const ta = CELLS.get(key(a)), tb = CELLS.get(key(b));
  if (!ta || !tb) return false;
  if (ta === tb) return true;                       // same tile: free
  const d = DOOR_INDEX.get(`${a}|${b}`);
  if (!d) return false;                             // wall: no door
  if (!d.lock) return true;
  if (s.openedDoors.includes(key(d.a)+'|'+key(d.b))) return true;
  return forEnemy ? false : s.bag.some(i=>i.id===d.lock);
}
export function neighbors(c){
  return [[c[0]+1,c[1]],[c[0]-1,c[1]],[c[0],c[1]+1],[c[0],c[1]-1]];
}
