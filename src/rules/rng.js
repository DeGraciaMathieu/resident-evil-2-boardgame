/* Générateur pseudo-aléatoire seedé. Seul le point d'entrée décide du seed. */
export function makeRng(seed){ return { s: seed >>> 0 }; }
export function rnd(rng){
  rng.s = (rng.s + 0x6d2b79f5) >>> 0;
  let t = rng.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rndInt = (rng,n) => Math.floor(rnd(rng)*n);
export function shuffle(rng,arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=rndInt(rng,i+1); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
