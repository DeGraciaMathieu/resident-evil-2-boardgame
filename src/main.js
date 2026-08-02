/* =========================================================================
   ENGINE v2 — the map lives in CELLS.
   A tile is a union of rectangles laid on a grid. Moving from one tile to
   another only happens through a DOOR token placed on the edge between two
   specific cells. Enemies appear on the SPAWN POINTS printed on the tiles.

   Entry point: application state, seed, wiring of the layers.
   ========================================================================= */
import { SEED_MAX } from './config.js';
import { tileAt } from './rules/board.js';
import { createGame } from './state/game.js';
import { resize, draw } from './render/canvas.js';
import { refresh } from './render/hud.js';
import { act } from './loop/controller.js';
import { bindMouse } from './input/mouse.js';
import { bindButtons } from './input/buttons.js';

const cv = document.getElementById('board');
const app = {
  cv, ctx: cv.getContext('2d'),
  S:null, G:null, hover:null, reachable:new Map(), targets:new Set(), shake:0,
};

bindMouse(app, { act, refresh, draw });
bindButtons(app, { act });
addEventListener('resize', ()=>resize(app));

function newGame(seed){
  const s = seed ?? (Math.floor(Math.random()*SEED_MAX)+1);
  app.S = createGame(s);
  app.S.lastTile = tileAt(app.S.player.c);
  document.getElementById('seedNo').textContent = s;
  document.getElementById('cardTitle').textContent='Le calme';
  document.getElementById('cardText').textContent='Vous entrez. La porte se referme seule derrière vous.';
  document.getElementById('cardNum').textContent='';
  resize(app); refresh(app);
}
// The entry point is a module: the function must be exposed for the inline onclick.
window.newGame = newGame;
newGame(Number(new URLSearchParams(location.search).get('seed')) || undefined);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=>resize(app));
addEventListener('load', ()=>resize(app));
