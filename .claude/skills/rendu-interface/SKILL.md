---
name: rendu-interface
description: Use when une demande touche l'affichage ou les interactions — canvas, HUD, boutons, souris, écran de fin, carte tension animée — pour respecter le contrat app et l'injection des effets dans input/.
auto_invoke: true
---

# Rendu et interface

Le rendu lit l'état, ne le décide jamais. Tout l'état applicatif circule via l'objet
`app` créé par `src/main.js` :

```js
app = { cv, ctx, S, G, survol, accessibles, cibles, secousse }
```

`S` est l'état de jeu ; `G` la géométrie (`{t, ox, oy}` : taille d'une case et centrage) ;
`accessibles` (Map clé de case → action `deplacer`) et `cibles` (Set d'ids d'ennemis)
sont recalculés par `recalculer(app)` à partir d'`actions(S)`.

## Qui fait quoi

| Élément | Fonction | Fichier |
| --- | --- | --- |
| Redimensionnement (DPR compris) | `taille(app)` | `src/render/canvas.js` |
| Rendu complet du plateau | `dessiner(app)` — grille, tuiles, apparitions, jetons, portes, cases atteignables, ennemis, joueur | `src/render/canvas.js` |
| Secousse d'écran après un tir | `app.secousse` (init `SECOUSSE_INITIALE` dans `souris.js`, amortie dans `dessiner`) — seul usage légitime de `Math.random`, cosmétique | `src/render/canvas.js` |
| HUD complet | `maj(app, carteTiree)` — tour, arme, jauges PV/PA, sac, boutons `disabled`, journal, compteur de pioche, flip de carte, écran de fin | `src/render/hud.js` |
| Glyphes des items | `ICONES` | `src/render/hud.js` |
| Couleurs des tuiles | `TEINTES` | `src/render/canvas.js` |
| Survol et clic plateau | `brancherSouris(app, {acte, maj, dessiner})` | `src/input/souris.js` |
| Boutons du bandeau | `brancherBoutons(app, {acte})` | `src/input/boutons.js` |
| Intention → règle → rendu | `acte(app, action)` | `src/loop/controleur.js` |
| Ids DOM du HUD | `mTour`, `mSeed`, `pv`, `pa`, `arme`, `des`, `mun`, `lieu`, `sac`, `journal`, `restant`, `carte`, `cTitre`, `cTexte`, `cNum`, `fin`, `finT`, `finP`, boutons `bFouiller`/`bSoin`/`bComb`/`bArme`/`bFin` | `index.html` |

## Le contrat des couches

- `render/` lit `app` et `S`, écrit à l'écran — jamais dans `S`.
- `input/` traduit un événement en **intention** et appelle les effets **injectés**
  (`acte`, `maj`, `dessiner`). Il n'importe ni `render/` ni `loop/` : si un nouveau
  gestionnaire a besoin d'un effet, l'ajouter au paramètre d'injection et au câblage
  dans `src/main.js`.
- Toute action de jeu passe par `acte(app, action)` — ne jamais appeler `jouer` puis
  `maj` à la main depuis un gestionnaire.

## Ajouter un élément d'interface

1. `index.html` : le markup (avec un id) et le style dans le `<style>` en tête.
2. `src/render/hud.js` : sa mise à jour dans `maj` (ou `src/render/canvas.js` dans
   `dessiner` si c'est sur le plateau).
3. S'il est interactif : le brancher dans `src/input/boutons.js` (ou `souris.js`),
   l'action passant par `acte`.
4. Valeurs nouvelles (délai, seuil, couleur liée à une règle) → `src/config.js`.
5. Le rendu n'est pas testé (aucun test n'importe `render/` ni `input/`) : vérifier en
   jeu avec `npm run dev`, et garder `npm test` vert.

## Pièges connus

- `nouvellePartie` est exposée sur `window` (`src/main.js`) parce que le bouton de
  l'écran de fin utilise un `onclick` inline — la conserver si on touche au bootstrap.
- Le flip de la carte tension repose sur la classe CSS `flip` et `DELAI_FLIP_CARTE`
  (260 ms) : les deux doivent rester cohérents avec la transition CSS de `.carte`.
- `maj(app, carteTiree)` ne déclenche l'animation que si `carteTiree` est vrai — c'est
  `acte` qui le détecte en comparant la taille du deck avant/après `jouer`.
