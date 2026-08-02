import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jouer } from '../src/rules/jouer.js';
import { makeRng } from '../src/rules/rng.js';

const base = () => ({
  fin: null, log: [], tour: 1, pa: 4, paMax: 4, phase: 'joueur',
  rng: makeRng(1), derniereTuile: 'hall',
  joueur: { pv: 10, pvMax: 10, c: [3,4], arme: 'pistolet' },
  sac: [{id:'munitions',n:4}], sacMax: 6,
  ennemis: [], prochainId: 1, jetons: [], portesOuvertes: [],
  deck: [{ id:'calme', titre:'Silence', texte:'Rien.' }], defausse: [],
});

test('se déplacer suit le chemin et débite le coût en PA', () => {
  const s = base();
  jouer(s, { type:'deplacer', vers:[5,4], cout:1 });
  assert.deepEqual(s.joueur.c, [5,4]);
  assert.equal(s.pa, 3);
});

test('traverser une porte verrouillée avec la clé la déverrouille durablement', () => {
  const s = base();
  s.sac.push({id:'cle_pique',n:1});
  s.joueur.c = [10,3];
  jouer(s, { type:'deplacer', vers:[10,4], cout:1 });
  assert.ok(s.portesOuvertes.includes('10,3|10,4'));
});

test('atteindre la sortie parking gagne la partie', () => {
  const s = base();
  s.joueur.c = [13,8];
  s.portesOuvertes = ['13,8|13,9'];
  jouer(s, { type:'deplacer', vers:[13,9], cout:1 });
  assert.equal(s.fin, 'victoire');
});

test('attaquer consomme une munition et inflige les dés seedés', () => {
  const s = base();
  s.ennemis = [{ id:1, type:'zombie', nom:'Zombie', pv:4, degats:2, vitesse:2, c:[5,4] }];
  jouer(s, { type:'attaquer', cible:1, cout:1 });
  assert.equal(s.sac[0].n, 3);
  const rejeu = base();
  rejeu.ennemis = [{ id:1, type:'zombie', nom:'Zombie', pv:4, degats:2, vitesse:2, c:[5,4] }];
  jouer(rejeu, { type:'attaquer', cible:1, cout:1 });
  // même seed → mêmes dés → mêmes dégâts
  assert.deepEqual(s.ennemis.map(e=>e.pv), rejeu.ennemis.map(e=>e.pv));
});

test('fouiller ramasse le contenu du jeton, une seule fois', () => {
  const s = base();
  s.jetons = [{ c:[3,4], type:'A', contenu:'herbe_v' }];
  jouer(s, { type:'fouiller', cout:1 });
  assert.ok(s.sac.some(i=>i.id==='herbe_v'));
  assert.equal(s.jetons[0].pris, true);
});

test('épuiser ses PA déclenche la fin de tour', () => {
  const s = base();
  s.pa = 1;
  jouer(s, { type:'deplacer', vers:[4,4], cout:1 });
  assert.equal(s.tour, 2);
  assert.equal(s.pa, s.paMax);
  assert.equal(s.phase, 'joueur');
});
