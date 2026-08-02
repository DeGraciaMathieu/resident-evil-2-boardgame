---
name: prd
description: Use when l'utilisateur veut une spécification (PRD) d'une évolution du jeu avant toute implémentation — explore le code pour la base technique, ne pose que les décisions produit, n'implémente rien.
user_invocable: true
---

# Workflow : rédiger un PRD

Ce workflow produit un document de spécification. **Il n'implémente rien** : aucun
fichier de `src/` ni de `tests/` n'est modifié.

## Démarche

1. Explorer le code existant (skills `architecture`, `regles-du-jeu`, `plateau`,
   `rendu-interface`) pour remplir seul toute la partie technique : fichiers concernés,
   fonctions à étendre, constantes existantes dans `src/config.js`, tests impactés.
2. Ne poser à l'utilisateur que les **décisions produit** que le code ne règle pas :
   valeurs d'équilibrage, comportement attendu dans les cas limites, priorités.
3. Écrire le PRD au format fixe ci-dessous, en français, dans le vocabulaire du jeu.

## Format fixe

```markdown
# PRD — <titre>

## Objectif
<le problème ou l'envie, en une ou deux phrases joueur>

## Base technique
<état actuel du code concerné : modules, fonctions, constantes, avec chemins réels>

## Comportement
<le comportement cible, cas nominal puis cas limites, valeurs chiffrées explicites>

## Hors périmètre
<ce que cette évolution ne fait volontairement pas>

## Impact par couche
| Couche | Impact |
| --- | --- |
| `src/config.js` | <constantes à ajouter/modifier> |
| `src/rules/` | <règles touchées> |
| `src/state/` | <champs d'état nouveaux> |
| `src/render/` + `index.html` | <affichages> |
| `src/input/` + `src/loop/` | <déclencheurs> |

## Critères d'acceptation
<liste vérifiable, du point de vue du joueur>

## Tests
<les tests macro à écrire : fichier cible + comportement affirmé>

## Risques et questions ouvertes
<y compris les interactions avec docs/decisions.md le cas échéant>
```
