import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distances, premierPas } from '../src/rules/deplacement.js';

test('depuis le départ, une action de déplacement atteint les cases à 2 pas au plus', () => {
  const s = { portesOuvertes: [], sac: [] };
  const d = distances(s, [3,4], false, 2);
  assert.equal(d.get('4,4'), 1);   // Hall, une case à l'est
  assert.equal(d.get('5,4'), 2);   // Hall, deux cases à l'est
  assert.equal(d.has('6,4'), false); // trois cases : hors portée
  assert.equal(d.get('4,5'), 2);   // Chambre noire : franchir la porte [4,4]→[4,5] est un pas normal
});

test('le BFS ne traverse pas les murs entre tuiles sans porte', () => {
  const s = { portesOuvertes: [], sac: [] };
  const d = distances(s, [3,4], false, 99);
  // Sans clé ni carte, l'armurerie reste inaccessible
  assert.equal(d.has('11,2'), false);
});

test('premierPas rend le chemin case par case vers la cible', () => {
  const s = { portesOuvertes: [], sac: [] };
  const chemin = premierPas(s, [3,4], [5,4], false);
  assert.deepEqual(chemin, [[4,4],[5,4]]);
});

test('premierPas rend null quand aucune route n’existe', () => {
  const s = { portesOuvertes: [], sac: [] };
  // Un ennemi ne franchit pas la porte verrouillée de l'armurerie
  assert.equal(premierPas(s, [3,4], [11,2], true), null);
});
