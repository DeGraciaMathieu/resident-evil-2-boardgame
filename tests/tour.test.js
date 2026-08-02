import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finDeTour } from '../src/rules/tour.js';

const base = () => ({
  fin: null, log: [], tour: 1, pa: 0, paMax: 4, phase: 'joueur',
  joueur: { pv: 10, pvMax: 10, c: [3,4] },
  sac: [], sacMax: 6, ennemis: [], prochainId: 1, portesOuvertes: [],
  deck: [{ id:'calme', titre:'Silence', texte:'Rien.' }], defausse: [],
});

test('la fin de tour active les ennemis, tire une carte et rend la main au joueur', () => {
  const s = base();
  s.ennemis = [{ id:1, nom:'Zombie', pv:4, degats:2, vitesse:2, c:[4,4] }];
  finDeTour(s);
  assert.equal(s.joueur.pv, 8);        // le zombie au contact a frappé
  assert.equal(s.defausse.length, 1);  // une carte tension a été tirée
  assert.equal(s.tour, 2);
  assert.equal(s.pa, 4);
  assert.equal(s.phase, 'joueur');
});

test('une défaite pendant la phase ennemis interrompt le tour', () => {
  const s = base();
  s.joueur.pv = 2;
  s.ennemis = [{ id:1, nom:'Zombie', pv:4, degats:2, vitesse:2, c:[4,4] }];
  finDeTour(s);
  assert.equal(s.fin, 'defaite');
  assert.equal(s.defausse.length, 0);  // pas de carte tirée après la mort
  assert.equal(s.tour, 1);
});
