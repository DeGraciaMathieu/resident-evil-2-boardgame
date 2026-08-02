# /check-conventions — vérification rapide des conventions

1. Lire `CLAUDE.md`.
2. Périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
   **Rien à vérifier → le dire et s'arrêter.**
3. Vérifier, statut OK / VIOLATION / N-A par point, avec fichier:ligne :
   - `src/rules/` sans DOM ni `Math.random`/`Date.now` (aléatoire via `s.rng`) ;
   - valeurs de règles uniquement en exports nommés de `src/config.js` ;
   - sens des imports respecté (`input/` sans import de `render/`/`loop/`) ;
   - tests à jour : un changement de `src/rules/` ou `src/state/` sans évolution du
     `tests/<module>.test.js` correspondant se justifie ;
   - docs cohérentes : `README.md` (arborescence, commandes) et skills concernés encore
     exacts.
4. Lancer `npm test`, rapporter le résultat réel.
5. Verdict global : **conforme** ou liste courte des corrections, par priorité.
