/* =========================================================================
   MOTEUR v2 — carte en CASES.
   Une tuile = une union de rectangles posée sur un quadrillage.
   On ne passe d'une tuile à l'autre que par un jeton PORTE placé sur
   l'arête entre deux cases précises. Les ennemis apparaissent sur les
   POINTS D'APPARITION imprimés sur les tuiles.

   Point d'entrée : état de l'application, seed, câblage des couches.
   ========================================================================= */
import { SEED_MAX } from './config.js';
import { tuileDe } from './rules/plateau.js';
import { creerPartie } from './state/partie.js';
import { taille, dessiner } from './render/canvas.js';
import { maj } from './render/hud.js';
import { acte } from './loop/controleur.js';
import { brancherSouris } from './input/souris.js';
import { brancherBoutons } from './input/boutons.js';

const cv = document.getElementById('plan');
const app = {
  cv, ctx: cv.getContext('2d'),
  S:null, G:null, survol:null, accessibles:new Map(), cibles:new Set(), secousse:0,
};

brancherSouris(app, { acte, maj, dessiner });
brancherBoutons(app, { acte });
addEventListener('resize', ()=>taille(app));

function nouvellePartie(seed){
  const s = seed ?? (Math.floor(Math.random()*SEED_MAX)+1);
  app.S = creerPartie(s);
  app.S.derniereTuile = tuileDe(app.S.joueur.c);
  document.getElementById('mSeed').textContent = s;
  document.getElementById('cTitre').textContent='Le calme';
  document.getElementById('cTexte').textContent='Vous entrez. La porte se referme seule derrière vous.';
  document.getElementById('cNum').textContent='';
  taille(app); maj(app);
}
// Le point d'entrée est un module : la fonction doit être exposée pour l'onclick inline.
window.nouvellePartie = nouvellePartie;
nouvellePartie(Number(new URLSearchParams(location.search).get('seed')) || undefined);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=>taille(app));
addEventListener('load', ()=>taille(app));
