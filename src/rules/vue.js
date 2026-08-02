/* Ligne de vue : tracé de Bresenham, bloqué par les murs et les portes fermées. */
import { GARDE_VUE } from '../config.js';
import { passe } from './plateau.js';

export function vue(s, a, b){
  let [x0,y0]=a; const [x1,y1]=b;
  const dx=Math.abs(x1-x0), dy=Math.abs(y1-y0);
  const sx=x0<x1?1:-1, sy=y0<y1?1:-1;
  let err=dx-dy, prec=[x0,y0], garde=0;
  while (garde++ < GARDE_VUE){
    if (x0===x1 && y0===y1) return true;
    const e2=2*err;
    let nx=x0, ny=y0;
    if (e2 > -dy){ err-=dy; nx+=sx; }
    if (e2 <  dx){ err+=dx; ny+=sy; }
    // un pas diagonal est décomposé : il faut qu'au moins un des deux
    // passages orthogonaux soit ouvert
    if (nx!==x0 && ny!==y0){
      const viaH=[nx,y0], viaV=[x0,ny];
      const okH = passe(s,[x0,y0],viaH) && passe(s,viaH,[nx,ny]);
      const okV = passe(s,[x0,y0],viaV) && passe(s,viaV,[nx,ny]);
      if (!okH && !okV) return false;
    } else if (!passe(s,[x0,y0],[nx,ny])) return false;
    x0=nx; y0=ny; prec=[x0,y0];
  }
  return false;
}
