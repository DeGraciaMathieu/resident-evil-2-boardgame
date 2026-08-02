/* Line of sight: Bresenham trace, blocked by walls and closed doors. */
import { SIGHT_GUARD } from '../config.js';
import { canPass } from './board.js';

export function lineOfSight(s, a, b){
  let [x0,y0]=a; const [x1,y1]=b;
  const dx=Math.abs(x1-x0), dy=Math.abs(y1-y0);
  const sx=x0<x1?1:-1, sy=y0<y1?1:-1;
  let err=dx-dy, prev=[x0,y0], guard=0;
  while (guard++ < SIGHT_GUARD){
    if (x0===x1 && y0===y1) return true;
    const e2=2*err;
    let nx=x0, ny=y0;
    if (e2 > -dy){ err-=dy; nx+=sx; }
    if (e2 <  dx){ err+=dx; ny+=sy; }
    // a diagonal step is decomposed: at least one of the two orthogonal
    // passages must be open
    if (nx!==x0 && ny!==y0){
      const viaH=[nx,y0], viaV=[x0,ny];
      const okH = canPass(s,[x0,y0],viaH) && canPass(s,viaH,[nx,ny]);
      const okV = canPass(s,[x0,y0],viaV) && canPass(s,viaV,[nx,ny]);
      if (!okH && !okV) return false;
    } else if (!canPass(s,[x0,y0],[nx,ny])) return false;
    x0=nx; y0=ny; prev=[x0,y0];
  }
  return false;
}
