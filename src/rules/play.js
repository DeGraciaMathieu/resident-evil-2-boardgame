/* Applying a legal action to the state. */
import { ITEMS, WEAPONS, AMMO_PER_TOKEN, GREEN_HERB_HEAL } from '../config.js';
import { resolveAttack } from './combat.js';
import { DOOR_INDEX, doorKey, tileAt, tile, sameCell, cellDistance } from './board.js';
import { firstStep } from './movement.js';
import { lineOfSight } from './sight.js';
import { addItem, removeItem } from './bag.js';
import { say } from './log.js';

export function play(s, action){
  if (s.over) return s;
  s.ap -= action.cost||0;

  switch(action.type){
    case 'move': {
      const path = firstStep(s, s.player.c, action.to) || [];
      for (const step of path) s.player.c = step;
      const t = tileAt(s.player.c);
      if (t !== s.lastTile){ say(s, `→ ${tile(t).name}`); s.lastTile = t; }
      if (t === 'parking'){ s.over='victory'; say(s,'Vous poussez la porte. Air froid, sirènes au loin.','good'); }
      break;
    }
    case 'attack': {
      const weapon = WEAPONS[s.player.weapon];
      if (weapon.ammo) removeItem(s,'ammo',weapon.ammo);
      const targets = weapon.area
        ? s.enemies.filter(e => cellDistance(s.player.c,e.c)<=weapon.range && lineOfSight(s,s.player.c,e.c))
        : [s.enemies.find(e=>e.id===action.target)].filter(Boolean);
      s.lastRolls = []; // what the player must see rolled, one entry per target
      for (const target of targets){
        const at = [...target.c]; // dice show where the target was shot, not where it lands
        const r = resolveAttack(s, weapon, target);
        s.lastRolls.push({ dice:r.dice, c:at, id:target.id, pushed:r.pushed, dmg:r.damage });
        const faces = r.dice.map(d=>(d.color==='blue'?'B':'R')+d.face).join(' ');
        const outcome = [r.damage?`−${r.damage} PV`:'', r.pushed?'repoussé':''].filter(Boolean).join(', ');
        say(s, `${weapon.name} → ${target.name} · dés [${faces}] ${outcome||'aucun effet'}`, outcome?'good':'bad');
        if (target.hp<=0){ s.enemies=s.enemies.filter(e=>e.id!==target.id); say(s,`${target.name} s'effondre.`,'good'); }
      }
      break;
    }
    case 'search': {
      const t = s.tokens.find(x=>sameCell(x.c,s.player.c) && !x.taken);
      t.taken = true;
      if (t.bonus){ addItem(s,t.bonus); say(s,`Trouvé : ${ITEMS[t.bonus].name}.`,'good'); }
      if (t.content==='nothing') say(s,'Des tiroirs vides.','bad');
      else if (!addItem(s, t.content, t.content==='ammo'?AMMO_PER_TOKEN:1)) say(s,`${ITEMS[t.content].name} — sac plein, laissé sur place.`,'bad');
      else say(s,`Trouvé : ${ITEMS[t.content].name}.`,'good');
      break;
    }
    case 'door': {
      const d = DOOR_INDEX.get(`${action.a}|${action.b}`);
      const dk = doorKey(d);
      const i = s.openDoors.indexOf(dk);
      if (i >= 0){ s.openDoors.splice(i,1); say(s,'Vous refermez la porte.'); }
      else {
        if (d.lock && !s.unlockedDoors.includes(dk)){
          s.unlockedDoors.push(dk);
          say(s, `La ${ITEMS[d.lock].name.toLowerCase()} tourne dans la serrure.`, 'good');
        }
        s.openDoors.push(dk);
        say(s,'Vous ouvrez la porte.');
      }
      break;
    }
    case 'heal': removeItem(s,'green_herb'); s.player.hp=Math.min(s.player.maxHp,s.player.hp+GREEN_HERB_HEAL); say(s,'Herbe verte. +3 PV.','good'); break;
    case 'combine': removeItem(s,'green_herb'); removeItem(s,'red_herb'); s.player.hp=s.player.maxHp; say(s,'Verte + rouge. Santé complète.','good'); break;
    case 'weapon': s.player.weapon=action.weapon; say(s,`Arme en main : ${WEAPONS[action.weapon].name}.`); break;
    case 'end': s.ap=0; break;
  }
  // The caller checks turnOver(s) and drives endTurn / endTurnSteps itself.
  return s;
}
