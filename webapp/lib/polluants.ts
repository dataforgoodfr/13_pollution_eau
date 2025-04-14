interface Polluant {
  nomPolluant: string;
  valeurPolluant?: string | null;
}

interface BlocStatut {
  nomBloc: string;
  couleurBloc: string;
  couleurFondBloc: string;
  pictoBloc: string | null;
  polluants: Polluant[];
}

interface DetailResultat {
  label: string;
  couleur: string;
  couleurFond?: string;
  picto?: string | null;
  affichageBlocPageUDI?: boolean;
  sousCategorie?: boolean;
}

export interface ICategory {
  id: string;
  nomAffichage: string;
  disable: boolean;
  enfants: ICategory[];
  affichageBlocPageUDI: boolean;
  description: string;
  risquesSante: string;
  regulation: string;
  sourcesExposition: string;
  sousCategories?: boolean;
  titreStatut?: string;
  descriptionStatut?: string;
  couleurStatut?: string;
  couleurFondStatut?: string;
  picto?: string | null;
  dateDernierPrelèvement?: string;
  nombrePolluantsDernierPrelèvement?: number;
  blocsStatut?: BlocStatut[];
  resultats: { [key: string]: DetailResultat };
}

export const availableCategories: ICategory[] = [
  {
    id: "tous-polluants",
    nomAffichage: "Tous polluants",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Ensemble des substances chimiques et biologiques pouvant contaminer l'eau, l'air et les sols.",
    risquesSante:
      "Dépend du polluant : effets cancérigènes, neurotoxiques, perturbateurs endocriniens, maladies chroniques, etc.",
    regulation: "Directive cadre sur l'eau (DCE), Code de l'environnement.",
    sourcesExposition: "Eau potable, air, alimentation, sols contaminés.",
    resultats: {
      aucun_depassement: {
        label: "Aucun dépassement des valeurs seuils",
        couleur: "#B4E681",
        couleurFond: "#B4E681",
        picto: null,
      },
      limite_qualite: {
        label:
          "Au moins un paramètre au-dessus de la limite de qualité (norme ou recommandation)",
        couleur: "#FBBD6C",
        couleurFond: "#FBBD6C",
        picto: "warning",
      },
      limite_sanitaire: {
        label:
          "Au moins un paramètre au-dessus de la limite sanitaire (norme ou recommandation)",
        couleur: "#FB726C",
        couleurFond: "#FB726C",
        picto: "red cross",
      },
    },
  },
  {
    id: "pfas",
    nomAffichage: "PFAS",
    sousCategories: false,
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Polluants éternels, utilisés dans l'industrie pour leurs propriétés antiadhésives et imperméables.",
    risquesSante:
      "Perturbateurs endocriniens, cancers, toxicité hépatique et immunitaire.",
    regulation:
      "Réglementation en cours d'évolution, restriction progressive en Europe.",
    sourcesExposition:
      "Ustensiles de cuisine, emballages alimentaires, eau potable.",
    resultats: {
      aucun_parametre_quantifie: {
        label: "Aucun paramètre quantifié",
        couleur: "#75D3B4",
        couleurFond: "#75D3B4",
        picto: null,
      },
      somme_20pfas_inf_0_1_et_4pfas_inf_0_02: {
        label:
          "Au moins un paramètre quantifié mais concentration inférieure aux valeurs seuils",
        couleur: "#B4E681",
        couleurFond: "#B4E681",
        picto: null,
      },
      somme_20pfas_inf_0_1_et_4pfas_sup_0_02: {
        label:
          "Concentration des PFOA, PFOS, PFNA, PFHxS supérieure à la recommandation (0.02 µg/L)",
        couleur: "#EFE765",
        couleurFond: "#EFE765",
        picto: null,
      },
      somme_20pfas_sup_0_1: {
        label:
          "Concentration totale en PFAS supérieure à la recommandation (>0,1 µg/L)",
        couleur: "#FBBD6C",
        couleurFond: "#FBBD6C",
        picto: null,
      },
      un_pfas_sup_valeur_sanitaire: {
        label: "Au moins un paramètre au-dessus de la limite sanitaire",
        couleur: "#FB726C",
        couleurFond: "#FB726C",
        picto: "red cross",
      },
      non_recherche: {
        label: "PFAS non recherchés",
        couleur: "hachuré",
        couleurFond: "hachuré",
        picto: null,
      },
    },
  },
  {
    id: "pesticides",
    nomAffichage: "Pesticides",
    disable: false,
    affichageBlocPageUDI: true,
    description:
      "Substances chimiques utilisées pour lutter contre les nuisibles agricoles.",
    risquesSante:
      "Cancers, troubles neurologiques, perturbations endocriniennes, toxicité aiguë.",
    regulation:
      "LMR (Limites Maximales de Résidus), règlement (CE) n°1107/2009.",
    sourcesExposition:
      "Agriculture, consommation de produits traités, eau potable.",
    resultats: {
      aucun_depassement: {
        label: "Aucun dépassement des valeurs seuils",
        couleur: "#B4E681",
        couleurFond: "#B4E681",
        picto: null,
      },
      limite_qualite: {
        label:
          "Au moins un paramètre au-dessus de la limite de qualité (norme ou recommandation)",
        couleur: "#FBBD6C",
        couleurFond: "#FBBD6C",
        picto: "warning",
      },
      limite_sanitaire: {
        label:
          "Au moins un paramètre au-dessus de la limite sanitaire (norme ou recommandation)",
        couleur: "#FB726C",
        couleurFond: "#FB726C",
        picto: "red cross",
      },
    },
    enfants: [
      {
        id: "substances-actives",
        nomAffichage: "Substances actives",
        disable: false,
        affichageBlocPageUDI: false,
        enfants: [],
        description:
          "Molécules ayant un effet biocide contre les organismes nuisibles.",
        risquesSante:
          "Toxicité variable : certains sont cancérigènes ou reprotoxiques.",
        regulation: "Autorisation par l'ANSES, encadrement par l'UE.",
        sourcesExposition:
          "Pulvérisation agricole, résidus dans l'eau et les aliments.",
        sousCategories: true,
        resultats: {
          non_quantifie: {
            label: "Aucun paramètre quantifié",
            couleur: "#75D3B4",
            couleurFond: "#75D3B4",
            picto: null,
          },
          limite_qualite: {
            label:
              "Au moins un paramètre quantifié mais aucun dépassement des valeurs seuils",
            couleur: "#B4E681",
            couleurFond: "#B4E681",
            picto: null,
          },
          limite_sanitaire: {
            label:
              "Au moins un paramètre au-dessus de la limite sanitaire (norme ou recommandation)",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
        },
      },
      {
        id: "metabolites",
        nomAffichage: "Métabolites",
        disable: false,
        affichageBlocPageUDI: false,
        description: "Produits de dégradation des substances actives.",
        risquesSante:
          "Moins étudiés que les substances actives, certains sont toxiques.",
        regulation:
          "Réglementation récente : seuils pour certains métabolites en eau potable.",
        sourcesExposition:
          "Dégradation dans l'eau et les sols, consommation d'eau potable.",
        sousCategories: false,
        resultats: {
          aucun_depassement: {
            label: "Aucun dépassement des valeurs seuils",
            couleur: "#B4E681",
            couleurFond: "#B4E681",
            picto: null,
          },
          limite_qualite: {
            label:
              "Au moins un paramètre au-dessus de la limite de qualité (norme ou recommandation)",
            couleur: "#FBBD6C",
            couleurFond: "#FBBD6C",
            picto: "warning",
          },
          limite_sanitaire: {
            label:
              "Au moins un paramètre au-dessus de la limite sanitaire (norme ou recommandation)",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
        },
        enfants: [
          {
            id: "metabolites-esa-metachlore",
            nomAffichage: "Métabolites ESA-métachlore",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: false,
            description: "Métabolite du métolachlore, herbicide.",
            risquesSante: "Peu de données, potentiellement toxique.",
            regulation: "Limite de 0,1 µg/L en eau potable.",
            sourcesExposition: "Contamination de l'eau souterraine.",
            sousCategories: false,
            resultats: {
              non_recherche: {
                label: "Paramètre non recherché",
                couleur: "hachuré",
                couleurFond: "hachuré",
                picto: null,
              },
              non_quantifie: {
                label: "Paramètre non quantifié",
                couleur: "#75D3B4",
                couleurFond: "#75D3B4",
                picto: null,
              },
              limite_qualite: {
                label:
                  "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommandation)",
                couleur: "#B4E681",
                couleurFond: "#B4E681",
                picto: null,
              },
              inconnu: {
                label: "?",
                couleur: "#EFE765",
                couleurFond: "#EFE765",
                picto: null,
              },
              limite_sanitaire: {
                label:
                  "Paramètre quantifié au-dessus de la limite sanitaire (norme ou recommandation)",
                couleur: "#FB726C",
                couleurFond: "#FB726C",
                picto: "red cross",
              },
            },
          },
          {
            id: "metabolites-chlorothalonil-r471811",
            nomAffichage: "Métabolites Chlorothalonil R471811",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description: "Métabolite du fongicide chlorothalonil.",
            risquesSante: "Classé comme probablement cancérigène.",
            regulation: "Interdit en 2019 par l'UE.",
            sourcesExposition: "Présent dans les nappes phréatiques.",
            sousCategories: false,
            resultats: {
              non_recherche: {
                label: "Paramètre non recherché",
                couleur: "hachuré",
                couleurFond: "hachuré",
                picto: null,
              },
              non_quantifie: {
                label: "Paramètre non quantifié",
                couleur: "#75D3B4",
                couleurFond: "#75D3B4",
                picto: null,
              },
              limite_qualite: {
                label:
                  "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommandation)",
                couleur: "#B4E681",
                couleurFond: "#B4E681",
                picto: null,
              },
              inconnu: {
                label: "?",
                couleur: "#EFE765",
                couleurFond: "#EFE765",
                picto: null,
              },
              limite_sanitaire: {
                label:
                  "Paramètre quantifié au-dessus de la limite sanitaire (norme ou recommandation)",
                couleur: "#FB726C",
                couleurFond: "#FB726C",
                picto: "red cross",
              },
            },
          },
          {
            id: "metabolites-chloridazone-desphenyl",
            nomAffichage: "Métabolites Chloridazone desphényl",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description:
              "Métabolite de la chloridazone, herbicide utilisé pour les betteraves.",
            risquesSante: "Potentiellement toxique.",
            regulation: "Limite de 0,1 µg/L en eau potable.",
            sourcesExposition: "Présent dans les eaux souterraines.",
            sousCategories: false,
            resultats: {
              non_recherche: {
                label: "Paramètre non recherché",
                couleur: "hachuré",
                couleurFond: "hachuré",
                picto: null,
              },
              non_quantifie: {
                label: "Paramètre non quantifié",
                couleur: "#75D3B4",
                couleurFond: "#75D3B4",
                picto: null,
              },
              limite_qualite: {
                label:
                  "Paramètre quantifié au-dessus de la limite de qualité (norme ou recommandation)",
                couleur: "#FBBD6C",
                couleurFond: "#FBBD6C",
                picto: null,
              },
              limite_sanitaire: {
                label:
                  "Paramètre quantifié au-dessus de la limite sanitaire (norme ou recommandation)",
                couleur: "#FB726C",
                couleurFond: "#FB726C",
                picto: "red cross",
              },
            },
          },
          {
            id: "metabolites-atrazine-desethyl",
            nomAffichage: "Métabolites Atrazine déséthyl",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description:
              "Métabolite de l'atrazine, herbicide interdit depuis 2003.",
            risquesSante: "Suspecté d'être perturbateur endocrinien.",
            regulation: "Limite de 0,1 µg/L en eau potable.",
            sourcesExposition: "Contamination résiduelle des sols et nappes.",
            sousCategories: false,
            resultats: {
              non_recherche: {
                label: "Paramètre non recherché",
                couleur: "hachuré",
                couleurFond: "hachuré",
                picto: null,
              },
              non_quantifie: {
                label: "Paramètre non quantifié",
                couleur: "#75D3B4",
                couleurFond: "#75D3B4",
                picto: null,
              },
              limite_qualite: {
                label:
                  "Paramètre quantifié au-dessus de la limite de qualité (norme ou recommandation)",
                couleur: "#FBBD6C",
                couleurFond: "#FBBD6C",
                picto: null,
              },
              limite_sanitaire: {
                label:
                  "Paramètre quantifié au-dessus de la limite sanitaire (norme ou recommandation)",
                couleur: "#FB726C",
                couleurFond: "#FB726C",
                picto: "red cross",
              },
            },
          },
          {
            id: "chloridazone-methyl-desphenyl",
            nomAffichage: "Chloridazone methyl desphényl",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description: "Autre métabolite de la chloridazone.",
            risquesSante: "Effets toxiques incertains.",
            regulation: "Surveillance renforcée en eau potable.",
            sourcesExposition: "Contamination des ressources en eau.",
            sousCategories: false,
            resultats: {
              non_recherche: {
                label: "Paramètre non recherché",
                couleur: "hachuré",
                couleurFond: "hachuré",
                picto: null,
              },
              non_quantifie: {
                label: "Paramètre non quantifié",
                couleur: "#75D3B4",
                couleurFond: "#75D3B4",
                picto: null,
              },
              limite_qualite: {
                label:
                  "Paramètre quantifié au-dessus de la limite de qualité (norme ou recommandation)",
                couleur: "#FBBD6C",
                couleurFond: "#FBBD6C",
                picto: null,
              },
              limite_sanitaire: {
                label:
                  "Paramètre quantifié au-dessus de la limite sanitaire (norme ou recommandation)",
                couleur: "#FB726C",
                couleurFond: "#FB726C",
                picto: "red cross",
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "nitrates-et-nitrites",
    nomAffichage: "Nitrates et Nitrites",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Résidus azotés provenant des engrais et des déchets organiques.",
    risquesSante: "Méthémoglobinémie, risque de cancer gastro-intestinal.",
    regulation:
      "Limite de 50 mg/L pour les nitrates, 0,5 mg/L pour les nitrites en eau potable.",
    sourcesExposition:
      "Agriculture intensive, effluents industriels et domestiques.",
    resultats: {
      conforme: {
        label: "Concentration inférieure aux valeurs seuils : eau conforme",
        couleur: "#B4E681",
        couleurFond: "#B4E681",
        picto: null,
      },
      non_conforme: {
        label: "Concentration supérieure aux valeurs seuils : eau non conforme",
        couleur: "#FB726C",
        couleurFond: "#FB726C",
        picto: "red cross",
      },
    },
  },
  {
    id: "cvm",
    nomAffichage: "CVM",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description: "Utilisé pour produire le PVC, polluant volatil.",
    risquesSante: "Cancérigène avéré, hépatotoxicité.",
    regulation: "Seuil de 0,5 µg/L en eau potable.",
    sourcesExposition: "Industrie plastique, eau contaminée.",
    resultats: {
      non_quantifie: {
        label: "CVM non quantifié",
        couleur: "#75D3B4",
        couleurFond: "#75D3B4",
        picto: null,
      },
      inf_0_5: {
        label: "CVM quantifié mais < 0,5 µg/L",
        couleur: "#EFE765",
        couleurFond: "#EFE765",
        picto: null,
      },
      sup_0_5: {
        label: "CVM > 0,5 µg/L",
        couleur: "#FB726C",
        couleurFond: "#FB726C",
        picto: "red cross",
      },
      non_recherche: {
        label: "CVM non recherché",
        couleur: "hachuré",
        couleurFond: "hachuré",
        picto: null,
      },
    },
  },
  {
    id: "sub_indus",
    nomAffichage: "Substances industrielles",
    disable: true,
    affichageBlocPageUDI: true,
    description: "Composés chimiques issus des processus industriels.",
    risquesSante:
      "Variable selon la substance, risques cancérigènes et toxiques.",
    regulation:
      "Encadrement par le Code de l'environnement et les normes REACH.",
    sourcesExposition:
      "Déchets industriels, effluents rejetés dans l'environnement.",
    resultats: {
      // disable -> pas de résultats
    },
    enfants: [
      {
        id: "sub_indus_14dioxane",
        nomAffichage: "1,4-Dioxane",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description: "Solvant industriel persistant dans l'eau.",
        risquesSante: "Cancérigène probable, toxicité rénale et hépatique.",
        regulation: "Surveillance en cours, pas de norme spécifique.",
        sourcesExposition:
          "Industries pharmaceutiques et plastiques, eau contaminée.",
        sousCategories: true,
        resultats: {
          non_recherche: {
            label: "Paramètre non recherché",
            couleur: "hachuré",
            couleurFond: "hachuré",
            picto: null,
          },
          non_quantifie: {
            label: "Paramètre non quantifié",
            couleur: "#75D3B4",
            couleurFond: "#75D3B4",
            picto: null,
          },
          inf_valeur_sanitaire: {
            label:
              "Paramètre quantifié mais en concentration inférieure à la limite sanitaire (norme ou recommandation)",
            couleur: "#B4E681",
            couleurFond: "#B4E681",
            picto: null,
          },
          sup_valeur_sanitaire: {
            label:
              "Paramètre quantifié en concentration supérieure à la limite sanitaire (norme ou recommandation)",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
        },
      },
      {
        id: "sub_indus_perchlorate",
        nomAffichage: "Perchlorate",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Produit chimique utilisé dans les explosifs et les engrais.",
        risquesSante: "Perturbateur thyroïdien.",
        regulation: "Valeur-guide en eau potable (4 µg/L en France).",
        sourcesExposition: "Munitions, feux d'artifice, engrais contaminés.",
        sousCategories: true,
        resultats: {
          non_recherche: {
            label: "Paramètre non recherché",
            couleur: "hachuré",
            couleurFond: "hachuré",
            picto: null,
          },
          non_quantifie: {
            label: "Paramètre non quantifié",
            couleur: "#75D3B4",
            couleurFond: "#75D3B4",
            picto: null,
          },
          inf_valeur_sanitaire: {
            label:
              "Paramètre quantifié mais en concentration inférieure à la limite sanitaire (norme ou recommandation)",
            couleur: "#B4E681",
            couleurFond: "#B4E681",
            picto: null,
          },
          sup_valeur_sanitaire: {
            label:
              "Paramètre quantifié en concentration supérieure à la limite sanitaire (norme ou recommandation)",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
          sup_valeur_sanitaire_2: {
            label: "Paramètre quantifié en concentration supérieure à 15 µg/L",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
        },
      },
    ],
  },
  {
    id: "metaux-lourds",
    nomAffichage: "Métaux lourds",
    disable: true,
    affichageBlocPageUDI: true,
    description:
      "Éléments toxiques présents naturellement ou issus de l'activité humaine.",
    risquesSante: "Cancers, atteintes neurologiques, troubles rénaux.",
    regulation:
      "Réglementation stricte selon le métal (Plomb, Mercure, Cadmium, etc.).",
    sourcesExposition:
      "Pollution industrielle, anciennes canalisations, alimentation.",
    resultats: {
      // disable -> pas de résultats
    },
    enfants: [
      {
        id: "arsenic",
        nomAffichage: "Arsenic",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description: "Métal toxique d'origine naturelle et industrielle.",
        risquesSante: "Cancérigène avéré, toxicité chronique.",
        regulation: "Limite de 10 µg/L en eau potable.",
        sourcesExposition: "Eau souterraine, pesticides, industries.",
        sousCategories: false,
        resultats: {
          non_quantifie: {
            label: "Aucun paramètre quantifié",
            couleur: "#75D3B4",
            couleurFond: "#75D3B4",
            picto: null,
          },
          limite_qualite: {
            label:
              "Au moins un paramètre quantifié mais aucun dépassement des valeurs seuils",
            couleur: "#B4E681",
            couleurFond: "#B4E681",
            picto: null,
          },
          limite_sanitaire: {
            label:
              "Au moins un paramètre au-dessus de la limite sanitaire (norme ou recommandation)",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
        },
      },
      {
        id: "plomb",
        nomAffichage: "Plomb",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Métal autrefois utilisé dans les canalisations et peintures.",
        risquesSante:
          "Neurotoxique, saturnisme, atteintes rénales et cardiovasculaires.",
        regulation:
          "Interdit dans l'essence et les peintures, limite de 10 µg/L en eau potable.",
        sourcesExposition:
          "Vieilles canalisations, pollution industrielle, sol contaminé.",
        sousCategories: false,
        resultats: {
          non_quantifie: {
            label: "Aucun paramètre quantifié",
            couleur: "#75D3B4",
            couleurFond: "#75D3B4",
            picto: null,
          },
          limite_qualite: {
            label:
              "Au moins un paramètre quantifié mais aucun dépassement des valeurs seuils",
            couleur: "#B4E681",
            couleurFond: "#B4E681",
            picto: null,
          },
          limite_sanitaire: {
            label:
              "Au moins un paramètre au-dessus de la limite sanitaire (norme ou recommandation)",
            couleur: "#FB726C",
            couleurFond: "#FB726C",
            picto: "red cross",
          },
        },
      },
    ],
  },
];

export function getCategoryById(
  id: string,
  categories: ICategory[] = availableCategories,
): ICategory | undefined {
  // First, check if the category exists at the current level
  const foundCategory = categories.find((category) => category.id === id);
  if (foundCategory) {
    return foundCategory;
  }

  // If not found, recursively search in children
  for (const category of categories) {
    if (category.enfants && category.enfants.length > 0) {
      const foundInChildren = getCategoryById(id, category.enfants);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  // Not found anywhere
  return undefined;
}
