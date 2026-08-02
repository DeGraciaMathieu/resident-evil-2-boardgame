# /review — revue complète des changements en cours

1. Lire `CLAUDE.md` (conventions non négociables) et garder `docs/decisions.md` en tête
   (comportements volontairement conservés).
2. Établir le périmètre : `git diff`, `git diff --cached`, `git status`,
   `git log --oneline -5`. **S'il n'y a aucun changement, le dire et s'arrêter.**
3. Vérifier point par point, chacun noté OK / VIOLATION / N-A avec fichier:ligne :

   **Conventions**
   - Pureté de `src/rules/` : aucun `document`/`window`/`canvas`, aucun
     `Math.random`/`Date.now`/`performance.now` (l'aléatoire passe par `s.rng`).
   - Aucune valeur magique hors `src/config.js` (toute valeur de règle est un export nommé).
   - Sens des imports : `config ← rules ← state/render ← (input, loop) ← main` ;
     `input/` n'importe ni `render/` ni `loop/` (effets injectés par `main.js`).
   - État : rien de neuf en global — étendre `S` (via `creerPartie`) ou `app` (`main.js`).
   - Français : code, tests, messages du journal, docs.

   **Couverture de tests**
   - Toute règle nouvelle ou modifiée a son test macro dans `tests/<module>.test.js`.
   - Les tests affirment un comportement joueur, pas une forme interne ; état en
     littéral explicite ; seed fixé pour l'aléatoire.

   **Maintenabilité**
   - Couplage et responsabilité unique (une fonction de règle = une décision).
   - Duplication (attention au cycle d'armes codé en dur dans `actions.js` **et**
     `boutons.js` — s'il change, les deux).
   - Longueur/complexité des fonctions, noms fidèles au vocabulaire du jeu.

   **Cohérence système**
   - L'intégration suit les patterns en place : action → `actions` + `jouer` + entrée
     via `acte` ; affichage → `maj`/`dessiner` ; carte → données de `config.js`.
   - Aucune « correction » silencieuse d'un comportement listé dans `docs/decisions.md`.
   - `README.md` et skills encore exacts si l'arborescence ou les commandes ont bougé.

4. Lancer `npm test` et rapporter le résultat réel (nombre de tests, échecs).
5. Rapport final : tableau par point avec statut, puis verdict global
   (**conforme** / **à corriger** avec la liste ordonnée des corrections).
