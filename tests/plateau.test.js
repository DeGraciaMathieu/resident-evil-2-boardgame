import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passe, tuileDe } from '../src/rules/plateau.js';

test('on circule librement entre deux cases de la même tuile', () => {
  const s = { portesOuvertes: [], sac: [] };
  // [3,4] et [4,4] sont toutes deux dans le Hall principal
  assert.equal(passe(s, [3,4], [4,4]), true);
});

test('un mur entre deux tuiles sans porte bloque le passage', () => {
  const s = { portesOuvertes: [], sac: [] };
  // [5,4] (Hall) touche [5,5] (Chambre noire) mais aucune porte ne les relie
  assert.notEqual(tuileDe([5,4]), tuileDe([5,5]));
  assert.equal(passe(s, [5,4], [5,5]), false);
});

test('une porte verrouillée passe avec la clé, jamais pour un ennemi', () => {
  const porte = [[10,3],[10,4]]; // verrou : cle_pique
  const sans = { portesOuvertes: [], sac: [] };
  const avec = { portesOuvertes: [], sac: [{id:'cle_pique',n:1}] };
  assert.equal(passe(sans, ...porte), false);
  assert.equal(passe(avec, ...porte), true);
  assert.equal(passe(avec, ...porte, true), false); // l'ennemi n'a pas la clé
});

test('une porte déverrouillée reste ouverte pour tout le monde', () => {
  const s = { portesOuvertes: ['10,3|10,4'], sac: [] };
  assert.equal(passe(s, [10,3], [10,4], true), true);
});
