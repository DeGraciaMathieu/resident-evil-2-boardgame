---
name: regles-du-jeu
description: Use when une demande touche les règles du jeu — actions du joueur, combat, ennemis, cartes tension, tours, points de vie, sac, victoire/défaite — pour trouver la fonction qui porte chaque concept et suivre la bonne procédure d'ajout.
auto_invoke: true
---

# Règles du jeu

Toutes les règles sont des fonctions de `src/rules/` : elles prennent l'état `s`, le
mutent en place, et n'accèdent jamais au DOM ni à `Math.random` (l'aléatoire passe par
`s.rng`, seedé — même seed, même partie).

## Concept → implémentation

| Concept du jeu | Fonction | Fichier |
| --- | --- | --- |
| Actions légales d'un état | `actions(s)` → `[{type, cout, …}]` | `src/rules/actions.js` |
| Résoudre une action | `jouer(s, action)` | `src/rules/jouer.js` |
| Types d'action | `deplacer`, `attaquer`, `fouiller`, `soigner`, `combiner`, `arme`, `finir` | `actions.js` + `jouer.js` |
| Coût de déplacement (1, ou 2 si engagé au contact) | `COUT_DEPLACEMENT`, `COUT_DEPLACEMENT_ENGAGE` | `src/config.js`, lu par `actions` |
| Jet de dés d'attaque | `DE[rndInt(s.rng, DE.length)]` × `arme.des` | `src/rules/jouer.js`, case `attaquer` |
| Profils d'armes (dés, portée, munitions, zone) | `ARMES` | `src/config.js` |
| Profils d'ennemis (PV, dégâts, vitesse) | `ENNEMIS` | `src/config.js` |
| Activation des ennemis (poursuite, frappe au contact) | `activer(s, bonus)` | `src/rules/ennemis.js` |
| Point d'apparition (le plus proche ≥ distMin) | `pointApparition(s, distMin)`, `spawn(s, type, distMin)` | `src/rules/ennemis.js` |
| Pioche et effet d'une carte tension | `tirerTension(s)` (switch sur `c.id`) | `src/rules/tension.js` |
| Composition du deck (14 cartes, licker jamais dans les 8 premières) | `TENSION`, `DECK_COUPE` + construction dans `creerPartie` | `src/config.js`, `src/state/partie.js` |
| Fin de tour (phases ennemis → tension → joueur) | `finDeTour(s)` | `src/rules/tour.js` |
| Sac : piles, capacité | `ajouter`, `retirer`, `aObjet`, `nbMunitions` | `src/rules/sac.js` |
| Soins (herbe verte +3, verte+rouge = complet) | cases `soigner`/`combiner` de `jouer` ; `SOIN_HERBE_VERTE` | `src/rules/jouer.js`, `src/config.js` |
| Victoire (atteindre `parking`) | case `deplacer` de `jouer` | `src/rules/jouer.js` |
| Défaites (PV ≤ 0, deck vide) | `activer` ; `tirerTension` | `src/rules/ennemis.js`, `src/rules/tension.js` |
| Messages du journal | `dit(s, message, type)` — types `info`/`bien`/`mal`/`tension`/`sys` | `src/rules/journal.js` |
| Mise en place d'une partie | `creerPartie(seed)` | `src/state/partie.js` |

## Ajouter une carte tension

1. `src/config.js` : ajouter la carte à `TENSION` (`{id, titre, texte}`) ; si elle a une
   valeur (distance, soin…), l'exporter en constante nommée. Attention à `DECK_COUPE` :
   les 8 premières cartes du tableau filtré sont shufflées à part.
2. `src/rules/tension.js` : ajouter le `case '<id>'` dans le switch de `tirerTension`.
3. `tests/tension.test.js` : un test macro sur l'effet de la carte.
4. `npm test` vert, puis vérifier en jeu (`npm run dev`).

## Ajouter une arme / un ennemi / un item

1. `src/config.js` : ajouter l'entrée dans `ARMES` / `ENNEMIS` / `ITEMS` (pour un item :
   `nom`, `pile`, éventuellement `cle:true`).
2. Arme : le cycle du bouton « Changer d'arme » est codé en dur
   (`['couteau','pistolet','pompe']`) dans `src/rules/actions.js` **et**
   `src/input/boutons.js` — mettre les deux à jour.
3. Ennemi : sa forme dessinée est un ternaire sur `e.type` dans `src/render/canvas.js`
   (section « ennemis ») ; item : son glyphe est dans `ICONES` (`src/render/hud.js`).
4. Test macro dans le fichier de la règle concernée, `npm test`, vérification en jeu.

## Ajouter un type d'action du joueur

1. `src/rules/actions.js` : la condition de légalité (pousse `{type, cout}` dans `out`).
2. `src/rules/jouer.js` : le `case` de résolution.
3. `src/input/boutons.js` ou `src/input/souris.js` : le déclencheur, qui appelle
   `acte(app, actions(app.S).find(…))`.
4. `src/render/hud.js` : l'état `disabled` du bouton si c'en est un.
5. Tests : légalité dans `tests/actions.test.js`, résolution dans `tests/jouer.test.js`.

## Garde-fous

- Ne jamais appeler `Math.random` dans une règle : `rndInt(s.rng, n)`.
- Toute valeur chiffrée nouvelle → export nommé de `src/config.js`.
- Les comportements listés dans « Deliberately left alone » de `docs/decisions.md`
  (écrasement possible d'un butin par `cle_pique`, portée Chebyshev vs BFS, deck
  partitionné…) sont voulus tels quels : ne pas les « corriger » sans décision explicite.
