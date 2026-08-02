/* Fabrique de l'état d'une partie. Tout l'état du jeu vit dans cet objet. */
import {
  JETONS, TENSION,
  NOM_JOUEUR, PV_MAX, PA_MAX, CASE_DEPART, ARME_DEPART, SAC_MAX, SAC_DEPART,
  POOL_JETONS_A, DECK_COUPE,
} from '../config.js';
import { makeRng, rndInt, shuffle } from '../rules/rng.js';
import { tuileDe } from '../rules/plateau.js';

export function creerPartie(seed){
  const rng = makeRng(seed);

  const jetons = JETONS.map(j => ({
    c: j.c, type: j.type,
    contenu: j.type==='B' ? 'herbe_r' : POOL_JETONS_A[rndInt(rng,POOL_JETONS_A.length)],
  }));
  // L'armurerie est verrouillée : elle contient toujours la carte + le fusil.
  const jArm = jetons.find(j => tuileDe(j.c)==='armurerie');
  jArm.contenu = 'carte'; jArm.bonus = 'pompe';
  // La clé de pique est cachée sous un jeton accessible sans clé.
  const libres = jetons.filter(j => tuileDe(j.c)!=='armurerie');
  libres[rndInt(rng,libres.length)].contenu = 'cle_pique';

  const base = TENSION.filter(c=>c.id!=='licker');
  const licker = TENSION.find(c=>c.id==='licker');
  const deck = [...shuffle(rng, base.slice(0,DECK_COUPE)), ...shuffle(rng,[...base.slice(DECK_COUPE), licker])];

  return {
    seed, rng, tour:1, pa:PA_MAX, paMax:PA_MAX,
    joueur:{ nom:NOM_JOUEUR, pv:PV_MAX, pvMax:PV_MAX, c:[...CASE_DEPART], arme:ARME_DEPART },
    sac:SAC_DEPART.map(i=>({...i})), sacMax:SAC_MAX,
    ennemis:[], prochainId:1,
    jetons, portesOuvertes:[], deck, defausse:[],
    phase:'joueur', fin:null,
    log:[{t:'sys', m:'Hall principal. La sortie parking est condamnée par un lecteur de badge.'}],
  };
}
