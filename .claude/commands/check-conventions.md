# /check-conventions — quick conventions check

1. Read `CLAUDE.md`.
2. Scope: `git diff`, `git diff --cached`, `git status`, `git log --oneline -5`.
   **Nothing to check → say so and stop.**
3. Check, OK / VIOLATION / N-A status per point, with file:line:
   - `src/rules/` free of DOM and `Math.random`/`Date.now` (randomness via `s.rng`);
   - rule values only as named exports of `src/config.js`;
   - import direction honoured (`input/` without imports of `render/`/`loop/`);
   - tests up to date: a change in `src/rules/` or `src/state/` without an evolution
     of the matching `tests/<module>.test.js` must be justified;
   - docs coherent: `README.md` (tree, commands) and the affected skills still exact.
4. Run `npm test`, report the real result.
5. Overall verdict: **compliant** or a short list of corrections, by priority.
