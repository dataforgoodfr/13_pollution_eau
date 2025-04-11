// lib/mockData.ts

interface Polluant {
  polluant_nom: string;
  polluant_valeur?: string | null;
}

export interface StatutBloc {
  bloc_nom: string;
  bloc_couleur: string;
  bloc_couleur_background: string;
  bloc_picto: string | null;
  bloc_polluants: Polluant[];
}

interface SousCategorie {
  sous_categorie_nom: string;
  sous_categorie_blocs: StatutBloc[];
}

export interface Categorie {
  categorie_id: string;
  categorie: string;
  statut_titre: string;
  statut_description: string;
  statut_couleur: string;
  statut_couleur_background: string;
  statut_picto: string | null;
  dernier_prelevement_date: string;
  dernier_prelevement_nb_polluants: number;
  affichage_blocs: boolean;
  statut_blocs: StatutBloc[];
  sous_categories?: SousCategorie[];
}

interface Synthese {
  statut: string;
  statut_couleur: string;
  statut_couleur_background: string;
  statut_picto?: string;
  status_polluants: { polluant_nom: string; polluant_categorie: string }[];
}

export interface Data {
  periode: string;
  synthese: Synthese[];
  categories: Categorie[];
}

export interface UDI {
  id: string;
  nom: string;
  communes_desservies: { nom: string; code_insee: string }[];
  data: Data[];
}

export const mockData: { [key: string]: UDI } = {
  UDI12345: {
    id: "UDI12345",
    nom: "Clermont-Ferrand Est",
    communes_desservies: [
      { nom: "Clermont-Ferrand", code_insee: "12345" },
      { nom: "Gerzay", code_insee: "67890" },
      { nom: "Aulnat", code_insee: "98765" },
    ],
    data: [
      {
        periode: "dernieres_analyses",
        synthese: [
          {
            statut: "Au moins un paramètre est au dessus du seuil de qualité",
            statut_couleur: "#FBBD6C",
            statut_couleur_background: "#FB726C",
            statut_picto: "warning",
            status_polluants: [
              { polluant_nom: "PFOA", polluant_categorie: "PFAS" },
            ],
          },
          {
            statut: "Absence de tests péocuppante",
            statut_couleur: "#FB726C",
            statut_couleur_background: "#FB726C",
            statut_picto: "red cross",
            status_polluants: [
              {
                polluant_nom: "Chlorothalonil R45423737",
                polluant_categorie: "Pesticides",
              },
            ],
          },
        ],
        categories: [
          {
            categorie_id: "pfas",
            categorie: "PFAS",
            statut_titre: "Seuil de qualité dépassé pour certains paramètres",
            statut_description:
              "Les PFAS (substances per- et polyfluoroalkylées) sont des polluants persistants qui peuvent contaminer l’eau potable via les rejets industriels, les mousses anti-incendie et les produits de consommation courants. Les PFAS sont des polluants persistants associés à des risques de cancers, perturbations endocriniennes, toxicité hépatique et rénale, troubles immunitaires et effets sur le développement fœtal et infantile.",
            statut_couleur: "#FBBD6C",
            statut_couleur_background: "#FB726C",
            statut_picto: "red cross",
            dernier_prelevement_date: "Lun. 25 Mars 2025",
            dernier_prelevement_nb_polluants: 590,
            affichage_blocs: true,
            statut_blocs: [
              {
                bloc_nom: "Seuil sanitaire dépassé",
                bloc_couleur: "#FB726C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: "red cross",
                bloc_polluants: [
                  { polluant_nom: "Isofetamide", polluant_valeur: "0.09 µg/L" },
                ],
              },
              {
                bloc_nom: "Seuil qualité dépassé",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: "warning",
                bloc_polluants: [
                  {
                    polluant_nom: "Oxathiapiprolin",
                    polluant_valeur: "0.15 µg/L",
                  },
                  { polluant_nom: "Pyriofenone", polluant_valeur: "0.15 µg/L" },
                ],
              },
              {
                bloc_nom: "Détecté en faible quantité",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: "waves",
                bloc_polluants: [
                  { polluant_nom: "Gamma Cyhalothrine", polluant_valeur: null },
                  { polluant_nom: "Pyriofenone", polluant_valeur: null },
                ],
              },
              {
                bloc_nom: "Non quantifié",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  { polluant_nom: "Gamma Cyhalothrine", polluant_valeur: null },
                  { polluant_nom: "Pyriofenone", polluant_valeur: null },
                ],
              },
              {
                bloc_nom: "Non recherché",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  { polluant_nom: "Oxathiapiprolin", polluant_valeur: null },
                  { polluant_nom: "Pyriofenone", polluant_valeur: null },
                ],
              },
            ],
          },
          {
            categorie_id: "cvm",
            categorie: "CVM",
            statut_titre: "Seuil de qualité dépassé pour certains paramètres",
            statut_description:
              "Une exposition prolongée au CVM par l’eau peut avoir des effets graves sur la santé humaine, notamment des cancers du foie, des troubles neurologiques, et des problèmes de reproduction.",
            statut_couleur: "#FBBD6C",
            statut_couleur_background: "#FB726C",
            statut_picto: "red cross",
            dernier_prelevement_date: "Lun. 25 Mars 2025",
            dernier_prelevement_nb_polluants: 590,
            affichage_blocs: false,
            statut_blocs: [
              {
                bloc_nom: "Seuil sanitaire dépassé",
                bloc_couleur: "#FB726C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: "red cross",
                bloc_polluants: [],
              },
              {
                bloc_nom: "Seuil qualité dépassé",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: "warning",
                bloc_polluants: [
                  { polluant_nom: "CVM", polluant_valeur: "0.15 µg/L" },
                ],
              },
              {
                bloc_nom: "Détecté en faible quantité",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: "waves",
                bloc_polluants: [],
              },
              {
                bloc_nom: "Non quantifié",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [],
              },
              {
                bloc_nom: "Non recherché",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [],
              },
            ],
          },
          {
            categorie_id: "pesticides",
            categorie: "Pesticides",
            statut_titre: "Seuil de qualité dépassé pour certains paramètres",
            statut_description:
              "Les pesticides sont des substances chimiques utilisées pour lutter contre les organismes nuisibles dans l'agriculture et l'entretien des espaces verts. Ils comprennent les herbicides, fongicides et insecticides, et peuvent contaminer les sols, l'air et les ressources en eau. Une exposition prolongée ou répétée peut avoir des effets graves sur la santé humaine ; notamment des troubles neurologiques, cancers, perturbations endocriniennes et effets sur la reproduction.",
            statut_couleur: "#FBBD6C",
            statut_couleur_background: "#FB726C",
            statut_picto: "red cross",
            dernier_prelevement_date: "Lun. 25 Mars 2025",
            dernier_prelevement_nb_polluants: 590,
            affichage_blocs: true,
            statut_blocs: [
              {
                bloc_nom: "Seuil sanitaire dépassé",
                bloc_couleur: "#FB726C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  { polluant_nom: "Isofetamide", polluant_valeur: "0.09 µg/L" },
                ],
              },
              {
                bloc_nom: "Seuil qualité dépassé",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  {
                    polluant_nom: "Oxathiapiprolin",
                    polluant_valeur: "0.15 µg/L",
                  },
                  { polluant_nom: "Pyriofenone", polluant_valeur: "0.15 µg/L" },
                ],
              },
              {
                bloc_nom: "Détecté en faible quantité",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  { polluant_nom: "Gamma Cyhalothrine", polluant_valeur: null },
                  { polluant_nom: "Pyriofenone", polluant_valeur: null },
                ],
              },
              {
                bloc_nom: "Non quantifié",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  { polluant_nom: "Gamma Cyhalothrine", polluant_valeur: null },
                  { polluant_nom: "Pyriofenone", polluant_valeur: null },
                ],
              },
              {
                bloc_nom: "Non recherché",
                bloc_couleur: "#FBBD6C",
                bloc_couleur_background: "#FB726C",
                bloc_picto: null,
                bloc_polluants: [
                  { polluant_nom: "Oxathiapiprolin", polluant_valeur: null },
                  { polluant_nom: "Pyriofenone", polluant_valeur: null },
                ],
              },
            ],
            sous_categories: [
              {
                sous_categorie_nom: "Metabolites",
                sous_categorie_blocs: [
                  {
                    bloc_nom: "Seuil sanitaire dépassé",
                    bloc_couleur: "#FB726C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Isofetamide",
                        polluant_valeur: "0.09 µg/L",
                      },
                    ],
                  },
                  {
                    bloc_nom: "Seuil qualité dépassé",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Oxathiapiprolin",
                        polluant_valeur: "0.15 µg/L",
                      },
                      {
                        polluant_nom: "Pyriofenone",
                        polluant_valeur: "0.15 µg/L",
                      },
                    ],
                  },
                  {
                    bloc_nom: "Détecté en faible quantité",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Gamma Cyhalothrine",
                        polluant_valeur: null,
                      },
                      { polluant_nom: "Pyriofenone", polluant_valeur: null },
                    ],
                  },
                  {
                    bloc_nom: "Non quantifié",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Gamma Cyhalothrine",
                        polluant_valeur: null,
                      },
                      { polluant_nom: "Pyriofenone", polluant_valeur: null },
                    ],
                  },
                  {
                    bloc_nom: "Non recherché",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Oxathiapiprolin",
                        polluant_valeur: null,
                      },
                      { polluant_nom: "Pyriofenone", polluant_valeur: null },
                    ],
                  },
                ],
              },
              {
                sous_categorie_nom: "Substances actives",
                sous_categorie_blocs: [
                  {
                    bloc_nom: "Seuil sanitaire dépassé",
                    bloc_couleur: "#FB726C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Isofetamide",
                        polluant_valeur: "0.09 µg/L",
                      },
                    ],
                  },
                  {
                    bloc_nom: "Seuil qualité dépassé",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Oxathiapiprolin",
                        polluant_valeur: "0.15 µg/L",
                      },
                      {
                        polluant_nom: "Pyriofenone",
                        polluant_valeur: "0.15 µg/L",
                      },
                    ],
                  },
                  {
                    bloc_nom: "Détecté en faible quantité",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Gamma Cyhalothrine",
                        polluant_valeur: null,
                      },
                      { polluant_nom: "Pyriofenone", polluant_valeur: null },
                    ],
                  },
                  {
                    bloc_nom: "Non quantifié",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Gamma Cyhalothrine",
                        polluant_valeur: null,
                      },
                      { polluant_nom: "Pyriofenone", polluant_valeur: null },
                    ],
                  },
                  {
                    bloc_nom: "Non recherché",
                    bloc_couleur: "#FBBD6C",
                    bloc_couleur_background: "#FB726C",
                    bloc_picto: null,
                    bloc_polluants: [
                      {
                        polluant_nom: "Oxathiapiprolin",
                        polluant_valeur: null,
                      },
                      { polluant_nom: "Pyriofenone", polluant_valeur: null },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
