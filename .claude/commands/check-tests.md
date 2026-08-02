# /check-tests — coverage analysis and missing tests

1. Read `CLAUDE.md` and the `testing` skill (macro philosophy, file → scope map).
2. Scope: `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
   If nothing changed, analyse the overall coverage of `src/rules/` + `src/state/`
   instead of stopping.
3. Analyse: for each touched rule (or each rules module in overall mode), confront
   the code's behaviour with the existing assertions of `tests/<module>.test.js`.
   Spot the uncovered player behaviours — especially the edge cases (full bag, not
   enough AP, empty deck, game over, occupied cell, locked door on the enemy side).
4. Propose the list of missing macro tests: target file + an English title stating
   the behaviour (like the existing tests) + a sketch of the required literal state.
   **Wait for the user's approval before writing anything.**
5. Once approved: write the accepted tests, then re-run the full `npm test` and
   report the real result (total, passes, failures).
