# Refactor decisions

Written by `/refactor-game`. Records what the code cannot express: why this layout, why
this toolchain, what was deliberately not touched, what is still undecided.

Read by `/scaffold-claude` so it does not have to re-deduce any of it.

## Archetype

Selected: `turn-based board`
Why: grille discrète de cases, une action à la fois, aucune boucle continue
(`requestAnimationFrame` uniquement pour la secousse cosmétique), rendu réactif aux
changements d'état, enum de phase (`joueur`/`ennemis`/`tension`), légalité des actions
(`actions`), BFS d'accessibilité, ligne de vue, résolution de combat aux dés, conditions
de victoire/défaite. Le plateau vit déjà dans l'état, pas dans le DOM.
Does not fit: le rendu est un canvas 2D complet (pas un rendu DOM léger) avec une
animation transitoire de secousse ; la mécanique de deck de tension
(pioche/défausse/construction partitionnée) n'existe pas dans l'archétype → module dédié
`rules/tension.js` ; le RNG seedé (`makeRng`) existait déjà dans le prototype.

## Toolchain

Branch: `zero-build`
Triggering signal: aucun signal Vite présent — pas d'import npm, pas de TypeScript,
pas d'assets à bundler (polices Google Fonts chargées en réseau), 840 lignes < 2000.
Node: 22
Test runner: `node:test`

## Layout

| Module | Responsibility | Came from |
| --- | --- | --- | 
| `src/config.js` | tables de données (tuiles, portes, jetons, items, armes, ennemis, deck tension) et valeurs des règles | lignes 180–251 + valeurs magiques dispersées |
| `src/rules/rng.js` | générateur seedé (makeRng, rnd, rndInt, shuffle) | lignes 165–178 |
| `src/rules/plateau.js` | index des cases/portes, franchissabilité, distances de Chebyshev | lignes 253–288, 342 |
| `src/rules/deplacement.js` | BFS d'accessibilité (`distances`) et de chemin (`premierPas`) | lignes 289–316 |
| `src/rules/vue.js` | ligne de vue (Bresenham décomposé) | lignes 318–341 |
| `src/rules/sac.js` | inventaire : piles, capacité, munitions | lignes 375–389 |
| `src/rules/actions.js` | légalité : jeu d'actions possibles | lignes 392–431 |
| `src/rules/jouer.js` | application d'une action légale | lignes 433–485 |
| `src/rules/ennemis.js` | activation (poursuite, frappe) et apparition | lignes 487–522 |
| `src/rules/tension.js` | pioche et résolution des cartes tension | lignes 524–537 |
| `src/rules/tour.js` | enchaînement ennemis → tension → joueur | lignes 539–543 |
| `src/rules/journal.js` | `dit` : messages du journal | ligne 390 |
| `src/state/partie.js` | fabrique de l'état d'une partie (`creerPartie`) | lignes 344–373 |
| `src/render/canvas.js` | rendu du plateau (canvas 2D), secousse cosmétique | lignes 548–705 |
| `src/render/hud.js` | HUD DOM : fiche, sac, journal, carte tension, fin | lignes 754–811 |
| `src/input/souris.js` | survol et clic plateau → intentions | lignes 707–744 |
| `src/input/boutons.js` | boutons du bandeau → intentions | lignes 813–822 |
| `src/loop/controleur.js` | `acte` : intention → règle → rendu | lignes 746–752 |
| `src/main.js` | point d'entrée : objet `app`, seed, câblage | lignes 824–836 |

Écarts par rapport au tableau des couches du skill `rules-extraction`, actés au GATE 2 :

- `src/rules/journal.js` a été ajouté (non prévu au plan initial) : `dit` est utilisé par
  les règles, qui n'ont pas le droit d'importer `state/`.
- `src/state/partie.js` importe `rules/rng.js` et `rules/plateau.js` : la fabrique a
  besoin du RNG seedé et de `tuileDe` pour la mise en place. La flèche `state → rules`
  n'est pas prévue par le tableau, mais l'alternative (dupliquer ou déplacer la mise en
  place) aurait changé la structure du code d'origine.
- Les variables globales du prototype (`S`, `G`, `survol`, `accessibles`, `cibles`,
  `secousse`, `cv`, `ctx`) sont devenues un objet `app` créé par `main.js` et passé en
  paramètre aux fonctions de `render/`, `input/` et `loop/`. Les modules `input/`
  reçoivent leurs effets (`acte`, `maj`, `dessiner`) par injection depuis `main.js` pour
  ne pas importer `render/` ni `loop/`.

## Rules extracted

| Rule | Module | Test | Notes |
| --- | --- | --- | --- |
| RNG seedé | `src/rules/rng.js` | `tests/rng.test.js` | inchangé du prototype |
| Franchissabilité | `src/rules/plateau.js` | `tests/plateau.test.js` | portes, verrous, cas ennemi |
| Accessibilité et chemin | `src/rules/deplacement.js` | `tests/deplacement.test.js` | franchir une porte = un pas normal |
| Ligne de vue | `src/rules/vue.js` | `tests/vue.test.js` | variable morte `prec` conservée |
| Inventaire | `src/rules/sac.js` | `tests/sac.test.js` | piles et capacité |
| Légalité des actions | `src/rules/actions.js` | `tests/actions.test.js` | surcoût de dégagement |
| Application d'une action | `src/rules/jouer.js` | `tests/jouer.test.js` | dés seedés reproductibles |
| Ennemis | `src/rules/ennemis.js` | `tests/ennemis.test.js` | frappe au contact, apparition distMin |
| Tension | `src/rules/tension.js` | `tests/tension.test.js` | défaite sur deck vide |
| Fin de tour | `src/rules/tour.js` | `tests/tour.test.js` | interruption sur défaite |
| Mise en place | `src/state/partie.js` | `tests/partie.test.js` | invariants du scénario |

## Randomness and time

| Call site | Classification | Handling |
| --- | --- | --- |
| `dessiner()` — secousse d'écran (`Math.random()` ×2, translation du canvas) | cosmetic | left in render, non seedé |
| `nouvellePartie()` — tirage du seed quand l'URL n'en fournit pas | seed du point d'entrée | reste au bootstrap : seul le point d'entrée décide du seed |
| `creerPartie` — contenu des jetons, placement de `cle_pique`, shuffles du deck | rule-bearing | déjà seedé via `makeRng(seed)` → `s.rng`, conservé tel quel |
| `jouer` case `attaquer` — tirage des dés | rule-bearing | déjà seedé via `s.rng`, conservé tel quel |

Seed: `user-provided` (paramètre d'URL `?seed=N`), sinon tiré aléatoirement au bootstrap.

Aucun appel à `Date.now()` ni `performance.now()` dans le prototype : jeu au tour par
tour, aucun `dt` à injecter. L'étape de dé-randomisation n'a donc modifié aucun code de
règle — le prototype injectait déjà son RNG seedé.

Contrat de pureté, point « no mutation of its arguments » : les règles du prototype
mutent l'état `s` en place (`jouer`, `activer`, `tirerTension`, `ajouter`…). Les
réécrire en immutable serait une réécriture, pas une extraction — le comportement doit
rester identique. Décision : les règles extraites gardent la mutation de `s` ; le
déterminisme (mêmes entrées → mêmes sorties) est garanti par le RNG seedé porté par
`s.rng`.

## Deliberately left alone

Behaviour that looks wrong but was preserved, because the refactor must not change the
game. Each entry: what it is, where, and why it was not fixed.

- Le placement de `cle_pique` (`creerPartie`) peut écraser un contenu de jeton déjà
  tiré (munitions ou herbe), pas seulement un jeton `rien`. Peut-être intentionnel
  (la clé remplace le butin), le code ne le dit pas — conservé tel quel.
- La portée des armes utilise la distance de Chebyshev (`distCases`) alors que le
  déplacement utilise un BFS orthogonal : deux métriques coexistent. Conservé tel quel.
- Variable morte `prec` dans `vue()` : assignée deux fois, jamais lue. Laissée en place
  (aucune suppression, même « évidente », pendant le refactor).
- Construction partitionnée du deck de tension : les 8 premières cartes (sans le licker)
  sont shufflées à part, le licker ne peut donc pas sortir dans les 8 premières.
  Comportement conservé, intention non documentée dans le code.
- Champ `bonus` des jetons : seul le jeton de l'armurerie en reçoit un
  (`contenu:'carte'` + `bonus:'pompe'`), et `fouiller` traite `bonus` avant `contenu`.
  Mécanisme conservé tel quel.

## Open questions

Decisions the code does not settle and that were not made. Never resolved by guessing.

- La tuile `sombre` (« Chambre noire ») est enclavée dans l'anneau du Hall avec une
  seule porte (`[4,4]→[4,5]`) ; ses autres faces sont des murs implicites. La
  signification thématique (et si d'autres accès étaient prévus) n'est pas précisée.
- L'écrasement possible d'un butin par `cle_pique` (voir ci-dessus) est-il voulu ?
- D'autres jetons que celui de l'armurerie pourraient-ils porter un `bonus` ? Le code
  ne le prévoit ni ne l'interdit.
