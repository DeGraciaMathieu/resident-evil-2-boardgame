import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vue } from '../src/rules/vue.js';

test('la ligne de vue porte le long d’une même tuile', () => {
  const s = { portesOuvertes: [], sac: [] };
  // Le couloir nord est une bande droite de 5 cases
  assert.equal(vue(s, [7,0], [11,0]), true);
});

test('un mur sans porte coupe la ligne de vue', () => {
  const s = { portesOuvertes: [], sac: [] };
  // [5,4] (Hall) et [5,5] (Chambre noire) se touchent sans porte
  assert.equal(vue(s, [5,4], [5,5]), false);
});

test('une porte fermée à clé coupe la ligne de vue sans la clé', () => {
  const sans = { portesOuvertes: [], sac: [] };
  const avec = { portesOuvertes: [], sac: [{id:'cle_pique',n:1}] };
  assert.equal(vue(sans, [10,3], [10,4]), false);
  assert.equal(vue(avec, [10,3], [10,4]), true);
});
