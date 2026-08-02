import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tirerTension } from '../src/rules/tension.js';

const base = () => ({
  fin: null, log: [],
  joueur: { pv: 8, pvMax: 10, c: [3,4] },
  sac: [], sacMax: 6, ennemis: [], prochainId: 1, portesOuvertes: [],
  deck: [], defausse: [], derniereCarte: undefined,
});

test('piocher dans un deck vide fait perdre la partie', () => {
  const s = base();
  tirerTension(s);
  assert.equal(s.fin, 'defaite');
});

test('la carte tirée passe du deck à la défausse', () => {
  const s = base();
  s.deck = [{ id:'calme', titre:'Silence', texte:'Rien.' }];
  tirerTension(s);
  assert.equal(s.deck.length, 0);
  assert.equal(s.defausse.length, 1);
  assert.equal(s.derniereCarte.id, 'calme');
});

test('« Ils arrivent » fait apparaître un zombie', () => {
  const s = base();
  s.deck = [{ id:'approche', titre:'Ils arrivent', texte:'…' }];
  tirerTension(s);
  assert.equal(s.ennemis.length, 1);
  assert.equal(s.ennemis[0].type, 'zombie');
});

test('« Reprendre souffle » rend un point de vie sans dépasser le maximum', () => {
  const s = base();
  s.deck = [{ id:'souffle', titre:'Reprendre souffle', texte:'…' }];
  tirerTension(s);
  assert.equal(s.joueur.pv, 9);
  s.deck = [{ id:'souffle', titre:'Reprendre souffle', texte:'…' }];
  s.joueur.pv = 10;
  tirerTension(s);
  assert.equal(s.joueur.pv, 10);
});

test('« Fouille rapide » donne deux munitions', () => {
  const s = base();
  s.deck = [{ id:'trouvaille', titre:'Fouille rapide', texte:'…' }];
  tirerTension(s);
  assert.deepEqual(s.sac, [{id:'munitions',n:2}]);
});
