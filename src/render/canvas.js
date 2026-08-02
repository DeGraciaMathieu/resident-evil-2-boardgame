/* =========================================================================
   RENDERING — 2D canvas, in cells. Reads the state, never writes into it.
   ========================================================================= */
import { TILES, DOORS, SPAWN_POINTS, SHAKE_DAMPING, SHAKE_THRESHOLD, FX_DURATION } from '../config.js';
import { BOUNDS, key } from '../rules/board.js';
import { actions } from '../rules/actions.js';

const TINTS = {
  corridor_n:['#4A4A22','#6E6E33'], corridor_s:['#4A4A22','#6E6E33'],
  darkroom:['#4A2A1A','#8A5230'],   parking:['#40401E','#66662E'],
  _default:['#24402C','#3E6B48'],
};

export function resize(app){
  const cv = app.cv, ctx = app.ctx;
  const r = cv.parentElement.getBoundingClientRect(), d = window.devicePixelRatio||1;
  cv.width = r.width*d; cv.height = r.height*d;
  ctx.setTransform(d,0,0,d,0,0);
  draw(app);
}

export function geometry(app){
  const W=app.cv.clientWidth, H=app.cv.clientHeight, pad=16;
  const t = Math.floor(Math.min((W-pad*2)/BOUNDS.w, (H-pad*2)/BOUNDS.h));
  app.G = { t, ox: Math.round((W - t*BOUNDS.w)/2), oy: Math.round((H - t*BOUNDS.h)/2) };
}

// Cosmetic transient effect (tween, spawn pop, floating damage), pure presentation.
export function addFx(app, fx){
  app.fx.push({ ...fx, t0: performance.now(), dur: FX_DURATION[fx.kind] });
}

const easeOut = p => p*(2-p);

export function recompute(app){
  app.reachable = new Map(); app.targets = new Set();
  if (!app.S || app.S.over) return;
  for (const a of actions(app.S)){
    if (a.type==='move') app.reachable.set(key(a.to), a);
    if (a.type==='attack') app.targets.add(a.target);
  }
}

export function draw(app){
  const S = app.S, cv = app.cv, ctx = app.ctx;
  if (!S) return;
  geometry(app);
  const G = app.G;
  const px = (c) => [G.ox + c[0]*G.t, G.oy + c[1]*G.t];
  const W=cv.clientWidth, H=cv.clientHeight, t=G.t;
  const now = performance.now();
  if (app.fx.length) app.fx = app.fx.filter(f => now - f.t0 < f.dur);
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if (app.shake>0){ ctx.translate((Math.random()-.5)*app.shake,(Math.random()-.5)*app.shake); app.shake*=SHAKE_DAMPING; if(app.shake<SHAKE_THRESHOLD) app.shake=0; }

  // background grid, like the printed grid of the board
  ctx.strokeStyle='#232A2E'; ctx.lineWidth=1;
  for(let x=0;x<=BOUNDS.w;x++){ const [a]=px([x,0]); ctx.beginPath(); ctx.moveTo(a+.5,0); ctx.lineTo(a+.5,H); ctx.stroke(); }
  for(let y=0;y<=BOUNDS.h;y++){ const [,b]=px([0,y]); ctx.beginPath(); ctx.moveTo(0,b+.5); ctx.lineTo(W,b+.5); ctx.stroke(); }

  // tiles: cell fill + outline of the union
  for (const tl of TILES){
    const [fill, border] = TINTS[tl.id] || TINTS._default;
    const cells = [];
    for (const [x,y,w,h] of tl.rects) for(let i=0;i<w;i++) for(let j=0;j<h;j++) cells.push([x+i,y+j]);
    ctx.fillStyle = fill;
    for (const c of cells){ const [a,b]=px(c); ctx.fillRect(a,b,t,t); }
    // inner cell lines
    ctx.strokeStyle='rgba(255,255,255,.055)'; ctx.lineWidth=1;
    for (const c of cells){ const [a,b]=px(c); ctx.strokeRect(a+.5,b+.5,t-1,t-1); }
    // outer outline: edges without a neighbour in the same tile
    const inside = new Set(cells.map(c=>key(c)));
    ctx.strokeStyle='#D8D2C0'; ctx.lineWidth=2; ctx.beginPath();
    for (const c of cells){
      const [a,b]=px(c);
      if(!inside.has(key([c[0],c[1]-1]))){ ctx.moveTo(a,b); ctx.lineTo(a+t,b); }
      if(!inside.has(key([c[0],c[1]+1]))){ ctx.moveTo(a,b+t); ctx.lineTo(a+t,b+t); }
      if(!inside.has(key([c[0]-1,c[1]]))){ ctx.moveTo(a,b); ctx.lineTo(a,b+t); }
      if(!inside.has(key([c[0]+1,c[1]]))){ ctx.moveTo(a+t,b); ctx.lineTo(a+t,b+t); }
    }
    ctx.stroke();
    // tile name
    const x0=Math.min(...cells.map(c=>c[0])), y0=Math.min(...cells.map(c=>c[1]));
    const [a,b]=px([x0,y0]);
    ctx.fillStyle='rgba(232,226,206,.55)'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.font=`600 ${Math.max(9,Math.round(t*.28))}px "Big Shoulders Display", sans-serif`;
    ctx.fillText(tl.name.toUpperCase(), a+4, b+3);
  }

  // spawn points
  for (const p of SPAWN_POINTS){
    const [a,b]=px(p), cx=a+t/2, cy=b+t/2, r=t*.17;
    ctx.strokeStyle='rgba(150,220,150,.65)'; ctx.lineWidth=1.5;
    for(let k=0;k<3;k++){
      const ang=-Math.PI/2 + k*2*Math.PI/3;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r, r*.42, 0, 7); ctx.stroke();
    }
  }

  // search tokens
  for (const tk of S.tokens){
    if (tk.taken) continue;
    const [a,b]=px(tk.c), s=t*.44, x=a+t/2-s/2, y=b+t/2-s/2;
    ctx.fillStyle = tk.type==='B' ? '#5A1A1A' : '#12457A';
    ctx.fillRect(x,y,s,s);
    ctx.strokeStyle='#E8E2CE'; ctx.lineWidth=1.5; ctx.strokeRect(x,y,s,s);
    ctx.fillStyle='#E8E2CE'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`700 ${Math.max(8,Math.round(t*.3))}px "Courier Prime", monospace`;
    ctx.fillText(tk.type, a+t/2, b+t/2+1);
  }

  // doors: a token straddling the edge — brown when open, dark when closed,
  // amber glyph while still locked
  for (const d of DOORS){
    const dk = key(d.a)+'|'+key(d.b);
    const open = S.openDoors.includes(dk);
    const locked = d.lock && !S.unlockedDoors.includes(dk);
    const [ax,ay]=px(d.a), [bx,by]=px(d.b);
    const cx=(ax+bx)/2+t/2, cy=(ay+by)/2+t/2;
    const horiz = d.a[1]!==d.b[1];              // door on a horizontal edge
    const L=t*.62, E=t*.2;
    const w = horiz?L:E, h = horiz?E:L;
    ctx.save(); ctx.translate(cx,cy);
    ctx.fillStyle = open ? '#7A4A22' : '#2A2A2A';
    ctx.fillRect(-w/2,-h/2,w,h);
    ctx.strokeStyle = open ? '#C08A45' : locked ? '#E2A03F' : '#C08A45';
    ctx.lineWidth=1.5; ctx.strokeRect(-w/2,-h/2,w,h);
    if (locked){
      ctx.fillStyle='#E2A03F'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font=`700 ${Math.max(8,Math.round(t*.3))}px "Courier Prime", monospace`;
      ctx.fillText(d.lock==='keycard'?'▤':'♠', 0, 1);
    }
    ctx.restore();
  }

  // reachable cells
  for (const k of app.reachable.keys()){
    const c=k.split(',').map(Number), [a,b]=px(c);
    ctx.fillStyle = (app.hover&&key(app.hover)===k) ? 'rgba(226,160,63,.34)' : 'rgba(226,160,63,.12)';
    ctx.fillRect(a+1,b+1,t-2,t-2);
  }

  // enemies — a tween fx slides them between cells, a spawn fx scales them in
  for (const e of S.enemies){
    let cell = e.c, scale = 1;
    const tw = app.fx.find(f=>f.kind==='tween' && f.id===e.id);
    if (tw){
      const p = easeOut(Math.min(1,(now-tw.t0)/tw.dur));
      cell = [tw.from[0]+(tw.to[0]-tw.from[0])*p, tw.from[1]+(tw.to[1]-tw.from[1])*p];
    }
    const [a,b]=px(cell), cx=a+t/2, cy=b+t/2;
    const sp = app.fx.find(f=>f.kind==='spawn' && f.id===e.id);
    if (sp){
      const p = Math.min(1,(now-sp.t0)/sp.dur);
      scale = easeOut(p);
      ctx.strokeStyle=`rgba(200,106,106,${1-p})`; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,t*(.2+.5*p),0,7); ctx.stroke();
    }
    const r=t*.34*scale;
    if (app.targets.has(e.id)){
      ctx.strokeStyle='#E2A03F'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,r+4,0,7); ctx.stroke();
    }
    if (app.focus===e.id){ // enemy currently acting during the end-of-turn playback
      ctx.strokeStyle='#F0E4C8'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(cx,cy,r+5,0,7); ctx.stroke();
    }
    ctx.fillStyle = e.type==='licker'?'#B4453F':e.type==='dog'?'#8E5A2A':'#7E1C1C';
    ctx.beginPath();
    if(e.type==='dog'){ ctx.moveTo(cx,cy-r); ctx.lineTo(cx+r*.9,cy+r*.75); ctx.lineTo(cx-r*.9,cy+r*.75); }
    else if(e.type==='licker'){ ctx.moveTo(cx,cy-r); ctx.lineTo(cx+r,cy); ctx.lineTo(cx,cy+r); ctx.lineTo(cx-r,cy); }
    else ctx.arc(cx,cy,r,0,7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#0E1518'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#F0E4C8'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`700 ${Math.max(8,Math.round(t*.3))}px "Courier Prime", monospace`;
    ctx.fillText(e.hp, cx, cy+1);
  }

  // player
  const [a,b]=px(S.player.c), cx=a+t/2, cy=b+t/2;
  ctx.fillStyle='#BFB394'; ctx.beginPath(); ctx.arc(cx,cy,t*.34,0,7); ctx.fill();
  ctx.strokeStyle='#0E1518'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#16232A'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`800 ${Math.max(10,Math.round(t*.42))}px "Big Shoulders Display", sans-serif`;
  ctx.fillText('L', cx, cy+1);

  // floating damage over the struck cell
  for (const f of app.fx){
    if (f.kind!=='hit') continue;
    const p=(now-f.t0)/f.dur, [a,b]=px(f.c);
    ctx.globalAlpha=1-p;
    ctx.fillStyle='#C86A6A'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.font=`800 ${Math.max(12,Math.round(t*.5))}px "Big Shoulders Display", sans-serif`;
    ctx.fillText(`−${f.dmg}`, a+t/2, b - p*t*.5);
    ctx.globalAlpha=1;
  }

  // dice rolled over the shot target: tumbling faces, then the real values
  for (const f of app.fx){
    if (f.kind!=='dice') continue;
    const p=(now-f.t0)/f.dur, [a,b]=px(f.c);
    const rolling = p < .5;
    const side=t*.36, gap=t*.08;
    const width = f.dice.length*side + (f.dice.length-1)*gap;
    let x = a + t/2 - width/2 + side/2;
    const y = b - t*.32;
    ctx.globalAlpha = p>.85 ? (1-p)/.15 : 1;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`700 ${Math.max(9,Math.round(side*.62))}px "Courier Prime", monospace`;
    for (let i=0;i<f.dice.length;i++){
      const die = f.dice[i];
      const v = rolling ? (Math.floor(now/55)+i*2)%3 : die.face;
      ctx.save(); ctx.translate(x,y);
      if (rolling) ctx.rotate(Math.sin(now/45 + i*2)*.5);
      ctx.fillStyle = die.color==='blue' ? '#2E4A66' : '#7E1C1C';
      ctx.fillRect(-side/2,-side/2,side,side);
      ctx.strokeStyle='#16232A'; ctx.lineWidth=1.5; ctx.strokeRect(-side/2,-side/2,side,side);
      ctx.fillStyle = !rolling && v===0 ? 'rgba(240,228,200,.45)' : '#F0E4C8';
      ctx.fillText(v, 0, 1);
      ctx.restore();
      x += side+gap;
    }
    ctx.globalAlpha=1;
  }

  ctx.restore();
  if ((app.shake>0 || app.fx.length) && !app.raf){
    app.raf = true;
    requestAnimationFrame(()=>{ app.raf=false; draw(app); });
  }
}
