# RPD — Rez-de-chaussée

Jeu de plateau solo inspiré de Resident Evil 2 : Leon doit traverser le
rez-de-chaussée du commissariat et atteindre la sortie parking avant que la
pioche de tension ne s'épuise.

> ⚠️ **Ouvrir `index.html` par double-clic ne fonctionne plus.** Le code est
> découpé en modules ESM natifs, que les navigateurs refusent de charger en
> `file://`. Il faut servir le dossier par HTTP :
>
> ```sh
> npm run dev
> ```

## Lancer le jeu

```sh
npm run dev        # sert le dossier (npx serve), puis ouvrir l'URL affichée
```

Une partie précise peut être rejouée avec `?seed=N` dans l'URL.

## Tester

```sh
npm test           # node --test (Node ≥ 22, aucune dépendance)
npm run test:watch
```

## Architecture

```
index.html            coquille HTML/CSS, charge src/main.js
src/
  config.js           tables de données et valeurs des règles
  rules/              règles pures (déterministes via le RNG seedé de l'état)
    rng.js            générateur seedé
    plateau.js        cases, portes, franchissabilité
    deplacement.js    BFS d'accessibilité et de chemin
    vue.js            ligne de vue
    sac.js            inventaire
    actions.js        légalité des actions
    jouer.js          application d'une action
    ennemis.js        activation et apparition
    tension.js        pioche de tension
    tour.js           enchaînement des phases
    journal.js        messages du journal
  state/partie.js     fabrique de l'état d'une partie
  render/             canvas (plateau) et HUD (DOM)
  input/              souris et boutons → intentions
  loop/controleur.js  intention → règle → rendu
  main.js             point d'entrée : app, seed, câblage
tests/                tests macro (node:test), un fichier par règle
docs/decisions.md     décisions du refactoring, comportements conservés, questions ouvertes
```
