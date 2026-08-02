# /check-tests — analyse de la couverture et tests manquants

1. Lire `CLAUDE.md` et le skill `testing` (philosophie macro, carte fichier → portée).
2. Périmètre : `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
   Si rien n'a changé, analyser la couverture globale de `src/rules/` + `src/state/`
   plutôt que s'arrêter.
3. Analyser : pour chaque règle touchée (ou chaque module de règles en mode global),
   confronter le comportement du code aux assertions existantes de
   `tests/<module>.test.js`. Repérer les comportements joueur non couverts —
   en particulier les cas limites (sac plein, PA insuffisants, deck vide, partie finie,
   case occupée, porte verrouillée côté ennemi).
4. Proposer la liste des tests macro manquants : fichier cible + intitulé en français
   formulant le comportement (« … », comme les tests existants) + esquisse de l'état
   littéral nécessaire. **Attendre l'accord de l'utilisateur avant d'écrire quoi que ce
   soit.**
5. Une fois l'accord donné : écrire les tests approuvés, puis relancer `npm test`
   complet et rapporter le résultat réel (total, réussites, échecs).
