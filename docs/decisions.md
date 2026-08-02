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
| `src/rules/…` | | |
| `src/state/…` | | |
| `src/render/…` | | |
| `src/input/…` | | |
| `src/loop/…` | | |

## Rules extracted

| Rule | Module | Test | Notes |
| --- | --- | --- | --- |

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
