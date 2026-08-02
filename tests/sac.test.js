import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ajouter, retirer, nbMunitions } from '../src/rules/sac.js';

test('les munitions s’empilent sur le même slot jusqu’à la taille de pile', () => {
  const s = { sac: [{id:'munitions',n:4}], sacMax: 6 };
  assert.equal(ajouter(s, 'munitions', 2), true);
  assert.deepEqual(s.sac, [{id:'munitions',n:6}]);
  assert.equal(nbMunitions(s), 6);
});

test('un sac plein refuse un nouvel objet, sans le perdre en silence', () => {
  const s = { sac: [
    {id:'munitions',n:8},{id:'herbe_v',n:1},{id:'herbe_r',n:1},
    {id:'cle_pique',n:1},{id:'carte',n:1},{id:'pompe',n:1},
  ], sacMax: 6 };
  assert.equal(ajouter(s, 'herbe_v'), false);
  assert.equal(s.sac.length, 6);
});

test('retirer la dernière unité libère le slot', () => {
  const s = { sac: [{id:'herbe_v',n:1}], sacMax: 6 };
  assert.equal(retirer(s, 'herbe_v'), true);
  assert.deepEqual(s.sac, []);
  assert.equal(retirer(s, 'herbe_v'), false);
});
