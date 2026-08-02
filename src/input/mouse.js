/* Mouse on the board: hover and click (movement, shooting, help messages).
   Effects (act, refresh, draw) are injected by main.js. */
import { ITEMS, WEAPONS, SHAKE_INITIAL } from '../config.js';
import { CELLS, DOOR_INDEX, key, sameCell, cellDistance } from '../rules/board.js';
import { distances } from '../rules/movement.js';
import { ammoCount } from '../rules/bag.js';
import { actions } from '../rules/actions.js';

function cellUnder(app, ev){
  const b=app.cv.getBoundingClientRect();
  const x=Math.floor((ev.clientX-b.left-app.G.ox)/app.G.t), y=Math.floor((ev.clientY-b.top-app.G.oy)/app.G.t);
  return CELLS.has(x+','+y) ? [x,y] : null;
}

export function bindMouse(app, { act, refresh, draw }){
  app.cv.addEventListener('mousemove', ev=>{
    if (!app.G) return;
    const c = cellUnder(app, ev);
    const k = c?key(c):null, k0 = app.hover?key(app.hover):null;
    if (k!==k0){
      app.hover = c;
      const e = c && app.S.enemies.find(e=>sameCell(e.c,c));
      app.cv.style.cursor = (c && (app.reachable.has(k) || (e && app.targets.has(e.id)))) ? 'pointer' : 'default';
      draw(app);
    }
  });
  app.cv.addEventListener('click', ev=>{
    const S = app.S;
    if (!S || S.over || S.phase!=='player' || !app.G) return;
    const c = cellUnder(app, ev); if(!c) return;
    const e = S.enemies.find(e=>sameCell(e.c,c));
    if (e){
      if (app.targets.has(e.id)){ app.shake=SHAKE_INITIAL; return act(app, actions(S).find(a=>a.type==='attack'&&a.target===e.id)); }
      const weapon=WEAPONS[S.player.weapon];
      S.log.push({t:'bad', m: ammoCount(S)<weapon.ammo ? 'Chargeur vide.'
        : cellDistance(S.player.c,e.c)>weapon.range ? `Trop loin (portée ${weapon.range}).` : 'Pas de ligne de vue.'});
      return refresh(app);
    }
    const a = app.reachable.get(key(c));
    if (a) return act(app, a);
    const d = distances(S, S.player.c, false, 1);
    for (const v of [[c[0]+1,c[1]],[c[0]-1,c[1]],[c[0],c[1]+1],[c[0],c[1]-1]]){
      const door = DOOR_INDEX.get(`${v}|${c}`);
      if (door && door.lock && d.has(key(v)) && !S.bag.some(i=>i.id===door.lock)){
        S.log.push({t:'bad', m:'Verrouillée. Il faut : '+ITEMS[door.lock].name+'.'}); return refresh(app);
      }
    }
  });
}
