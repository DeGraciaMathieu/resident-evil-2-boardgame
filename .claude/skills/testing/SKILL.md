---
name: testing
description: Use when il faut écrire, adapter ou lancer des tests — pour savoir quel fichier couvre quoi, comment construire un état de test et quelle philosophie suivre.
auto_invoke: true
---

# Tests

## Commande

- `npm test` — `node --test` (Node ≥ 22), zéro dépendance. Découvre `tests/*.test.js`.
- `npm run test:watch` — en continu.
- Imports : `node:test` et `node:assert/strict`.

## Philosophie

Des **tests macro** : chaque test affirme un comportement qu'un joueur constate, dans le
vocabulaire du jeu (« se dégager du contact d'un ennemi coûte deux actions »), jamais un
détail d'implémentation (« le tableau interne a 3 éléments »). Un ou deux tests par
règle : le cas nominal et le cas limite qui justifie la règle. La couverture en
pourcentage n'est pas un objectif.

L'état de test se construit en **littéral explicite**, petit et local (voir les
fabriques `base()` en tête de `tests/actions.test.js`, `tests/jouer.test.js`…), jamais
via un helper partagé qui cache la mise en place. Le déterminisme vient de
`makeRng(seed)` : même seed, mêmes dés.

## Fichier → portée couverte

| Fichier | Couvre | Exemples d'assertions |
| --- | --- | --- |
| `tests/rng.test.js` | `src/rules/rng.js` | même seed → même séquence ; shuffle = permutation sans mutation |
| `tests/plateau.test.js` | `src/rules/plateau.js` | circulation intra-tuile ; mur sans porte ; verrous (joueur/ennemi) |
| `tests/deplacement.test.js` | `src/rules/deplacement.js` | portée de déplacement ; porte = pas normal ; absence de route |
| `tests/vue.test.js` | `src/rules/vue.js` | vue le long d'un couloir ; coupée par mur ou porte fermée |
| `tests/sac.test.js` | `src/rules/sac.js` | empilement ; refus sur sac plein ; libération du slot |
| `tests/actions.test.js` | `src/rules/actions.js` | rien hors phase joueur ; surcoût de dégagement ; conditions d'attaque |
| `tests/jouer.test.js` | `src/rules/jouer.js` | coût en PA ; déverrouillage durable ; victoire parking ; dés seedés |
| `tests/ennemis.test.js` | `src/rules/ennemis.js` | frappe au contact ; poursuite ; défaite à 0 PV ; distMin d'apparition |
| `tests/tension.test.js` | `src/rules/tension.js` | défaite sur deck vide ; effets des cartes ; pioche → défausse |
| `tests/tour.test.js` | `src/rules/tour.js` | enchaînement des phases ; interruption sur défaite |
| `tests/partie.test.js` | `src/state/partie.js` | déterminisme par seed ; invariants de mise en place |

Aucun test n'importe `render/`, `input/`, `loop/` ni `main.js` : ces couches se
vérifient en jouant (`npm run dev`).

## Où mettre un nouveau test

1. Règle existante modifiée → compléter le `tests/<module>.test.js` correspondant.
2. Nouveau module de règles `src/rules/x.js` → créer `tests/x.test.js` (même nom).
3. Le test cite des cases réelles du plateau (Hall `[3,4]`, porte `[10,3]→[10,4]`…) :
   s'appuyer sur `src/config.js` pour choisir des coordonnées vraies, et sur les tests
   existants comme modèles.
4. Toujours finir par `npm test` complet — jamais un seul fichier — avant de conclure.
