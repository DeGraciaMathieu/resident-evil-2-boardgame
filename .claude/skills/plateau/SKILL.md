---
name: plateau
description: Use when une demande touche la carte — tuiles, portes, verrous, cases, points d'apparition, jetons de fouille, distances, accessibilité ou ligne de vue — pour modifier la topologie sans casser les index dérivés.
auto_invoke: true
---

# Plateau

La carte est déclarée en données dans `src/config.js` et indexée une fois pour toutes
dans `src/rules/plateau.js`. Une case est un couple `[x, y]` ; sa clé sérialisée est
`"x,y"` (`cle(c)`).

## Concept → implémentation

| Concept | Donnée / fonction | Fichier |
| --- | --- | --- |
| Tuile (union de rectangles `[x, y, largeur, hauteur]`) | `TUILES` | `src/config.js` |
| Porte entre deux cases adjacentes de deux tuiles | `PORTES` (`{a, b, verrou}`) | `src/config.js` |
| Verrous | `verrou: 'cle_pique'` ou `'carte'` (ids d'`ITEMS`) | `src/config.js` |
| Points d'apparition des ennemis | `APPARITIONS` | `src/config.js` |
| Jetons de fouille (position, type A/B) | `JETONS` | `src/config.js` |
| Index case → tuile | `CASES` (Map, construite au chargement) | `src/rules/plateau.js` |
| Index arête → porte | `PORTE_INDEX` (Map, les deux sens) | `src/rules/plateau.js` |
| Dimensions de la grille | `BORNES` (`{w, h}`, dérivées de `CASES`) | `src/rules/plateau.js` |
| Franchissabilité d'une arête | `passe(s, a, b, pourEnnemi)` | `src/rules/plateau.js` |
| Portes déverrouillées en cours de partie | `s.portesOuvertes` (clés `"x,y\|x2,y2"`) | état `S` |
| Cases atteignables (BFS borné) | `distances(s, depart, pourEnnemi, max)` | `src/rules/deplacement.js` |
| Chemin case par case | `premierPas(s, depuis, but, pourEnnemi)` | `src/rules/deplacement.js` |
| Ligne de vue | `vue(s, a, b)` | `src/rules/vue.js` |
| Distance de Chebyshev (portée des armes) | `distCases(a, b)` | `src/rules/plateau.js` |
| Portée d'une action de déplacement | `PORTEE_DEPLACEMENT` (2 cases) | `src/config.js` |
| Couleurs des tuiles à l'écran | `TEINTES` | `src/render/canvas.js` |

## Règles de la topologie (déduites du code)

- Deux cases d'une **même tuile** communiquent toujours ; entre **deux tuiles**, il faut
  une entrée dans `PORTES`, sinon c'est un mur — même si les cases se touchent (c'est ce
  qui enclave la Chambre noire, cf. `docs/decisions.md`).
- Une porte verrouillée passe si elle est dans `s.portesOuvertes`, sinon si le **joueur**
  a l'objet `verrou` dans son sac ; un **ennemi** (`pourEnnemi=true`) ne la franchit
  jamais tant qu'elle n'est pas ouverte.
- Franchir une porte est un pas normal (aucun surcoût).
- Deux métriques coexistent volontairement : BFS orthogonal pour le déplacement,
  Chebyshev pour la portée des armes.

## Modifier la carte

1. `src/config.js` : éditer `TUILES` / `PORTES` / `APPARITIONS` / `JETONS`. Les index
   (`CASES`, `PORTE_INDEX`, `BORNES`) et le rendu se recalculent seuls — ne jamais les
   éditer à la main.
2. Vérifier les invariants que `creerPartie` (`src/state/partie.js`) suppose : il existe
   un jeton sur la tuile `armurerie` (il reçoit `carte` + `pompe`) et au moins un jeton
   hors armurerie (pour cacher `cle_pique`). La victoire est codée sur l'id de tuile
   `parking` dans `src/rules/jouer.js`.
3. Nouvelle tuile : ajouter sa couleur dans `TEINTES` (`src/render/canvas.js`), sinon
   elle prend `_defaut`.
4. Adapter/ajouter les tests qui citent des coordonnées réelles
   (`tests/plateau.test.js`, `tests/deplacement.test.js`, `tests/vue.test.js` utilisent
   le Hall `[3,4]`, la porte verrouillée `[10,3]→[10,4]`, la Chambre noire…).
5. `npm test` vert, puis vérification visuelle en jeu (`npm run dev`).
