/* =========================================================================
   CONFIGURATION — board data and rule values.
   Player-facing strings (names, card texts) stay in French: the game is French.
   ========================================================================= */

/* ---------------------------------------------------------------- BOARD */
// rects: [x, y, width, height] in cells.
export const TILES = [
  { id:'corridor_n', name:'Couloir nord',   rects:[[7,0,5,1]] },
  { id:'office_w',   name:'Bureau ouest',   rects:[[3,1,5,3]] },
  { id:'lockers',    name:'Vestiaires',     rects:[[1,2,2,4]] },
  { id:'hall',       name:'Hall principal', rects:[[3,4,5,1],[3,5,1,3],[3,8,5,1],[7,5,1,3]] }, // ring
  { id:'darkroom',   name:'Chambre noire',  rects:[[4,5,3,3]] },                                // landlocked
  { id:'corridor_s', name:'Couloir sud',    rects:[[7,9,4,2]] },
  { id:'office_e',   name:'Bureau est',     rects:[[10,4,5,5]] },
  { id:'armory',     name:'Armurerie',      rects:[[10,1,3,3]] },
  { id:'parking',    name:'Sortie parking', rects:[[13,9,3,2]] },
];

// A door links two adjacent cells belonging to two different tiles.
export const DOORS = [
  { a:[7,0],  b:[7,1],  lock:null },
  { a:[10,0], b:[10,1], lock:'spade_key' },
  { a:[3,2],  b:[2,2],  lock:null },
  { a:[5,3],  b:[5,4],  lock:null },
  { a:[2,5],  b:[3,5],  lock:null },
  { a:[4,4],  b:[4,5],  lock:null },
  { a:[7,8],  b:[7,9],  lock:null },
  { a:[10,9], b:[10,8], lock:null },
  { a:[10,3], b:[10,4], lock:'spade_key' },
  { a:[13,8], b:[13,9], lock:'keycard' },
];

// Spawn points printed on the tiles.
export const SPAWN_POINTS = [[8,0],[3,1],[1,2],[3,8],[7,5],[8,9],[14,4],[10,7],[5,7],[11,1]];

// Search tokens placed on specific cells.
export const TOKENS = [
  { c:[4,2], type:'A' }, { c:[6,1], type:'A' },
  { c:[1,3], type:'A' }, { c:[2,4], type:'A' },
  { c:[5,6], type:'B' },
  { c:[11,5],type:'A' }, { c:[13,7],type:'A' },
  { c:[9,0], type:'A' },
  { c:[11,2],type:'B' },
];

export const ITEMS = {
  ammo:      { name:'Munitions', stack:8 },
  green_herb:{ name:'Herbe verte', stack:1 },
  red_herb:  { name:'Herbe rouge', stack:1 },
  spade_key: { name:'Clé de pique', stack:1, key:true },
  keycard:   { name:'Carte magnétique', stack:1, key:true },
  shotgun:   { name:'Fusil à pompe', stack:1 },
};
// A weapon rolls its dice and applies `effects[face]` once per rolled face:
// damage stacks, push is applied at most once per attack.
export const WEAPONS = {
  knife:  { name:'Couteau',       dice:{blue:0,red:1}, range:1, ammo:0, area:false,
            effects:{ 1:{kind:'damage',amount:1}, 2:{kind:'damage',amount:2} } },
  pistol: { name:'Pistolet',      dice:{blue:1,red:0}, range:5, ammo:1, area:false,
            effects:{ 1:{kind:'push'}, 2:{kind:'damage',amount:1} } },
  shotgun:{ name:'Fusil à pompe', dice:{blue:1,red:1}, range:2, ammo:1, area:true,
            effects:{ 1:{kind:'damage',amount:1}, 2:{kind:'damage',amount:2} } },
};
export const ENEMIES = {
  zombie:{ name:'Zombie', hp:4, damage:2, speed:2 },
  dog:   { name:'Chien',  hp:3, damage:2, speed:4 },
  licker:{ name:'Licker', hp:6, damage:3, speed:3 },
};
// Die faces are hits: blue is reliable, red is swingy.
export const DICE = {
  blue: [0,1,1,1,1,2],
  red:  [0,0,1,1,2,2],
};
export const MOVE_RANGE = 2; // cells covered by one move action

export const TENSION = [
  ...Array(4).fill({ id:'approach', title:'Ils arrivent', text:'Un zombie se relève sur un point d’apparition éloigné.' }),
  ...Array(2).fill({ id:'growl',    title:'Grognements',  text:'Ça se relève juste à côté.' }),
  ...Array(2).fill({ id:'pack',     title:'La meute',     text:'Une vitre explose. Un chien entre.' }),
  ...Array(2).fill({ id:'calm',     title:'Silence',      text:'Rien. Pour l’instant.' }),
  { id:'breath', title:'Reprendre souffle', text:'Vous récupérez un point de vie.' },
  { id:'swarm',  title:'Ça grouille',       text:'Tout ce qui rôde avance encore.' },
  { id:'stash',  title:'Fouille rapide',    text:'Une boîte de munitions traînait là.' },
  { id:'licker', title:'LICKER',            text:'Il descend du plafond. Il vous a entendu.' },
];

/* --------------------------------------------------------------- PLAYER */
export const PLAYER_NAME = 'Leon';
export const MAX_HP = 10;
export const MAX_AP = 4;
export const START_CELL = [3,4];
export const START_WEAPON = 'pistol';
export const BAG_MAX = 6;
export const START_BAG = [{id:'ammo',n:4},{id:'green_herb',n:1}];

/* ---------------------------------------------------------------- RULES */
// Possible contents of a type-A token.
export const TOKEN_POOL_A = ['ammo','ammo','green_herb','nothing','red_herb','ammo','nothing'];
// A token holding ammo yields 2 rounds.
export const AMMO_PER_TOKEN = 2;
// The first 8 deck cards are shuffled apart (the licker is never among them).
export const DECK_SPLIT = 8;
export const GREEN_HERB_HEAL = 3;
export const BREATH_HEAL = 1;
export const STASH_AMMO = 2;
export const SWARM_BONUS = 2;
// Minimum spawn distance per tension card.
export const SPAWN_DIST = { approach:6, growl:1, pack:4, licker:3 };
export const MOVE_COST = 1;
export const DOOR_COST = 1; // opening or closing an adjacent door
export const DISENGAGE_MOVE_COST = 2; // leaving an enemy's contact costs one extra action
export const SIGHT_GUARD = 200; // anti-infinite-loop guard of the line-of-sight trace
export const BFS_MAX = 99; // default BFS depth (safety bound)
export const INFINITE_DIST = 999; // "unreachable" sentinel for spawn-point choice

/* ------------------------------------------------------------------- UI */
export const LOG_MAX = 40;
export const DECK_CRITICAL = 4; // "critical" display threshold of the tension deck
export const CARD_FLIP_DELAY = 260; // ms
// End-of-turn playback: pause (ms) after each visible step, by step kind.
export const STEP_DELAYS = { phase:1000, move:260, strike:650, spawn:650, card:950, turn:600 };
// Cosmetic canvas FX durations (ms) staged during the playback.
export const FX_DURATION = { tween:200, spawn:500, hit:700, dice:1600 };
// How long the phase banner stays visible (ms) before the HUD hides it.
export const BANNER_HOLD = 1100;
export const SEED_MAX = 99999;
export const SHAKE_INITIAL = 6;
export const SHAKE_DAMPING = .8;
export const SHAKE_THRESHOLD = .4;
