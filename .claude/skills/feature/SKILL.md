---
name: feature
description: Use when l'utilisateur demande d'implémenter une fonctionnalité ou une modification du jeu — déroule le workflow complet, de la reformulation au résumé final, dans le respect des couches.
user_invocable: true
---

# Workflow : implémenter une demande

## 1. Comprendre

- Reformuler la demande en une ou deux phrases, dans le vocabulaire du jeu.
- Invoquer le skill `architecture` (et `regles-du-jeu` / `plateau` / `rendu-interface`
  selon le sujet) pour situer les fichiers concernés.
- Poser les questions de clarification **avant** de coder :
  - les valeurs chiffrées (coût en PA, portée, dégâts, distance d'apparition…) ;
  - les interactions avec l'existant (cumul avec le surcoût de dégagement ? effet sur
    le deck de tension ? visible dans le HUD ?) ;
  - les cas limites (sac plein, PA insuffisants, partie finie, case occupée).
- Si la demande touche un comportement listé dans `docs/decisions.md` (« Deliberately
  left alone » ou « Open questions »), le signaler et faire trancher.

## 2. Implémenter

- Respecter `CLAUDE.md` : valeurs dans `src/config.js`, règles pures dans `src/rules/`
  (aléatoire via `s.rng`), rendu dans `src/render/`, déclencheurs dans `src/input/`
  passant par `acte`.
- Suivre l'ordre des procédures du skill de domaine concerné (ex. « ajouter une carte
  tension » : config → tension.js → test → jeu).
- Ne pas ajouter de dépendance, ni de fonctionnalité non demandée.

## 3. Tester

- Écrire le ou les tests macro dans le `tests/<module>.test.js` correspondant
  (comportement joueur, état en littéral, seed fixé).
- `npm test` complet, corriger jusqu'au vert. Deux échecs sur la même approche →
  s'arrêter et revoir le plan avec l'utilisateur.
- Vérifier en jeu si le rendu ou les entrées sont touchés (`npm run dev`).

## 4. Mettre à jour la documentation

Seulement si le périmètre a bougé :
- `CLAUDE.md` si une convention change ;
- le skill de domaine concerné si une table concept → implémentation n'est plus exacte ;
- le `README.md` si l'arborescence ou les commandes changent ;
- `docs/decisions.md` si une question ouverte a été tranchée.

## 5. Résumer

Terminer par : fichiers modifiés, tests ajoutés (nom + comportement couvert), résultat
de `npm test`, et ce qui reste ouvert le cas échéant.
