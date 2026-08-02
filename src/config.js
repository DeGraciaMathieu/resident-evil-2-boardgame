/* =========================================================================
   CONFIGURATION — données du plateau et valeurs des règles.
   ========================================================================= */

/* ---------------------------------------------------------------- CARTE */
// rects: [x, y, largeur, hauteur] en cases.
export const TUILES = [
  { id:'couloir_n', nom:'Couloir nord',   rects:[[7,0,5,1]] },
  { id:'bureau_o',  nom:'Bureau ouest',   rects:[[3,1,5,3]] },
  { id:'vestiaire', nom:'Vestiaires',     rects:[[1,2,2,4]] },
  { id:'hall',      nom:'Hall principal', rects:[[3,4,5,1],[3,5,1,3],[3,8,5,1],[7,5,1,3]] }, // anneau
  { id:'sombre',    nom:'Chambre noire',  rects:[[4,5,3,3]] },                                // enclavée
  { id:'couloir_s', nom:'Couloir sud',    rects:[[7,9,4,2]] },
  { id:'bureau_e',  nom:'Bureau est',     rects:[[10,4,5,5]] },
  { id:'armurerie', nom:'Armurerie',      rects:[[10,1,3,3]] },
  { id:'parking',   nom:'Sortie parking', rects:[[13,9,3,2]] },
];

// Une porte relie deux cases adjacentes de deux tuiles différentes.
export const PORTES = [
  { a:[7,0],  b:[7,1],  verrou:null },
  { a:[10,0], b:[10,1], verrou:'cle_pique' },
  { a:[3,2],  b:[2,2],  verrou:null },
  { a:[5,3],  b:[5,4],  verrou:null },
  { a:[2,5],  b:[3,5],  verrou:null },
  { a:[4,4],  b:[4,5],  verrou:null },
  { a:[7,8],  b:[7,9],  verrou:null },
  { a:[10,9], b:[10,8], verrou:null },
  { a:[10,3], b:[10,4], verrou:'cle_pique' },
  { a:[13,8], b:[13,9], verrou:'carte' },
];

// Points d'apparition imprimés sur les tuiles.
export const APPARITIONS = [[8,0],[3,1],[1,2],[3,8],[7,5],[8,9],[14,4],[10,7],[5,7],[11,1]];

// Jetons de fouille posés sur des cases précises.
export const JETONS = [
  { c:[4,2], type:'A' }, { c:[6,1], type:'A' },
  { c:[1,3], type:'A' }, { c:[2,4], type:'A' },
  { c:[5,6], type:'B' },
  { c:[11,5],type:'A' }, { c:[13,7],type:'A' },
  { c:[9,0], type:'A' },
  { c:[11,2],type:'B' },
];

export const ITEMS = {
  munitions:{ nom:'Munitions', pile:8 },
  herbe_v:  { nom:'Herbe verte', pile:1 },
  herbe_r:  { nom:'Herbe rouge', pile:1 },
  cle_pique:{ nom:'Clé de pique', pile:1, cle:true },
  carte:    { nom:'Carte magnétique', pile:1, cle:true },
  pompe:    { nom:'Fusil à pompe', pile:1 },
};
export const ARMES = {
  couteau: { nom:'Couteau',       des:1, portee:1, mun:0, zone:false },
  pistolet:{ nom:'Pistolet',      des:2, portee:5, mun:1, zone:false },
  pompe:   { nom:'Fusil à pompe', des:3, portee:2, mun:1, zone:true  },
};
export const ENNEMIS = {
  zombie:{ nom:'Zombie', pv:4, degats:2, vitesse:2 },
  chien: { nom:'Chien',  pv:3, degats:2, vitesse:4 },
  licker:{ nom:'Licker', pv:6, degats:3, vitesse:3 },
};
export const DE = [0,0,1,1,2,3];
export const PORTEE_DEPLACEMENT = 2; // cases parcourues par action de déplacement

export const TENSION = [
  ...Array(4).fill({ id:'approche', titre:'Ils arrivent', texte:'Un zombie se relève sur un point d’apparition éloigné.' }),
  ...Array(2).fill({ id:'grogne',   titre:'Grognements',  texte:'Ça se relève juste à côté.' }),
  ...Array(2).fill({ id:'meute',    titre:'La meute',     texte:'Une vitre explose. Un chien entre.' }),
  ...Array(2).fill({ id:'calme',    titre:'Silence',      texte:'Rien. Pour l’instant.' }),
  { id:'souffle',   titre:'Reprendre souffle', texte:'Vous récupérez un point de vie.' },
  { id:'grouille',  titre:'Ça grouille',       texte:'Tout ce qui rôde avance encore.' },
  { id:'trouvaille',titre:'Fouille rapide',    texte:'Une boîte de munitions traînait là.' },
  { id:'licker',    titre:'LICKER',            texte:'Il descend du plafond. Il vous a entendu.' },
];

/* --------------------------------------------------------------- JOUEUR */
export const NOM_JOUEUR = 'Leon';
export const PV_MAX = 10;
export const PA_MAX = 4;
export const CASE_DEPART = [3,4];
export const ARME_DEPART = 'pistolet';
export const SAC_MAX = 6;
export const SAC_DEPART = [{id:'munitions',n:4},{id:'herbe_v',n:1}];

/* --------------------------------------------------------------- RÈGLES */
// Contenus possibles d'un jeton de type A.
export const POOL_JETONS_A = ['munitions','munitions','herbe_v','rien','herbe_r','munitions','rien'];
// Un jeton contenant des munitions en donne 2.
export const MUNITIONS_PAR_JETON = 2;
// Les 8 premières cartes du deck sont shufflées à part (le licker n'y est jamais).
export const DECK_COUPE = 8;
export const SOIN_HERBE_VERTE = 3;
export const SOIN_SOUFFLE = 1;
export const MUNITIONS_TROUVAILLE = 2;
export const BONUS_GROUILLE = 2;
// Distance minimale d'apparition selon la carte tension.
export const DIST_APPARITION = { approche:6, grogne:1, meute:4, licker:3 };
export const COUT_DEPLACEMENT = 1;
export const COUT_DEPLACEMENT_ENGAGE = 2; // se dégager du contact coûte une action de plus
export const GARDE_VUE = 200; // garde anti-boucle infinie du tracé de ligne de vue
export const PORTEE_BFS_MAX = 99; // profondeur par défaut du BFS (borne de sécurité)
export const DIST_INFINIE = 999; // sentinelle « inatteignable » pour le choix d'apparition

/* ------------------------------------------------------------ INTERFACE */
export const JOURNAL_MAX = 40;
export const DECK_CRITIQUE = 4; // seuil d'affichage "critique" de la pioche
export const DELAI_FLIP_CARTE = 260; // ms
export const SEED_MAX = 99999;
export const SECOUSSE_INITIALE = 6;
export const SECOUSSE_AMORTISSEMENT = .8;
export const SECOUSSE_SEUIL = .4;
