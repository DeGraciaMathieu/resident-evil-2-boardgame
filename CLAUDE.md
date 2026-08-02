# RPD — Rez-de-chaussée

Jeu de plateau solo au tour par tour inspiré de Resident Evil 2 : Leon traverse le
rez-de-chaussée du commissariat et doit atteindre la sortie parking avant l'épuisement
de la pioche de tension.

## Stack et commandes

- JavaScript vanilla, modules ESM natifs, **zéro dépendance** (ni runtime ni dev).
- Rendu : Canvas 2D (plateau) + DOM (HUD). Node ≥ 22 pour les tests.
- `npm run dev` — sert le dossier par HTTP (obligatoire : les modules ESM ne se chargent
  pas en `file://`, le double-clic sur `index.html` ne fonctionne pas).
- `npm test` — suite `node --test` (tests dans `tests/*.test.js`).
- `npm run test:watch` — la même en continu.
- Pas de lint ni de formateur : c'est un choix, ne pas en ajouter sans demande explicite.
- Une partie se rejoue à l'identique avec `?seed=N` dans l'URL.

## Conventions non négociables

- **Aucun accès à `document`, `window`, `canvas` dans `src/rules/`** — ni en lecture ni
  en écriture. Une règle prend l'état `s`, décide, et c'est tout.
- **Aucun `Math.random()`, `Date.now()`, `performance.now()` dans `src/rules/`.**
  L'aléatoire des règles passe exclusivement par `s.rng` (générateur seedé de
  `src/rules/rng.js`). Seules exceptions, documentées dans `docs/decisions.md` : la
  secousse cosmétique dans `src/render/canvas.js` et le tirage du seed dans `src/main.js`.
- **Aucune valeur magique hors de `src/config.js`** : toute valeur de règle (coût,
  portée, dégât, distance, seuil, délai) est un export nommé de `config.js`.
- **Les imports descendent, jamais l'inverse** :
  `config` ← `rules` ← `state`/`render` ← (`input`, `loop`) ← `main`.
  En particulier : `rules/` n'importe que `config.js` et d'autres modules de `rules/` ;
  `input/` n'importe ni `render/` ni `loop/` — ses effets (`acte`, `maj`, `dessiner`)
  lui sont injectés par `main.js`.
- **L'état du jeu vit dans `S`** (fabriqué par `creerPartie`, `src/state/partie.js`) et
  l'état applicatif (canvas, géométrie, survol, cibles) dans l'objet `app` créé par
  `src/main.js`. Ne pas créer de nouvelle variable globale : étendre `S` ou `app`.
- Les règles **mutent `s` en place** (choix documenté) : suivre ce style, ne pas
  introduire d'immutabilité partielle.
- Langue du code, des tests et des docs : **français**.

## Comportement attendu

- Ne jamais déclarer une tâche terminée sans avoir lancé `npm test` et vu la suite verte.
- Si une approche échoue deux fois, s'arrêter et revoir le plan au lieu d'une troisième
  variante.
- Tester au niveau macro : le comportement qu'un joueur constate, dans le vocabulaire du
  jeu — pas les détails d'implémentation (voir le skill `testing`).
- `docs/decisions.md` fait foi pour les comportements volontairement conservés et les
  questions ouvertes : ne pas « corriger » ce qui y est listé sans décision explicite.

## Skills disponibles

- `architecture` — carte des modules et « où va le code neuf » par type de changement.
- `regles-du-jeu` — règles pures : légalité, résolution, ennemis, tension, tour, seed.
- `plateau` — topologie : tuiles, portes, verrous, BFS, ligne de vue.
- `rendu-interface` — contrat `app`, rendu canvas/HUD, entrées par injection.
- `testing` — commande, philosophie macro, carte des tests, où écrire un nouveau test.
- `feature` — workflow d'implémentation d'une demande, de la reformulation au résumé.
- `prd` — rédige une spécification (PRD) sans rien implémenter.
