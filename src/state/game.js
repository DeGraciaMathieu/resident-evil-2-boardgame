/* Factory of a game's state. The whole game state lives in this object. */
import {
  TOKENS, TENSION,
  PLAYER_NAME, MAX_HP, MAX_AP, START_CELL, START_WEAPON, BAG_MAX, START_BAG,
  TOKEN_POOL_A, DECK_SPLIT,
} from '../config.js';
import { makeRng, rndInt, shuffle } from '../rules/rng.js';
import { tileAt } from '../rules/board.js';

export function createGame(seed){
  const rng = makeRng(seed);

  const tokens = TOKENS.map(t => ({
    c: t.c, type: t.type,
    content: t.type==='B' ? 'red_herb' : TOKEN_POOL_A[rndInt(rng,TOKEN_POOL_A.length)],
  }));
  // The armory is locked: it always holds the keycard + the shotgun.
  const armoryToken = tokens.find(t => tileAt(t.c)==='armory');
  armoryToken.content = 'keycard'; armoryToken.bonus = 'shotgun';
  // The spade key is hidden under a token reachable without any key.
  const free = tokens.filter(t => tileAt(t.c)!=='armory');
  free[rndInt(rng,free.length)].content = 'spade_key';

  const base = TENSION.filter(c=>c.id!=='licker');
  const licker = TENSION.find(c=>c.id==='licker');
  const deck = [...shuffle(rng, base.slice(0,DECK_SPLIT)), ...shuffle(rng,[...base.slice(DECK_SPLIT), licker])];

  return {
    seed, rng, turn:1, ap:MAX_AP, maxAp:MAX_AP,
    player:{ name:PLAYER_NAME, hp:MAX_HP, maxHp:MAX_HP, c:[...START_CELL], weapon:START_WEAPON },
    bag:START_BAG.map(i=>({...i})), bagMax:BAG_MAX,
    enemies:[], nextId:1,
    tokens, openDoors:[], unlockedDoors:[], lastRolls:[], deck, discard:[],
    phase:'player', over:null,
    log:[{t:'sys', m:'Hall principal. La sortie parking est condamnée par un lecteur de badge.'}],
  };
}
