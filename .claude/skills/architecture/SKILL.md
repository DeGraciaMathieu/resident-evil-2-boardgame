---
name: architecture
description: Use when il faut situer un changement dans le code — quel module porte quelle responsabilité, qui importe qui, et où va le code neuf selon le type de modification.
auto_invoke: true
---

# Architecture

## Carte des modules

| Module | Rôle | Dépendances clés |
| --- | --- | --- |
| `index.html` | Coquille HTML/CSS (layout, styles, ids du HUD), charge `src/main.js` | — |
| `src/config.js` | Tables de données (tuiles, portes, jetons, items, armes, ennemis, deck tension) et toutes les valeurs des règles | rien |
| `src/rules/rng.js` | Générateur seedé : `makeRng`, `rnd`, `rndInt`, `shuffle` | rien |
| `src/rules/plateau.js` | Index `CASES`/`PORTE_INDEX`/`BORNES`, `cle`, `tuileDe`, `tuile`, `memeCase`, `distCases`, `passe`, `adjacentes` | config |
| `src/rules/deplacement.js` | BFS : `distances` (accessibilité), `premierPas` (chemin) | config, plateau |
| `src/rules/vue.js` | `vue` : ligne de vue (Bresenham décomposé) | config, plateau |
| `src/rules/sac.js` | `aObjet`, `ajouter`, `retirer`, `nbMunitions` | config |
| `src/rules/actions.js` | `actions(s)` : le jeu d'actions légales | config, plateau, deplacement, vue, sac |
| `src/rules/jouer.js` | `jouer(s, action)` : applique une action légale | config, rng, plateau, deplacement, vue, sac, journal, tour |
| `src/rules/ennemis.js` | `activer`, `pointApparition`, `spawn` | config, plateau, deplacement, journal |
| `src/rules/tension.js` | `tirerTension(s)` : pioche et résout une carte | config, sac, ennemis, journal |
| `src/rules/tour.js` | `finDeTour(s)` : ennemis → tension → joueur | ennemis, tension |
| `src/rules/journal.js` | `dit(s, m, t)` : pousse un message dans `s.log` | rien |
| `src/state/partie.js` | `creerPartie(seed)` : fabrique l'état complet `S` | config, rng, plateau |
| `src/render/canvas.js` | `taille`, `geometrie`, `recalculer`, `dessiner` — plateau canvas, secousse | config, plateau, actions |
| `src/render/hud.js` | `maj(app, carteTiree)` — fiche, jauges, sac, journal, carte tension, fin | config, plateau, sac, actions, canvas |
| `src/input/souris.js` | `brancherSouris(app, {acte, maj, dessiner})` — survol, clic plateau | config, rules (lecture) |
| `src/input/boutons.js` | `brancherBoutons(app, {acte})` — boutons du bandeau | rules (lecture) |
| `src/loop/controleur.js` | `acte(app, a)` : intention → `jouer` → `maj` | rules/jouer, render/hud |
| `src/main.js` | Objet `app`, seed (URL ou aléatoire), câblage, `nouvellePartie` | tout |

Les flèches d'import descendent toujours ce tableau. `input/` ne touche jamais `render/`
ni `loop/` directement : `main.js` lui injecte `acte`, `maj` et `dessiner`.

## Les deux objets d'état

- `S` (état de jeu, `creerPartie`) : `seed`, `rng`, `tour`, `pa`/`paMax`, `joueur`,
  `sac`/`sacMax`, `ennemis`, `prochainId`, `jetons`, `portesOuvertes`, `deck`/`defausse`/
  `derniereCarte`, `derniereTuile`, `phase` (`joueur`|`ennemis`|`tension`), `fin`
  (`null`|`victoire`|`defaite`), `log`.
- `app` (état applicatif, `main.js`) : `cv`, `ctx`, `S`, `G` (géométrie), `survol`,
  `accessibles`, `cibles`, `secousse`.

## Où va le code neuf, par type de changement

| Changement | Fichiers à toucher, dans l'ordre |
| --- | --- |
| Nouvelle valeur d'équilibrage (coût, portée, seuil…) | `src/config.js` (export nommé), puis la règle qui la consomme |
| Nouvelle règle ou modification d'une règle | `src/rules/<module>.js` + son test macro dans `tests/<module>.test.js` |
| Nouveau type d'action du joueur | `src/rules/actions.js` (légalité) → `src/rules/jouer.js` (résolution) → déclencheur dans `src/input/` → affichage dans `src/render/hud.js` si besoin |
| Nouvelle carte tension, arme, ennemi, item | voir le skill `regles-du-jeu` |
| Modification de la carte (tuiles, portes, jetons) | voir le skill `plateau` |
| Nouvel élément d'interface ou d'affichage | voir le skill `rendu-interface` |
| Nouveau champ d'état de jeu | `creerPartie` (`src/state/partie.js`), puis les règles concernées |
| Nouveau test | `tests/<module>.test.js`, voir le skill `testing` |
