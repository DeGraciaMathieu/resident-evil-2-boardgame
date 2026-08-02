import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actions } from '../src/rules/actions.js';

const base = () => ({
  pa: 4, phase: 'joueur', fin: null,
  joueur: { pv: 10, pvMax: 10, c: [3,4], arme: 'pistolet' },
  sac: [{id:'munitions',n:4}], sacMax: 6,
  ennemis: [], jetons: [], portesOuvertes: [],
});

test('hors de la phase joueur ou partie finie, aucune action n’est possible', () => {
  assert.deepEqual(actions({ ...base(), phase: 'ennemis' }), []);
  assert.deepEqual(actions({ ...base(), fin: 'defaite' }), []);
});

test('fouiller n’est proposé que sur un jeton non encore pris', () => {
  const s = base();
  s.jetons = [{ c:[3,4], type:'A', contenu:'munitions' }];
  assert.ok(actions(s).some(a => a.type === 'fouiller'));
  s.jetons[0].pris = true;
  assert.ok(!actions(s).some(a => a.type === 'fouiller'));
});

test('se dégager du contact d’un ennemi coûte deux actions', () => {
  const s = base();
  s.ennemis = [{ id:1, c:[4,4], pv:4 }];
  const dep = actions(s).find(a => a.type === 'deplacer');
  assert.equal(dep.cout, 2);
  assert.equal(dep.degage, true);
});

test('attaquer exige des munitions et une cible en vue à portée', () => {
  const s = base();
  s.ennemis = [{ id:1, c:[5,4], pv:4 }]; // à 2 cases, en vue, portée pistolet 5
  assert.ok(actions(s).some(a => a.type === 'attaquer' && a.cible === 1));
  s.sac = []; // chargeur vide
  assert.ok(!actions(s).some(a => a.type === 'attaquer'));
});

test('changer d’arme ne propose le fusil à pompe que s’il est dans le sac', () => {
  const s = base();
  assert.ok(!actions(s).some(a => a.type === 'arme' && a.arme === 'pompe'));
  s.sac.push({id:'pompe',n:1});
  assert.ok(actions(s).some(a => a.type === 'arme' && a.arme === 'pompe'));
});
