import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerPartie } from '../src/state/partie.js';
import { tuileDe } from '../src/rules/plateau.js';

test('le même seed produit exactement la même partie', () => {
  const a = creerPartie(123), b = creerPartie(123);
  assert.deepEqual(a.jetons, b.jetons);
  assert.deepEqual(a.deck, b.deck);
});

test('la mise en place respecte les invariants du scénario', () => {
  const s = creerPartie(77);
  // L'armurerie contient toujours la carte magnétique et le fusil à pompe
  const jArm = s.jetons.find(j => tuileDe(j.c) === 'armurerie');
  assert.equal(jArm.contenu, 'carte');
  assert.equal(jArm.bonus, 'pompe');
  // La clé de pique est cachée hors de l'armurerie
  const jCle = s.jetons.find(j => j.contenu === 'cle_pique');
  assert.ok(jCle);
  assert.notEqual(tuileDe(jCle.c), 'armurerie');
  // Le licker ne sort jamais dans les 8 premières cartes
  assert.ok(!s.deck.slice(0,8).some(c => c.id === 'licker'));
  assert.equal(s.deck.length, 14);
});

test('Leon démarre au Hall avec son équipement de départ', () => {
  const s = creerPartie(5);
  assert.equal(tuileDe(s.joueur.c), 'hall');
  assert.equal(s.joueur.pv, 10);
  assert.equal(s.pa, 4);
  assert.deepEqual(s.sac, [{id:'munitions',n:4},{id:'herbe_v',n:1}]);
});
