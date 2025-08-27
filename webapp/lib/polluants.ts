interface Polluant {
  nomPolluant: string;
  valeurPolluant?: string | null;
}

interface BlocStatut {
  nomBloc: string;
  couleurBloc: string;
  pictoBloc: string | null;
  polluants: Polluant[];
}

interface DetailResultat {
  label: string;
  couleur: string;
  couleurAlt: string;
  picto?: string | null;
  affichageBlocPageUDI?: boolean;
  sousCategorie?: boolean;
}

interface RatioLimite {
  limite: number;
  label: string;
  couleur: string;
  couleurAlt: string;
}

interface ResultatsAnnuels {
  nonRechercheLabel: string;
  nonRechercheCouleur: string;
  nonRechercheCouleurAlt: string;
  ratioLimites: RatioLimite[];
  ratioLabelSingular: string;
  ratioLabelPlural: string;
  valeurSanitaire: boolean;
  valeurSanitaireLabel?: string;
  valeurSanitaireCouleur?: string;
  valeurSanitaireCouleurAlt?: string;
  simpleLabels?: Array<{
    label: string;
    couleur: string;
  }>;
}

export interface ICategory {
  id: string;
  nomAffichage: string;
  disable: boolean;
  enfants: ICategory[];
  affichageBlocPageUDI: boolean;
  description: string;
  detailsLegende?: string;
  sousCategories?: boolean;
  titreStatut?: string;
  descriptionStatut?: string;
  couleurStatut?: string;
  couleurAltStatut?: string;
  picto?: string | null;
  dateDernierPrelèvement?: string;
  nombrePolluantsDernierPrelèvement?: number;
  blocsStatut?: BlocStatut[];
  resultats: { [key: string]: DetailResultat };
  resultatsAnnuels?: ResultatsAnnuels;
  unite?: string;
}

export const availableCategories: ICategory[] = [
  {
    id: "tous",
    nomAffichage: "Tous polluants",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Ensemble des substances chimiques et biologiques pouvant contaminer l'eau, l'air et les sols.",
    resultats: {
      non_recherche: {
        label: "Aucun polluants recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      inf_limites: {
        label: "Aucun dépassement des limites réglementaire",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      sup_limite_qualite: {
        label: "Au moins un dépassement des limites réglementaire",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: "warning",
      },
      sup_limite_sanitaire: {
        label: "Au moins un dépassement des limites sanitaires",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#cccccc",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#74c476", couleurAlt: "#c7e9c0" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fdbe85",
          couleurAlt: "#fdae6b",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fd8d3c",
          couleurAlt: "#fd8d3c",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#e6550d",
          couleurAlt: "#f16913",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#a63603",
          couleurAlt: "#d94801",
        },
      ],
      ratioLabelSingular: "analyse non conforme",
      ratioLabelPlural: "analyses non conformes",
      valeurSanitaire: true,
      valeurSanitaireLabel:
        "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
      valeurSanitaireCouleur: "#f03b20",
      valeurSanitaireCouleurAlt: "#bd0026",
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
    unite: "µg/L",
    detailsLegende:
      "* Limite non réglementaire, recommandée par le Haut Conseil de la Santé Publique (HCSP) \n** Eau conforme à la limite réglementaire mais qui dépasse la limite recommandée par le HCSP",
    resultats: {
      non_recherche: {
        label: "Non recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      non_quantifie: {
        label: "Aucun PFAS quantifié",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      somme_20pfas_inf_0_1_et_4pfas_inf_0_02: {
        label:
          "Au moins un PFAS quantifié mais les concentrations sont inférieures aux limites réglementaire et recommandée",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      somme_20pfas_inf_0_1_et_4pfas_sup_0_02: {
        label:
          "La somme des 4 PFAS (PFOA, PFOS, PFNA, PFHxS) > 0,02 µg/L* mais la somme des 20 PFAS < 0,1 µg/L**",
        couleur: "#FDC70C",
        couleurAlt: "#FDC70C",
        picto: null,
      },
      somme_20pfas_sup_0_1: {
        label:
          "Somme des 20 PFAS > 0,1 µg/L (eau non conforme à la limite réglementaire)",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: null,
      },
      sup_valeur_sanitaire: {
        label: "Au moins un PFAS dépasse la limite sanitaire",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#cccccc",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#74c476", couleurAlt: "#c7e9c0" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fdbe85",
          couleurAlt: "#fdae6b",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fd8d3c",
          couleurAlt: "#fd8d3c",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#e6550d",
          couleurAlt: "#f16913",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#a63603",
          couleurAlt: "#d94801",
        },
      ],
      ratioLabelSingular: "analyse non conforme",
      ratioLabelPlural: "analyses non conformes",
      valeurSanitaire: true,
      valeurSanitaireLabel:
        "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
      valeurSanitaireCouleur: "#f03b20",
      valeurSanitaireCouleurAlt: "#bd0026",
    },
  },
  {
    id: "pesticide",
    nomAffichage: "Pesticides",
    disable: false,
    affichageBlocPageUDI: true,
    description:
      "Substances chimiques utilisées pour lutter contre les nuisibles agricoles.",
    unite: "µg/L",
    resultats: {
      non_recherche: {
        label: "Non recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      non_quantifie: {
        label: "Aucun pesticide quantifié",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      inf_limite_qualite: {
        label:
          "Au moins un pesticide quantifié mais sans dépassement de la limite réglementaire",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      sup_limite_qualite: {
        label: "Au moins un pesticide dépasse la limite réglementaire",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: "warning",
      },
      sup_valeur_sanitaire: {
        label: "Au moins un pesticide dépasse la limite sanitaire",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#cccccc",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#74c476", couleurAlt: "#c7e9c0" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fdbe85",
          couleurAlt: "#fdae6b",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fd8d3c",
          couleurAlt: "#fd8d3c",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#e6550d",
          couleurAlt: "#f16913",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#a63603",
          couleurAlt: "#d94801",
        },
      ],
      ratioLabelSingular: "analyse non conforme",
      ratioLabelPlural: "analyses non conformes",
      valeurSanitaire: true,
      valeurSanitaireLabel:
        "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
      valeurSanitaireCouleur: "#f03b20",
      valeurSanitaireCouleurAlt: "#bd0026",
    },
    enfants: [
      {
        id: "sub_active",
        nomAffichage: "Substances actives",
        disable: false,
        affichageBlocPageUDI: false,
        enfants: [],
        description:
          "Molécules ayant un effet biocide contre les organismes nuisibles.",
        sousCategories: true,
        unite: "µg/L",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          non_quantifie: {
            label: "Aucune substance active quantifiée",
            couleur: "#74c476",
            couleurAlt: "#c7e9c0",
            picto: null,
          },
          inf_limite_qualite: {
            label:
              "Au moins une substance active quantifiée mais sans dépassement de la limite réglementaire",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label:
              "Au moins une substance active dépasse la limite réglementaire",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label: "Au moins une substance active dépasse la limite sanitaire",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#cccccc",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fdbe85",
              couleurAlt: "#fdae6b",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fd8d3c",
              couleurAlt: "#fd8d3c",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#e6550d",
              couleurAlt: "#f16913",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#a63603",
              couleurAlt: "#d94801",
            },
          ],
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaire: true,
          valeurSanitaireLabel:
            "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
          valeurSanitaireCouleur: "#f03b20",
          valeurSanitaireCouleurAlt: "#bd0026",
        },
      },
      {
        id: "metabolite",
        nomAffichage: "Métabolites",
        disable: false,
        affichageBlocPageUDI: false,
        description: "Produits de dégradation des substances actives.",
        sousCategories: false,
        unite: "µg/L",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          non_quantifie: {
            label: "Aucun métabolite quantifié",
            couleur: "#74c476",
            couleurAlt: "#c7e9c0",
            picto: null,
          },
          inf_limites: {
            label:
              "Au moins un métabolite quantifié sans dépassement de la limite réglementaire ou indicative",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_indicative: {
            label:
              "Au moins un métabolite non-pertinent dépasse la limite indicative de 0,9 µg/L",
            couleur: "#FDC70C",
            couleurAlt: "#FDC70C",
            picto: null,
          },
          sup_limite_qualite: {
            label:
              "Au moins un métabolite pertinent dépasse la limite de qualité de 0,1 µg/L (eau non conforme)",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label: "Au moins un métabolite dépasse la limite sanitaire",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#cccccc",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fdbe85",
              couleurAlt: "#fdae6b",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fd8d3c",
              couleurAlt: "#fd8d3c",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#e6550d",
              couleurAlt: "#f16913",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#a63603",
              couleurAlt: "#d94801",
            },
          ],
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaire: true,
          valeurSanitaireLabel:
            "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
          valeurSanitaireCouleur: "#f03b20",
          valeurSanitaireCouleurAlt: "#bd0026",
        },
        enfants: [
          {
            id: "metabolite_esa_metolachlore",
            nomAffichage: "ESA-métolachlore",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: false,
            description: "Métabolite du métolachlore, herbicide.",
            detailsLegende:
              "* Si l'ESA métolachlore était considéré comme un métabolite pertinent, l'eau serait déclarée \"non conforme\".",
            sousCategories: false,
            unite: "µg/L",
            resultats: {
              non_recherche: {
                label: "Non recherché dans les 12 derniers mois",
                couleur: "#cccccc",
                couleurAlt: "#f7f7f7",
                picto: null,
              },
              non_quantifie: {
                label: "Non quantifié",
                couleur: "#74c476",
                couleurAlt: "#c7e9c0",
                picto: null,
              },
              inf_limites: {
                label: "Concentration < 0,1 µg/L",
                couleur: "#FFF33B",
                couleurAlt: "#FFF33B",
                picto: null,
              },
              inf_limites_sup_0_1: {
                label: "Concentration comprise entre 0,1 et 0,9 µg/L*",
                couleur: "#FDC70C",
                couleurAlt: "#FDC70C",
                picto: null,
              },
              sup_limite_indicative: {
                label:
                  "Concentration > 0,9 µg/L (dépassement de la limite indicative)",
                couleur: "#fe9929",
                couleurAlt: "#fe9929",
                picto: "warning",
              },
              sup_valeur_sanitaire: {
                label:
                  "Concentration > 3 µg/L (dépassement de la valeur sanitaire)",
                couleur: "#f03b20",
                couleurAlt: "#bd0026",
                picto: "warning",
              },
            },
            resultatsAnnuels: {
              nonRechercheLabel: "Aucune recherche dans l'année",
              nonRechercheCouleur: "#cccccc",
              nonRechercheCouleurAlt: "#f7f7f7",
              ratioLimites: [
                {
                  limite: 0,
                  label: "0%",
                  couleur: "#74c476",
                  couleurAlt: "#c7e9c0",
                },
                {
                  limite: 0.25,
                  label: "≤ 25%",
                  couleur: "#fdbe85",
                  couleurAlt: "#fdae6b",
                },
                {
                  limite: 0.5,
                  label: "25 - 50%",
                  couleur: "#fd8d3c",
                  couleurAlt: "#fd8d3c",
                },
                {
                  limite: 0.75,
                  label: "50 - 75%",
                  couleur: "#e6550d",
                  couleurAlt: "#f16913",
                },
                {
                  limite: 1,
                  label: "75 - 100%",
                  couleur: "#a63603",
                  couleurAlt: "#d94801",
                },
              ],
              ratioLabelSingular: "analyse non conforme",
              ratioLabelPlural: "analyses non conformes",
              valeurSanitaire: true,
              valeurSanitaireLabel:
                "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
              valeurSanitaireCouleur: "#f03b20",
              valeurSanitaireCouleurAlt: "#bd0026",
            },
          },
          {
            id: "metabolite_chlorothalonil_r471811",
            nomAffichage: "Chlorothalonil R471811",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description: "Métabolite du fongicide chlorothalonil.",
            detailsLegende:
              '* Si le Chlorothalonil R471811 était considéré comme un métabolite pertinent, l\'eau serait déclarée "non conforme".',
            sousCategories: false,
            unite: "µg/L",
            resultats: {
              non_recherche: {
                label: "Non recherché dans les 12 derniers mois",
                couleur: "#cccccc",
                couleurAlt: "#f7f7f7",
                picto: null,
              },
              non_quantifie: {
                label: "Non quantifié",
                couleur: "#74c476",
                couleurAlt: "#c7e9c0",
                picto: null,
              },
              inf_limites: {
                label: "Concentration < 0,1 µg/L",
                couleur: "#FFF33B",
                couleurAlt: "#FFF33B",
                picto: null,
              },
              inf_limites_sup_0_1: {
                label: "Concentration comprise entre 0,1 et 0,9 µg/L*",
                couleur: "#FDC70C",
                couleurAlt: "#FDC70C",
                picto: null,
              },
              sup_limite_indicative: {
                label:
                  "Concentration > 0,9 µg/L (dépassement de la limite indicative)",
                couleur: "#fe9929",
                couleurAlt: "#fe9929",
                picto: "warning",
              },
              sup_valeur_sanitaire: {
                label:
                  "Concentration > 3 µg/L (dépassement de la valeur sanitaire)",
                couleur: "#f03b20",
                couleurAlt: "#bd0026",
                picto: "warning",
              },
            },
            resultatsAnnuels: {
              nonRechercheLabel: "Aucune recherche dans l'année",
              nonRechercheCouleur: "#cccccc",
              nonRechercheCouleurAlt: "#f7f7f7",
              ratioLimites: [
                {
                  limite: 0,
                  label: "0%",
                  couleur: "#74c476",
                  couleurAlt: "#c7e9c0",
                },
                {
                  limite: 0.25,
                  label: "≤ 25%",
                  couleur: "#fdbe85",
                  couleurAlt: "#fdae6b",
                },
                {
                  limite: 0.5,
                  label: "25 - 50%",
                  couleur: "#fd8d3c",
                  couleurAlt: "#fd8d3c",
                },
                {
                  limite: 0.75,
                  label: "50 - 75%",
                  couleur: "#e6550d",
                  couleurAlt: "#f16913",
                },
                {
                  limite: 1,
                  label: "75 - 100%",
                  couleur: "#a63603",
                  couleurAlt: "#d94801",
                },
              ],
              ratioLabelSingular: "analyse non conforme",
              ratioLabelPlural: "analyses non conformes",
              valeurSanitaire: true,
              valeurSanitaireLabel:
                "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
              valeurSanitaireCouleur: "#f03b20",
              valeurSanitaireCouleurAlt: "#bd0026",
            },
          },
          {
            id: "metabolite_chloridazone_desphenyl",
            nomAffichage: "Chloridazone desphényl",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description:
              "Métabolite de la chloridazone, herbicide utilisé pour les betteraves.",
            sousCategories: false,
            unite: "µg/L",
            resultats: {
              non_recherche: {
                label: "Non recherché dans les 12 derniers mois",
                couleur: "#cccccc",
                couleurAlt: "#f7f7f7",
                picto: null,
              },
              non_quantifie: {
                label: "Non quantifié",
                couleur: "#74c476",
                couleurAlt: "#c7e9c0",
                picto: null,
              },
              inf_limites: {
                label: "Concentration < 0,1 µg/L",
                couleur: "#FFF33B",
                couleurAlt: "#FFF33B",
                picto: null,
              },
              sup_limite_qualite: {
                label:
                  "Concentration > 0,1 µg/L (dépassement de la limite de qualité, eau non conforme)",
                couleur: "#fe9929",
                couleurAlt: "#fe9929",
                picto: "warning",
              },
              sup_valeur_sanitaire: {
                label:
                  "Concentration > 11 µg/L (dépassement de la valeur sanitaire)",
                couleur: "#f03b20",
                couleurAlt: "#bd0026",
                picto: "red cross",
              },
            },
            resultatsAnnuels: {
              nonRechercheLabel: "Aucune recherche dans l'année",
              nonRechercheCouleur: "#cccccc",
              nonRechercheCouleurAlt: "#f7f7f7",
              ratioLimites: [
                {
                  limite: 0,
                  label: "0%",
                  couleur: "#74c476",
                  couleurAlt: "#c7e9c0",
                },
                {
                  limite: 0.25,
                  label: "≤ 25%",
                  couleur: "#fdbe85",
                  couleurAlt: "#fdae6b",
                },
                {
                  limite: 0.5,
                  label: "25 - 50%",
                  couleur: "#fd8d3c",
                  couleurAlt: "#fd8d3c",
                },
                {
                  limite: 0.75,
                  label: "50 - 75%",
                  couleur: "#e6550d",
                  couleurAlt: "#f16913",
                },
                {
                  limite: 1,
                  label: "75 - 100%",
                  couleur: "#a63603",
                  couleurAlt: "#d94801",
                },
              ],
              ratioLabelSingular: "analyse non conforme",
              ratioLabelPlural: "analyses non conformes",
              valeurSanitaire: true,
              valeurSanitaireLabel:
                "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
              valeurSanitaireCouleur: "#f03b20",
              valeurSanitaireCouleurAlt: "#bd0026",
            },
          },
          {
            id: "metabolite_chloridazone_methyl_desphenyl",
            nomAffichage: "Chloridazone methyl desphényl",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description: "Autre métabolite de la chloridazone.",
            sousCategories: false,
            unite: "µg/L",
            resultats: {
              non_recherche: {
                label: "Non recherché dans les 12 derniers mois",
                couleur: "#cccccc",
                couleurAlt: "#f7f7f7",
                picto: null,
              },
              non_quantifie: {
                label: "Non quantifié",
                couleur: "#74c476",
                couleurAlt: "#c7e9c0",
                picto: null,
              },
              inf_limites: {
                label: "Concentration < 0,1 µg/L",
                couleur: "#FFF33B",
                couleurAlt: "#FFF33B",
                picto: null,
              },
              sup_limite_qualite: {
                label:
                  "Concentration > 0, 1 µg/L (dépassement de la limite de qualité, eau non conforme)",
                couleur: "#fe9929",
                couleurAlt: "#fe9929",
                picto: "warning",
              },
              sup_valeur_sanitaire: {
                label:
                  "Concentration > 110 µg/L (dépassement de la valeur sanitaire)",
                couleur: "#f03b20",
                couleurAlt: "#bd0026",
                picto: "red cross",
              },
            },
            resultatsAnnuels: {
              nonRechercheLabel: "Aucune recherche dans l'année",
              nonRechercheCouleur: "#cccccc",
              nonRechercheCouleurAlt: "#f7f7f7",
              ratioLimites: [
                {
                  limite: 0,
                  label: "0%",
                  couleur: "#74c476",
                  couleurAlt: "#c7e9c0",
                },
                {
                  limite: 0.25,
                  label: "≤ 25%",
                  couleur: "#fdbe85",
                  couleurAlt: "#fdae6b",
                },
                {
                  limite: 0.5,
                  label: "25 - 50%",
                  couleur: "#fd8d3c",
                  couleurAlt: "#fd8d3c",
                },
                {
                  limite: 0.75,
                  label: "50 - 75%",
                  couleur: "#e6550d",
                  couleurAlt: "#f16913",
                },
                {
                  limite: 1,
                  label: "75 - 100%",
                  couleur: "#a63603",
                  couleurAlt: "#d94801",
                },
              ],
              ratioLabelSingular: "analyse non conforme",
              ratioLabelPlural: "analyses non conformes",
              valeurSanitaire: true,
              valeurSanitaireLabel:
                "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
              valeurSanitaireCouleur: "#f03b20",
              valeurSanitaireCouleurAlt: "#bd0026",
            },
          },
          {
            id: "metabolite_atrazine_desethyl",
            nomAffichage: "Atrazine déséthyl",
            disable: false,
            enfants: [],
            affichageBlocPageUDI: true,
            description:
              "Métabolite de l'atrazine, herbicide interdit depuis 2003.",
            sousCategories: false,
            unite: "µg/L",
            resultats: {
              non_recherche: {
                label: "Non recherché dans les 12 derniers mois",
                couleur: "#cccccc",
                couleurAlt: "#f7f7f7",
                picto: null,
              },
              non_quantifie: {
                label: "Non quantifié",
                couleur: "#74c476",
                couleurAlt: "#c7e9c0",
                picto: null,
              },
              inf_limites: {
                label: "Concentration < 0,1 µg/L",
                couleur: "#FFF33B",
                couleurAlt: "#FFF33B",
                picto: null,
              },
              sup_limite_qualite: {
                label:
                  "Concentration > 0,1 µg/L (dépassement de la limite de qualité, eau non conforme)",
                couleur: "#fe9929",
                couleurAlt: "#fe9929",
                picto: "warning",
              },
              sup_valeur_sanitaire: {
                label:
                  "Concentration > 60 µg/L (dépassement de la valeur sanitaire)",
                couleur: "#f03b20",
                couleurAlt: "#bd0026",
                picto: "red cross",
              },
            },
            resultatsAnnuels: {
              nonRechercheLabel: "Aucune recherche dans l'année",
              nonRechercheCouleur: "#cccccc",
              nonRechercheCouleurAlt: "#f7f7f7",
              ratioLimites: [
                {
                  limite: 0,
                  label: "0%",
                  couleur: "#74c476",
                  couleurAlt: "#c7e9c0",
                },
                {
                  limite: 0.25,
                  label: "≤ 25%",
                  couleur: "#fdbe85",
                  couleurAlt: "#fdae6b",
                },
                {
                  limite: 0.5,
                  label: "25 - 50%",
                  couleur: "#fd8d3c",
                  couleurAlt: "#fd8d3c",
                },
                {
                  limite: 0.75,
                  label: "50 - 75%",
                  couleur: "#e6550d",
                  couleurAlt: "#f16913",
                },
                {
                  limite: 1,
                  label: "75 - 100%",
                  couleur: "#a63603",
                  couleurAlt: "#d94801",
                },
              ],
              ratioLabelSingular: "analyse non conforme",
              ratioLabelPlural: "analyses non conformes",
              valeurSanitaire: true,
              valeurSanitaireLabel:
                "Au moins 1 dépassement de valeur sanitaire au cours de l'année",
              valeurSanitaireCouleur: "#f03b20",
              valeurSanitaireCouleurAlt: "#bd0026",
            },
          },
        ],
      },
    ],
  },
  {
    id: "nitrate",
    nomAffichage: "Nitrates",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Résidus azotés provenant des engrais et des déchets organiques.",
    unite: "mg/L",
    resultats: {
      non_recherche: {
        label: "Non recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      non_quantifie: {
        label: "Non quantifié",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      no3_inf_25: {
        label: "Concentration < 25 mg/L",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      no3_inf_40: {
        label: "Concentration comprise entre 25 et 40 mg/L",
        couleur: "#FDC70C",
        couleurAlt: "#FDC70C",
        picto: null,
      },
      inf_valeur_sanitaire: {
        label: "Concentration comprise entre 40 et 50 mg/L",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: null,
      },
      sup_valeur_sanitaire: {
        label:
          "Concentration > 50 mg/L (eau non conforme devant être déconseillée à la consommation pour les femmes enceintes et les nourrissons)",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#cccccc",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#74c476", couleurAlt: "#c7e9c0" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fcae91",
          couleurAlt: "#fc9272",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fb6a4a",
          couleurAlt: "#fb6a4a",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#de2d26",
          couleurAlt: "#ef3b2c",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#a50f15",
          couleurAlt: "#cb181d",
        },
      ],
      ratioLabelSingular: "analyse non conforme",
      ratioLabelPlural: "analyses non conformes",
      valeurSanitaire: false,
    },
  },
  {
    id: "cvm",
    nomAffichage: "CVM",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description: "Utilisé pour produire le PVC, polluant volatil.",
    unite: "µg/L",
    resultats: {
      non_recherche: {
        label: "Non recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      non_quantifie: {
        label: "Non quantifié",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      inf_0_5: {
        label:
          "Concentration < 0,5 µg/L (eau conforme à la limite réglementaire et sanitaire)",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      sup_0_5: {
        label:
          "Concentration > 0,5 µg/L (eau non conforme à la limite réglementaire et sanitaire)",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#cccccc",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#74c476", couleurAlt: "#c7e9c0" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fdbe85",
          couleurAlt: "#fdae6b",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fd8d3c",
          couleurAlt: "#fd8d3c",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#e6550d",
          couleurAlt: "#f16913",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#a63603",
          couleurAlt: "#d94801",
        },
      ],
      ratioLabelSingular: "analyse non conforme",
      ratioLabelPlural: "analyses non conformes",
      valeurSanitaire: false,
    },
  },
  {
    id: "sub_indus",
    nomAffichage: "Substances industrielles",
    disable: true,
    affichageBlocPageUDI: true,
    description: "Composés chimiques issus des processus industriels.",
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
        sousCategories: true,
        unite: "µg/L",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          non_quantifie: {
            label: "Non quantifié",
            couleur: "#74c476",
            couleurAlt: "#c7e9c0",
            picto: null,
          },
          inf_valeur_sanitaire: {
            label: "Concentration < 0,35 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_valeur_sanitaire: {
            label:
              "Concentration > 0,35 µg/L (dépassement de la limite sanitaire préconisée par l'agence américaine de protection de l'environnement)",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#cccccc",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fdbe85",
              couleurAlt: "#fdae6b",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fd8d3c",
              couleurAlt: "#fd8d3c",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#e6550d",
              couleurAlt: "#f16913",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#a63603",
              couleurAlt: "#d94801",
            },
          ],
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaire: false,
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
        sousCategories: true,
        unite: "µg/L",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          non_quantifie: {
            label: "Non quantifié",
            couleur: "#74c476",
            couleurAlt: "#c7e9c0",
            picto: null,
          },
          inf_valeur_sanitaire: {
            label: "Concentration < 4 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_valeur_sanitaire: {
            label:
              "Concentration comprise entre 4 µg/L et 15 µg/L (l'eau ne doit pas être utilisée pour la préparation des biberons des nourrissons de moins de 6 mois)",
            couleur: "#FB726C",
            couleurAlt: "#FB726C",
            picto: "red cross",
          },
          sup_valeur_sanitaire_2: {
            label:
              "Concentration > 15 µg/L (l'eau ne doit pas être utilisée pour la préparation des biberons des nourrissons de moins de 6 mois ni consommée par les femmes enceintes et allaitantes)",
            couleur: "#FC3127",
            couleurAlt: "#FC3127",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#cccccc",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fdbe85",
              couleurAlt: "#fdae6b",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fd8d3c",
              couleurAlt: "#fd8d3c",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#e6550d",
              couleurAlt: "#f16913",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#a63603",
              couleurAlt: "#d94801",
            },
          ],
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaire: false,
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
    unite: "µg/L",
    resultats: {
      // disable -> pas de résultats
    },
    enfants: [
      {
        id: "metaux_lourds_as",
        nomAffichage: "Arsenic",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description: "Métal toxique d'origine naturelle et industrielle.",
        sousCategories: false,
        unite: "µg/L",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          non_quantifie: {
            label: "Non quantifié",
            couleur: "#74c476",
            couleurAlt: "#c7e9c0",
            picto: null,
          },
          inf_limite_qualite: {
            label:
              "Concentration < 10 µg/L (eau conforme à la limite réglementaire)",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label:
              "Concentration comprise entre 10 µg/L et 13 µg/L (eau non conforme à la limite réglementaire mais peut être utilisée pour les usages alimentaires)",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label:
              "Concentration > 13 µg/L (eau ne pouvant être utilisée pour les usages alimentaires)",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#cccccc",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fdbe85",
              couleurAlt: "#fdae6b",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fd8d3c",
              couleurAlt: "#fd8d3c",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#e6550d",
              couleurAlt: "#f16913",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#a63603",
              couleurAlt: "#d94801",
            },
          ],
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaire: false,
        },
      },
      {
        id: "metaux_lourds_pb",
        nomAffichage: "Plomb",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Métal autrefois utilisé dans les canalisations et peintures.",
        detailsLegende:
          "* Une nouvelle limite réglementaire fixée à 5 µg/L s'appliquera en 2036. D'ici cette date, la limite actuelle de 10 µg/L continue de s'appliquer.",
        sousCategories: false,
        unite: "µg/L",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          non_quantifie: {
            label: "Non quantifié",
            couleur: "#74c476",
            couleurAlt: "#c7e9c0",
            picto: null,
          },
          inf_limite_qualite: {
            label: "Concentration < 5 µg/L*",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite_2036: {
            label: "Concentration comprise entre 5 µg/L et 10 µg/L*",
            couleur: "#FDC70C",
            couleurAlt: "#FDC70C",
            picto: null,
          },
          sup_limite_qualite: {
            label:
              "Concentration > 10 µg/L (eau non conforme à la limite réglementaire actuellement en vigueur)",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#cccccc",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fdbe85",
              couleurAlt: "#fdae6b",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fd8d3c",
              couleurAlt: "#fd8d3c",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#e6550d",
              couleurAlt: "#f16913",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#a63603",
              couleurAlt: "#d94801",
            },
          ],
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaire: false,
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

// Helper function to get all enabled categories recursively, excluding "tous"
export const getAllEnabledCategories = (
  categories: ICategory[] = availableCategories,
): ICategory[] => {
  const result: ICategory[] = [];

  for (const category of categories) {
    if (!category.disable && category.id !== "tous") {
      result.push(category);
    }

    // Recursively add children
    if (category.enfants && category.enfants.length > 0) {
      result.push(...getAllEnabledCategories(category.enfants));
    }
  }

  return result;
};
