/* HUD — fiche joueur, sac, journal, carte tension, écran de fin. */
import { ITEMS, ARMES, JOURNAL_MAX, DECK_CRITIQUE, DELAI_FLIP_CARTE } from '../config.js';
import { tuileDe, tuile } from '../rules/plateau.js';
import { nbMunitions } from '../rules/sac.js';
import { actions } from '../rules/actions.js';
import { recalculer, dessiner } from './canvas.js';

const ICONES = { munitions:'▮', herbe_v:'❦', herbe_r:'❧', cle_pique:'♠', carte:'▤', pompe:'⌐' };

export function maj(app, carteTiree=false){
  const S = app.S;
  const j=S.joueur, arme=ARMES[j.arme], el=id=>document.getElementById(id);
  recalculer(app);
  el('mTour').textContent=S.tour;
  el('arme').textContent=arme.nom;
  el('des').textContent=arme.des+' / '+arme.portee+(arme.zone?' zone':'');
  el('mun').textContent=nbMunitions(S);
  el('lieu').textContent=tuile(tuileDe(j.c)).nom;

  const pv=el('pv'); pv.innerHTML='';
  for(let i=0;i<j.pvMax;i++){ const b=document.createElement('i'); if(i<j.pv) b.className=j.pv<=3?'on bas':'on'; pv.appendChild(b); }
  const pa=el('pa'); pa.innerHTML='';
  for(let i=0;i<S.paMax;i++){ const b=document.createElement('i'); if(i<S.pa) b.className='on'; pa.appendChild(b); }

  const sac=el('sac'); sac.innerHTML='';
  for(let i=0;i<S.sacMax;i++){
    const it=S.sac[i], d=document.createElement('div');
    d.className='slot'+(it?' plein':'')+(it&&ITEMS[it.id].cle?' cle':'');
    if(it) d.innerHTML=`<span class="ic">${ICONES[it.id]||'?'}</span><span class="nm">${ITEMS[it.id].nom}</span>`+(it.n>1?`<span class="n">×${it.n}</span>`:'');
    sac.appendChild(d);
  }

  const acts=actions(S);
  el('bFouiller').disabled=!acts.some(a=>a.type==='fouiller');
  el('bSoin').disabled=!acts.some(a=>a.type==='soigner');
  el('bComb').disabled=!acts.some(a=>a.type==='combiner');
  el('bArme').disabled=!acts.some(a=>a.type==='arme');
  el('bFin').disabled=!!S.fin;

  const jn=el('journal');
  jn.innerHTML=S.log.slice(-JOURNAL_MAX).map(l=>`<p class="${l.t||''}">${l.m}</p>`).join('');
  jn.scrollTop=jn.scrollHeight;

  const rest=el('restant');
  rest.innerHTML='reste <b>'+S.deck.length+'</b> cartes';
  rest.classList.toggle('critique', S.deck.length<=DECK_CRITIQUE);

  if (carteTiree && S.derniereCarte){
    const c=el('carte'); c.classList.add('flip');
    setTimeout(()=>{
      el('cTitre').textContent=S.derniereCarte.titre;
      el('cTexte').textContent=S.derniereCarte.texte;
      el('cNum').textContent='carte '+S.defausse.length;
      c.classList.remove('flip');
    },DELAI_FLIP_CARTE);
  }

  dessiner(app);

  const fin=el('fin');
  if (S.fin){
    fin.className='on '+(S.fin==='victoire'?'gagne':'perdu');
    el('finT').textContent=S.fin==='victoire'?'Sorti':'Terminé';
    el('finP').textContent = S.fin==='victoire'
      ? `Parking atteint au tour ${S.tour}, ${S.joueur.pv} PV restants.`
      : S.joueur.pv<=0 ? 'Le RPD garde ses agents.' : 'La pioche de tension est vide. Le bâtiment est perdu.';
  } else fin.className='';
}
