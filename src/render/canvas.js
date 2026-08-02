/* =========================================================================
   RENDU — Canvas 2D, en cases. Ne lit que l'état, n'écrit jamais dedans.
   ========================================================================= */
import { TUILES, PORTES, APPARITIONS, SECOUSSE_AMORTISSEMENT, SECOUSSE_SEUIL } from '../config.js';
import { BORNES, cle } from '../rules/plateau.js';
import { actions } from '../rules/actions.js';

const TEINTES = {
  couloir_n:['#4A4A22','#6E6E33'], couloir_s:['#4A4A22','#6E6E33'],
  sombre:['#4A2A1A','#8A5230'],    parking:['#40401E','#66662E'],
  _defaut:['#24402C','#3E6B48'],
};

export function taille(app){
  const cv = app.cv, ctx = app.ctx;
  const r = cv.parentElement.getBoundingClientRect(), d = window.devicePixelRatio||1;
  cv.width = r.width*d; cv.height = r.height*d;
  ctx.setTransform(d,0,0,d,0,0);
  dessiner(app);
}

export function geometrie(app){
  const W=app.cv.clientWidth, H=app.cv.clientHeight, pad=16;
  const t = Math.floor(Math.min((W-pad*2)/BORNES.w, (H-pad*2)/BORNES.h));
  app.G = { t, ox: Math.round((W - t*BORNES.w)/2), oy: Math.round((H - t*BORNES.h)/2) };
}

export function recalculer(app){
  app.accessibles = new Map(); app.cibles = new Set();
  if (!app.S || app.S.fin) return;
  for (const a of actions(app.S)){
    if (a.type==='deplacer') app.accessibles.set(cle(a.vers), a);
    if (a.type==='attaquer') app.cibles.add(a.cible);
  }
}

export function dessiner(app){
  const S = app.S, cv = app.cv, ctx = app.ctx;
  if (!S) return;
  geometrie(app);
  const G = app.G;
  const px = (c) => [G.ox + c[0]*G.t, G.oy + c[1]*G.t];
  const W=cv.clientWidth, H=cv.clientHeight, t=G.t;
  ctx.clearRect(0,0,W,H);
  ctx.save();
  if (app.secousse>0){ ctx.translate((Math.random()-.5)*app.secousse,(Math.random()-.5)*app.secousse); app.secousse*=SECOUSSE_AMORTISSEMENT; if(app.secousse<SECOUSSE_SEUIL) app.secousse=0; }

  // quadrillage de fond, comme la grille imprimée du plateau
  ctx.strokeStyle='#232A2E'; ctx.lineWidth=1;
  for(let x=0;x<=BORNES.w;x++){ const [a]=px([x,0]); ctx.beginPath(); ctx.moveTo(a+.5,0); ctx.lineTo(a+.5,H); ctx.stroke(); }
  for(let y=0;y<=BORNES.h;y++){ const [,b]=px([0,y]); ctx.beginPath(); ctx.moveTo(0,b+.5); ctx.lineTo(W,b+.5); ctx.stroke(); }

  // tuiles : remplissage des cases + contour de l'union
  for (const tu of TUILES){
    const [fond, bord] = TEINTES[tu.id] || TEINTES._defaut;
    const cells = [];
    for (const [x,y,w,h] of tu.rects) for(let i=0;i<w;i++) for(let j=0;j<h;j++) cells.push([x+i,y+j]);
    ctx.fillStyle = fond;
    for (const c of cells){ const [a,b]=px(c); ctx.fillRect(a,b,t,t); }
    // lignes de cases internes
    ctx.strokeStyle='rgba(255,255,255,.055)'; ctx.lineWidth=1;
    for (const c of cells){ const [a,b]=px(c); ctx.strokeRect(a+.5,b+.5,t-1,t-1); }
    // contour extérieur : les arêtes sans voisine dans la même tuile
    const dedans = new Set(cells.map(c=>cle(c)));
    ctx.strokeStyle='#D8D2C0'; ctx.lineWidth=2; ctx.beginPath();
    for (const c of cells){
      const [a,b]=px(c);
      if(!dedans.has(cle([c[0],c[1]-1]))){ ctx.moveTo(a,b); ctx.lineTo(a+t,b); }
      if(!dedans.has(cle([c[0],c[1]+1]))){ ctx.moveTo(a,b+t); ctx.lineTo(a+t,b+t); }
      if(!dedans.has(cle([c[0]-1,c[1]]))){ ctx.moveTo(a,b); ctx.lineTo(a,b+t); }
      if(!dedans.has(cle([c[0]+1,c[1]]))){ ctx.moveTo(a+t,b); ctx.lineTo(a+t,b+t); }
    }
    ctx.stroke();
    // nom de la tuile
    const x0=Math.min(...cells.map(c=>c[0])), y0=Math.min(...cells.map(c=>c[1]));
    const [a,b]=px([x0,y0]);
    ctx.fillStyle='rgba(232,226,206,.55)'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.font=`600 ${Math.max(9,Math.round(t*.28))}px "Big Shoulders Display", sans-serif`;
    ctx.fillText(tu.nom.toUpperCase(), a+4, b+3);
  }

  // points d'apparition
  for (const p of APPARITIONS){
    const [a,b]=px(p), cx=a+t/2, cy=b+t/2, r=t*.17;
    ctx.strokeStyle='rgba(150,220,150,.65)'; ctx.lineWidth=1.5;
    for(let k=0;k<3;k++){
      const ang=-Math.PI/2 + k*2*Math.PI/3;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r, r*.42, 0, 7); ctx.stroke();
    }
  }

  // jetons de fouille
  for (const j of S.jetons){
    if (j.pris) continue;
    const [a,b]=px(j.c), s=t*.44, x=a+t/2-s/2, y=b+t/2-s/2;
    ctx.fillStyle = j.type==='B' ? '#5A1A1A' : '#12457A';
    ctx.fillRect(x,y,s,s);
    ctx.strokeStyle='#E8E2CE'; ctx.lineWidth=1.5; ctx.strokeRect(x,y,s,s);
    ctx.fillStyle='#E8E2CE'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`700 ${Math.max(8,Math.round(t*.3))}px "Courier Prime", monospace`;
    ctx.fillText(j.type, a+t/2, b+t/2+1);
  }

  // portes : un jeton posé à cheval sur l'arête
  for (const p of PORTES){
    const ouverte = !p.verrou || S.portesOuvertes.includes(cle(p.a)+'|'+cle(p.b));
    const [ax,ay]=px(p.a), [bx,by]=px(p.b);
    const cx=(ax+bx)/2+t/2, cy=(ay+by)/2+t/2;
    const horiz = p.a[1]!==p.b[1];              // porte sur une arête horizontale
    const L=t*.62, E=t*.2;
    const w = horiz?L:E, h = horiz?E:L;
    ctx.save(); ctx.translate(cx,cy);
    ctx.fillStyle = ouverte ? '#7A4A22' : '#2A2A2A';
    ctx.fillRect(-w/2,-h/2,w,h);
    ctx.strokeStyle = ouverte ? '#C08A45' : '#E2A03F';
    ctx.lineWidth=1.5; ctx.strokeRect(-w/2,-h/2,w,h);
    if (!ouverte){
      ctx.fillStyle='#E2A03F'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font=`700 ${Math.max(8,Math.round(t*.3))}px "Courier Prime", monospace`;
      ctx.fillText(p.verrou==='carte'?'▤':'♠', 0, 1);
    }
    ctx.restore();
  }

  // cases atteignables
  for (const k of app.accessibles.keys()){
    const c=k.split(',').map(Number), [a,b]=px(c);
    ctx.fillStyle = (app.survol&&cle(app.survol)===k) ? 'rgba(226,160,63,.34)' : 'rgba(226,160,63,.12)';
    ctx.fillRect(a+1,b+1,t-2,t-2);
  }

  // ennemis
  for (const e of S.ennemis){
    const [a,b]=px(e.c), cx=a+t/2, cy=b+t/2, r=t*.34;
    if (app.cibles.has(e.id)){
      ctx.strokeStyle='#E2A03F'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,r+4,0,7); ctx.stroke();
    }
    ctx.fillStyle = e.type==='licker'?'#B4453F':e.type==='chien'?'#8E5A2A':'#7E1C1C';
    ctx.beginPath();
    if(e.type==='chien'){ ctx.moveTo(cx,cy-r); ctx.lineTo(cx+r*.9,cy+r*.75); ctx.lineTo(cx-r*.9,cy+r*.75); }
    else if(e.type==='licker'){ ctx.moveTo(cx,cy-r); ctx.lineTo(cx+r,cy); ctx.lineTo(cx,cy+r); ctx.lineTo(cx-r,cy); }
    else ctx.arc(cx,cy,r,0,7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#0E1518'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#F0E4C8'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`700 ${Math.max(8,Math.round(t*.3))}px "Courier Prime", monospace`;
    ctx.fillText(e.pv, cx, cy+1);
  }

  // joueur
  const [a,b]=px(S.joueur.c), cx=a+t/2, cy=b+t/2;
  ctx.fillStyle='#BFB394'; ctx.beginPath(); ctx.arc(cx,cy,t*.34,0,7); ctx.fill();
  ctx.strokeStyle='#0E1518'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#16232A'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`800 ${Math.max(10,Math.round(t*.42))}px "Big Shoulders Display", sans-serif`;
  ctx.fillText('L', cx, cy+1);

  ctx.restore();
  if (app.secousse>0) requestAnimationFrame(()=>dessiner(app));
}
