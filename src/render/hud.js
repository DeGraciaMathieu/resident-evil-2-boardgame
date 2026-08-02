/* HUD — player sheet, bag, log, tension card, game-over screen. */
import { ITEMS, WEAPONS, LOG_MAX, DECK_CRITICAL, CARD_FLIP_DELAY, BANNER_HOLD } from '../config.js';
import { tileAt, tile } from '../rules/board.js';
import { ammoCount } from '../rules/bag.js';
import { actions } from '../rules/actions.js';
import { recompute, draw } from './canvas.js';

const ICONS = { ammo:'▮', green_herb:'❦', red_herb:'❧', spade_key:'♠', keycard:'▤', shotgun:'⌐' };
const PHASE_LABELS = { player:'À vous', enemies:'Les ennemis agissent', tension:'Tension' };

// Transient phase banner over the board. Shown by class toggle and hidden on a
// JS timer so it stays readable when prefers-reduced-motion disables animations.
let bannerTimer;
export function banner(text, tone=''){
  const b = document.getElementById('banner');
  document.getElementById('bannerText').textContent = text;
  b.className = 'show'+(tone?' '+tone:'');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(()=>b.classList.remove('show'), BANNER_HOLD);
}

export function refresh(app, cardDrawn=false){
  const S = app.S;
  const p=S.player, weapon=WEAPONS[p.weapon], el=id=>document.getElementById(id);
  recompute(app);
  el('turnNo').textContent=S.turn;
  el('phase').textContent=PHASE_LABELS[S.phase];
  el('phase').classList.toggle('busy', S.phase!=='player');
  el('weapon').textContent=weapon.name;
  const profile=[weapon.dice.blue&&`${weapon.dice.blue}B`, weapon.dice.red&&`${weapon.dice.red}R`].filter(Boolean).join('+');
  el('dice').textContent=profile+' / '+weapon.range+(weapon.area?' zone':'');
  el('ammo').textContent=ammoCount(S);
  el('location').textContent=tile(tileAt(p.c)).name;

  const hp=el('hp'); hp.innerHTML='';
  for(let i=0;i<p.maxHp;i++){ const b=document.createElement('i'); if(i<p.hp) b.className=p.hp<=3?'on low':'on'; hp.appendChild(b); }
  const ap=el('ap'); ap.innerHTML='';
  for(let i=0;i<S.maxAp;i++){ const b=document.createElement('i'); if(i<S.ap) b.className='on'; ap.appendChild(b); }

  const bag=el('bag'); bag.innerHTML='';
  for(let i=0;i<S.bagMax;i++){
    const it=S.bag[i], d=document.createElement('div');
    d.className='slot'+(it?' full':'')+(it&&ITEMS[it.id].key?' key':'');
    if(it) d.innerHTML=`<span class="ic">${ICONS[it.id]||'?'}</span><span class="nm">${ITEMS[it.id].name}</span>`+(it.n>1?`<span class="n">×${it.n}</span>`:'');
    bag.appendChild(d);
  }

  const acts=actions(S);
  const doorAction = acts.find(a=>a.type==='door');
  const bd = el('btnDoor');
  bd.disabled = !doorAction;
  bd.textContent = doorAction ? (doorAction.opens ? 'Ouvrir la porte' : 'Fermer la porte') : 'Porte';
  el('btnSearch').disabled=!acts.some(a=>a.type==='search');
  el('btnHeal').disabled=!acts.some(a=>a.type==='heal');
  el('btnCombine').disabled=!acts.some(a=>a.type==='combine');
  el('btnWeapon').disabled=!acts.some(a=>a.type==='weapon');
  el('btnEndTurn').disabled=!!S.over || S.phase!=='player';

  const lg=el('log');
  lg.innerHTML=S.log.slice(-LOG_MAX).map(l=>`<p class="${l.t||''}">${l.m}</p>`).join('');
  lg.scrollTop=lg.scrollHeight;

  const rest=el('remaining');
  rest.innerHTML='reste <b>'+S.deck.length+'</b> cartes';
  rest.classList.toggle('critical', S.deck.length<=DECK_CRITICAL);

  if (cardDrawn && S.lastCard){
    const c=el('card'); c.classList.add('flip');
    const dk=el('deck'); dk.classList.remove('pull'); void dk.offsetWidth; dk.classList.add('pull');
    setTimeout(()=>{
      el('cardTitle').textContent=S.lastCard.title;
      el('cardText').textContent=S.lastCard.text;
      el('cardNum').textContent='carte '+S.discard.length;
      c.classList.remove('flip');
    },CARD_FLIP_DELAY);
  }

  draw(app);

  const over=el('gameOver');
  if (S.over){
    over.className='on '+(S.over==='victory'?'won':'lost');
    el('gameOverTitle').textContent=S.over==='victory'?'Sorti':'Terminé';
    el('gameOverText').textContent = S.over==='victory'
      ? `Parking atteint au tour ${S.turn}, ${S.player.hp} PV restants.`
      : S.player.hp<=0 ? 'Le RPD garde ses agents.' : 'La pioche de tension est vide. Le bâtiment est perdu.';
  } else over.className='';
}
