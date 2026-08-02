import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activer, pointApparition, spawn } from '../src/rules/ennemis.js';
import { distances } from '../src/rules/deplacement.js';
import { cle } from '../src/rules/plateau.js';

const base = () => ({
  fin: null, log: [],
  joueur: { pv: 10, pvMax: 10, c: [3,4] },
  sac: [], ennemis: [], prochainId: 1, portesOuvertes: [],
});

test('un ennemi au contact frappe au lieu d’avancer', () => {
  const s = base();
  s.ennemis = [{ id:1, nom:'Zombie', pv:4, degats:2, vitesse:2, c:[4,4] }];
  activer(s);
  assert.equal(s.joueur.pv, 8);
  assert.deepEqual(s.ennemis[0].c, [4,4]);
});

test('un ennemi à distance avance de sa vitesse vers le joueur', () => {
  const s = base();
  s.ennemis = [{ id:1, nom:'Zombie', pv:4, degats:2, vitesse:2, c:[7,4] }];
  activer(s);
  assert.deepEqual(s.ennemis[0].c, [5,4]); // deux pas vers l'ouest le long du Hall
  assert.equal(s.joueur.pv, 10);
});

test('le joueur meurt quand ses PV tombent à zéro : défaite', () => {
  const s = base();
  s.joueur.pv = 2;
  s.ennemis = [{ id:1, nom:'Zombie', pv:4, degats:2, vitesse:2, c:[4,4] }];
  activer(s);
  assert.equal(s.fin, 'defaite');
});

test('l’apparition lointaine se fait à distMin ou plus du joueur', () => {
  const s = base();
  const p = pointApparition(s, 6);
  assert.ok(p, 'un point doit exister');
  const d = distances(s, s.joueur.c, true);
  assert.ok(d.get(cle(p)) >= 6);
});

test('quand aucun point n’atteint distMin, le plus éloigné est choisi', () => {
  const s = base();
  const p = pointApparition(s, 999);
  assert.ok(p, 'faute de mieux, un point est quand même rendu');
});

test('spawn place un ennemi du bon profil sur un point libre', () => {
  const s = base();
  spawn(s, 'chien', 4);
  assert.equal(s.ennemis.length, 1);
  const e = s.ennemis[0];
  assert.equal(e.nom, 'Chien');
  assert.equal(e.pv, 3);
  assert.equal(e.vitesse, 4);
  assert.equal(s.prochainId, 2);
});
