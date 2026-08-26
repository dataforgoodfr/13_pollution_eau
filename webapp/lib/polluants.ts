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
  topLegend?: string;
  nonRechercheLabel: string;
  nonRechercheCouleur: string;
  nonRechercheCouleurAlt: string;
  ratioLimites: RatioLimite[];
  ratioLabelSingular: string;
  ratioLabelPlural: string;
  details?: string;
  valeurSanitaireLabel?: string;
}

// Regroupe des sous-catégories par intention utilisateur ("que souhaitez-vous
// savoir ?"). `label` permet d'afficher un libellé plus court ou plus parlant
// que le `nomAffichage` de la catégorie référencée par `id`.
export interface ICategoryGroupOption {
  id: string;
  label: string;
}

export interface ICategoryGroup {
  titre: string;
  options: ICategoryGroupOption[];
}

export interface ICategory {
  id: string;
  nomAffichage: string;
  disable: boolean;
  enfants: ICategory[];
  groupes?: ICategoryGroup[];
  affichageBlocPageUDI: boolean;
  description: string;
  lienExterne?: string;
  resultatsDetails?: string;
  titreStatut?: string;
  descriptionStatut?: string;
  couleurStatut?: string;
  couleurAltStatut?: string;
  picto?: string | null;
  resultatsTopLegend?: string;
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
      "Dans « tous polluants », nous regroupont les principaux polluants chimiques de l'eau potable : pesticides, nitrates, PFAS, CVM et perchlorates. La qualité de l'eau y est évaluée au regard des limites de qualité fixées par la réglementation et des limites sanitaires établies par les autorités de santé.",
    resultatsDetails:
      "* Pesticides, PFAS, CVM, et Perchlorate non quantifiés ; Nitrates non quantifiés ou  <=10 mg/L\n** D'après les recommandations du Ministère de la Santé ou du Haut Conseil de la Santé Publique",
    resultatsTopLegend:
      "Cette carte montre l'état actuel de l'eau d'après les dernières analyses disponibles pour chaque polluant : sa conformité aux limites de qualité réglementaires et les situations pour lesquelles l'eau devrait être déconseillée à la consommation. Chaque zone est classée d'après l'ensemble des polluants recherchés : c'est le résultat le plus défavorable qui détermine sa couleur.",
    resultats: {
      non_recherche: {
        label: "Aucun polluant recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      non_quantifie: {
        label: "Aucun polluant quantifié*",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      quantifie: {
        label: "Au moins un polluant quantifié, sous les limites de qualité",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      sup_limite_qualite: {
        label: "Dépassement d'une limite de qualité — eau non conforme",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: "warning",
      },
      sup_limite_sanitaire: {
        label:
          "Eau devant être déconseillée à la consommation pour toute ou partie de la population**",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#d9d9d9",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#ffffd4", couleurAlt: "#ffffd4" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fed98e",
          couleurAlt: "#fed98e",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#d95f0e",
          couleurAlt: "#d95f0e",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#993404",
          couleurAlt: "#993404",
        },
      ],
      ratioLabelSingular: "analyse non conforme",
      ratioLabelPlural: "analyses non conformes",
      topLegend:
        "Cette carte montre sur une année le pourcentage des analyses non conformes à la réglementation en vigueur cette année-là, pour au moins un des polluants suivis.",
      valeurSanitaireLabel:
        "la limite devant entraîner des restrictions de consommation",
    },
  },
  {
    id: "pfas",
    nomAffichage: "PFAS",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Les PFAS sont des substances chimiques très persistantes, utilisées depuis les années 1950 pour leurs propriétés antiadhésives, antitaches et résistantes à la chaleur, et aujourd'hui largement présentes dans l'environnement.",
    unite: "µg/L",
    resultatsDetails:
      "* Somme des 20 PFAS = 0,1 µg/L\n** Somme des 4 PFAS (PFOA, PFOS, PFNA, PFHxS) = 0,02 µg/L\nHCSP: Haut Conseil de la Santé Publique",
    resultatsTopLegend:
      "Cette carte montre les concentrations en PFAS mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles. Chaque zone est classée d'après l'ensemble des PFAS recherchés : c'est le résultat le plus défavorable qui détermine sa couleur.",
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
      somme_20pfas_inf_0_1_et_4pfas_inf_0_02: {
        label: "Quantifié, sous la limite de qualité* et la limite HCSP**",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      somme_20pfas_inf_0_1_et_4pfas_sup_0_02: {
        label: "Dépassement de la seule limite HCSP**",
        couleur: "#FDC70C",
        couleurAlt: "#FDC70C",
        picto: null,
      },
      somme_20pfas_sup_0_1: {
        label: "Dépassement de la limite de qualité* — eau non conforme",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: null,
      },
      sup_valeur_sanitaire: {
        label:
          "Dépassement d'une limite sanitaire — eau devant être déconseillée à la consommation",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#d9d9d9",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#ffffd4", couleurAlt: "#ffffd4" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fed98e",
          couleurAlt: "#fed98e",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#d95f0e",
          couleurAlt: "#d95f0e",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#993404",
          couleurAlt: "#993404",
        },
      ],
      ratioLabelSingular: "analyse non conforme*",
      ratioLabelPlural: "analyses non conformes*",
      details: "* Somme des 20 PFAS > 0,1 µg/L",
      topLegend:
        "Cette carte montre sur une année le pourcentage des analyses pour lesquelles les concentrations en PFAS sont non conformes à la réglementation (supérieures à la limite de qualité de 0,1 µg/L pour la somme des 20 PFAS).",
      valeurSanitaireLabel: "une limite sanitaire",
    },
  },
  {
    id: "pesticide",
    nomAffichage: "Pesticides",
    disable: false,
    affichageBlocPageUDI: true,
    description:
      "Le terme 'pesticides' regroupe ici les substances actives des produits phytosanitaires et biocides (herbicides, insecticides, fongicides…) ainsi que les métabolites issus de leur dégradation. Leur usage entraîne une contamination diffuse des eaux, par ruissellement ou infiltration dans les sols.",
    unite: "µg/L",
    resultatsDetails:
      "* D'après les recommandations du Haut Conseil de la Santé Publique",
    resultatsTopLegend:
      "Cette carte montre les concentrations en pesticides mesurées dans l'eau au cours de la dernière analyse de pesticides dont les résultats sont disponibles. Chaque zone est classée d'après l'ensemble des pesticides recherchés : c'est le résultat le plus défavorable qui détermine sa couleur.",
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
        label: "Quantifié, sous les limites de qualité",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      sup_limite_qualite: {
        label: "Dépassement d'une limite de qualité — eau non conforme",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: "warning",
      },
      sup_valeur_sanitaire: {
        label: "Eau devant être déconseillée à la consommation*",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#d9d9d9",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#ffffd4", couleurAlt: "#ffffd4" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fed98e",
          couleurAlt: "#fed98e",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#d95f0e",
          couleurAlt: "#d95f0e",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#993404",
          couleurAlt: "#993404",
        },
      ],
      ratioLabelSingular: "analyse non conforme*",
      ratioLabelPlural: "analyses non conformes*",
      details:
        "* Au moins une substance active ou un métabolite pertinent > 0,1µg/L et/ou total pesticides réglementaire (somme des substances actives et métabolites pertinents) > 0,5 µg/L",
      topLegend:
        "Cette carte montre sur une année le pourcentage des analyses de pesticides pour lesquelles les concentrations sont non conformes à la réglementation (supérieures à 0,1 µg/L pour une substance active ou un métabolite pertinent, ou à 0,5 µg/L pour le total pesticides réglementaire).",
      valeurSanitaireLabel:
        "la limite devant entraîner des restrictions de consommation",
    },
    groupes: [
      {
        titre: "Connaître la conformité de l'eau à la réglementation pour…",
        options: [
          { id: "pesticide", label: "Tous les pesticides" },
          { id: "sub_active", label: "Substances actives uniquement" },
          { id: "metabolite_p", label: "Métabolites pertinents uniquement" },
          { id: "pes_total_reg", label: "Total pesticides réglementaire" },
        ],
      },
      {
        titre:
          "Connaître la concentration totale des pesticides présents dans l'eau",
        options: [{ id: "pes_total_ts", label: "Total tous pesticides" }],
      },
      {
        titre: "Connaître la concentration des métabolites non pertinents",
        options: [{ id: "metabolite_np", label: "Métabolites non pertinents" }],
      },
      {
        titre:
          "Visualiser les concentrations des 5 molécules les plus fréquemment retrouvées",
        options: [
          { id: "metabolite_esa_metolachlore", label: "ESA-métolachlore" },
          { id: "metabolite_chlorothalonil_r471811", label: "R471811" },
          {
            id: "metabolite_chloridazone_desphenyl",
            label: "Chloridazone desphényl",
          },
          {
            id: "metabolite_chloridazone_methyl_desphenyl",
            label: "Chloridazone méthyl desphényl",
          },
          { id: "metabolite_atrazine_desethyl", label: "Atrazine déséthyl" },
        ],
      },
    ],
    enfants: [
      {
        id: "sub_active",
        nomAffichage: "Substances actives",
        disable: false,
        affichageBlocPageUDI: false,
        enfants: [],
        description:
          "Les substances actives sont les molécules des pesticides ayant des propriétés herbicides, insecticides ou fongicides. Certaines sont très persistantes et se retrouvent dans l'eau potable des années après leur interdiction, comme l'atrazine interdite depuis 2003.",
        unite: "µg/L",
        resultatsDetails:
          "* D'après les recommandations du Haut Conseil de la Santé Publique",
        resultatsTopLegend:
          "Cette carte montre les concentrations en substances actives pesticides mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles. Elle n'indique ni les résultats des métabolites, ni ceux du total pesticides. Chaque zone est classée d'après l'ensemble des substances actives recherchées : c'est le résultat le plus défavorable qui détermine sa couleur.",
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
            label: "Quantifié, sous la limite de qualité",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label: "Dépassement de la limite de qualité — eau non conforme",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label: "Eau devant être déconseillée à la consommation*",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details: "* Au moins une substance active > 0,1 µg/L",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses pour lesquelles au moins une substance active dépasse la limite de qualité de 0,1 µg/L (eau non conforme).",
          valeurSanitaireLabel:
            "la limite devant entraîner des restrictions de consommation",
        },
      },
      {
        id: "metabolite_p",
        nomAffichage: "Métabolites pertinents",
        disable: false,
        affichageBlocPageUDI: false,
        description:
          "Les métabolites sont des substances issues de la dégradation des pesticides dans l'environnement. Ceux jugés « pertinents » par l'Anses — susceptibles d'engendrer un risque sanitaire inacceptable — doivent respecter la limite de qualité de 0,1 µg/L.",
        unite: "µg/L",
        resultatsDetails:
          "* D'après les recommandations du Haut Conseil de la Santé Publique",
        resultatsTopLegend:
          "Cette carte montre les concentrations en métabolites pertinents mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles. Elle n'indique ni les résultats des substances actives, ni ceux du total pesticides. Chaque zone est classée d'après l'ensemble des métabolites pertinents recherchés : c'est le résultat le plus défavorable qui détermine sa couleur.",
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
            label: "Quantifié, sous la limite de qualité",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label:
              "Dépassement de la limite de qualité de 0,1 µg/L — eau non conforme",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label: "Eau devant être déconseillée à la consommation*",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details: "* Au moins un métabolite pertinent > 0,1 µg/L",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses pour lesquelles au moins un métabolite dépasse la limite de qualité de 0,1 µg/L, selon la classification pertinent / non pertinent en vigueur cette année-là.",
          valeurSanitaireLabel:
            "la limite devant entraîner des restrictions de consommation",
        },
        enfants: [],
      },

      {
        id: "metabolite_np",
        nomAffichage: "Métabolites non pertinents",
        disable: false,
        affichageBlocPageUDI: false,
        description:
          "Les métabolites « non pertinents » sont des produits de dégradation des pesticides que l'Anses a jugés sans risque sanitaire inacceptable. Ils ne sont soumis qu'à une valeur « indicative » de 0,9 µg/L et ne sont pas comptés dans le total pesticides réglementaire.",
        unite: "µg/L",
        resultatsTopLegend:
          "Cette carte montre les concentrations en métabolites non pertinents mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles. Chaque zone est classée d'après l'ensemble des métabolites non pertinents recherchés : c'est le résultat le plus élevé qui détermine sa couleur.",
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
            label: "Quantifié, ≤ 0,1 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#fec44f",
            picto: null,
          },
          inf_limites_sup_0_1: {
            label: "Entre 0,1 et 0,9 µg/L",
            couleur: "#eedf00",
            couleurAlt: "#fe9929",
            picto: null,
          },
          sup_limite_indicative: {
            label: "Dépassement de la limite indicative de 0,9 µg/L",
            couleur: "#FDC70C",
            couleurAlt: "#d95f0e",
            picto: null,
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse > 0.9 µg/L",
          ratioLabelPlural: "analyses > 0.9 µg/L",
          details:
            '* Le dépassement de 0.9 µg/L n\'est pas considéré comme une "non conformité"',
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses pour lesquelles au moins un métabolite non pertinent dépasse la valeur indicative de 0,9 µg/L — un dépassement qui n'est pas considéré comme une non conformité par les autorités.",
        },
        enfants: [],
      },
      {
        id: "metabolite_esa_metolachlore",
        nomAffichage: "ESA-métolachlore",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: false,
        description:
          "L'ESA-métolachlore est un métabolite du S-métolachlore, herbicide très utilisé sur le maïs, le soja et le tournesol, interdit en France et en Europe depuis 2024. Jugé « pertinent » par l'Anses en 2019 puis « non pertinent » en 2022, alors que son potentiel cancérigène n'a jamais pu être évalué.",
        resultatsTopLegend:
          "Cette carte montre les concentrations en ESA-métolachlore mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles.",
        resultatsDetails:
          "* Si l'ESA métolachlore était considéré comme un métabolite pertinent, l'eau serait déclarée \"non conforme\" à partir de 0,1 µg/L. \n** La valeur de 3 µg/L, utilisée en Allemagne comme valeur de gestion, indique une contamination élevée.",
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
            label: "≤ 0,1 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#fec44f",
            picto: null,
          },
          inf_limites_sup_0_1: {
            label: "Entre 0,1 et 0,9 µg/L*",
            couleur: "#eedf00",
            couleurAlt: "#fe9929",
            picto: null,
          },
          sup_limite_indicative: {
            label: "> 0,9 µg/L — limite indicative dépassée",
            couleur: "#FDC70C",
            couleurAlt: "#d95f0e",
            picto: "warning",
          },
          metabolite_sup_3: {
            label: "> 3 µg/L**",
            couleur: "#d95f0e",
            couleurAlt: "#993404",
            picto: "warning",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details:
            "* Concentration > 0,1 µg/L lorsque l'ESA métolachlore était considéré pertinent (jusqu'en 2022). Le classement de l'ESA-métolachlore en non pertinent en 2022 explique pourquoi il n'y a plus de non conformité à partir de 2023.",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses d'ESA-métolachlore non conformes à la réglementation en vigueur cette année-là : la limite de qualité de 0,1 µg/L s'appliquait jusqu'en 2022, remplacée depuis 2023 par la valeur indicative de 0,9 µg/L, dont le dépassement n'est pas une non conformité.",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_chlorothalonil_r471811",
        nomAffichage: "Chlorothalonil R471811",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Le R471811 est un métabolite du chlorothalonil, fongicide très utilisé sur les céréales et interdit en France et en Europe depuis 2020. Jugé « pertinent » par l'Anses en 2022 puis « non pertinent » en 2024, sans qu'une évaluation complète de son potentiel cancérigène ait été faite.",
        resultatsTopLegend:
          "Cette carte montre les concentrations en chlorothalonil R471811 mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles.",
        resultatsDetails:
          '* Si le chlorothalonil R471811 était considéré comme un métabolite pertinent, l\'eau serait déclarée "non conforme" à partir de 0,1 µg/L. \n** La valeur de 3 µg/L, utilisée en Allemagne comme valeur de gestion, indique une contamination élevée.',
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
            label: "≤ 0,1 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#fec44f",
            picto: null,
          },
          inf_limites_sup_0_1: {
            label: "Entre 0,1 et 0,9 µg/L*",
            couleur: "#eedf00",
            couleurAlt: "#fe9929",
            picto: null,
          },
          sup_limite_indicative: {
            label: "> 0,9 µg/L — limite indicative dépassée",
            couleur: "#FDC70C",
            couleurAlt: "#d95f0e",
            picto: "warning",
          },
          metabolite_sup_3: {
            label: "> 3 µg/L**",
            couleur: "#d95f0e",
            couleurAlt: "#993404",
            picto: "warning",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details:
            "* Concentration > 0,1 µg/L lorsque le chlorothalonil R471811 était considéré pertinent (jusqu'en 2024). Le classement du Chlorothalonil R471811 en non pertinent en 2024 explique pourquoi il n'y a plus de non conformité à partir de 2025.",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses de chlorothalonil R471811 non conformes à la réglementation en vigueur cette année-là : la limite de qualité de 0,1 µg/L s'appliquait jusqu'en 2024, remplacée depuis 2025 par la valeur indicative de 0,9 µg/L, dont le dépassement n'est pas une non conformité.",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_chloridazone_desphenyl",
        nomAffichage: "Chloridazone desphényl",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Le chloridazone desphényl est un métabolite de la chloridazone, herbicide utilisé sur les betteraves des années 1960 jusqu'à son interdiction fin 2020. L'Anses le juge « pertinent ».",
        unite: "µg/L",
        resultatsDetails:
          "* D'après les recommandations du Ministère de la Santé",
        resultatsTopLegend:
          "Cette carte montre les concentrations en chloridazone desphényl mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles.",
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
            label: "≤ 0,1 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label: "> 0,1 µg/L — eau non conforme",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label:
              "> 11 µg/L (valeur sanitaire Vmax) — eau devant être déconseillée à la consommation*",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses de chloridazone desphényl non conformes à la réglementation (supérieures à la limite de qualité de 0,1 µg/L).",
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details: "* Concentration > 0,1 µg/L",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_chloridazone_methyl_desphenyl",
        nomAffichage: "Chloridazone methyl desphényl",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Le chloridazone méthyl-desphényl est un autre métabolite de la chloridazone, herbicide utilisé sur les betteraves des années 1960 jusqu'à son interdiction fin 2020. L'Anses le juge « pertinent ».",
        unite: "µg/L",
        resultatsDetails: "* D'après les instructions du Ministère de la Santé",
        resultatsTopLegend:
          "Cette carte montre les concentrations en chloridazone méthyl-desphényl mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles.",
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
            label: "≤ 0,1 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label: "> 0,1 µg/L — eau non conforme",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label:
              "> 110 µg/L (valeur sanitaire Vmax) — eau devant être déconseillée à la consommation*",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses de chloridazone méthyl-desphényl non conformes à la réglementation (supérieures à la limite de qualité de 0,1 µg/L).",
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details: "* Concentration > 0,1 µg/L",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_atrazine_desethyl",
        nomAffichage: "Atrazine déséthyl",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "L'atrazine déséthyl est un métabolite de l'atrazine, herbicide très utilisé sur le maïs et le blé des années 1960 jusqu'à son interdiction en 2003. Il est considéré « pertinent par défaut », sa pertinence n'ayant jamais été évaluée par l'Anses.",
        unite: "µg/L",
        resultatsDetails: "* D'après les instructions du Ministère de la Santé",
        resultatsTopLegend:
          "Cette carte montre les concentrations en atrazine déséthyl mesurées dans l'eau au cours de la dernière analyse dont les résultats sont disponibles.",
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
            label: "≤ 0,1 µg/L",
            couleur: "#FFF33B",
            couleurAlt: "#FFF33B",
            picto: null,
          },
          sup_limite_qualite: {
            label: "> 0,1 µg/L — eau non conforme",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_valeur_sanitaire: {
            label:
              "> 60 µg/L (valeur sanitaire Vmax) — eau devant être déconseillée à la consommation*",
            couleur: "#f03b20",
            couleurAlt: "#bd0026",
            picto: "red cross",
          },
        },
        resultatsAnnuels: {
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses d'atrazine déséthyl non conformes à la réglementation (supérieures à la limite de qualité de 0,1 µg/L).",
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details: "* Concentration > 0,1 µg/L",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "pes_total_reg",
        nomAffichage: "Total pesticides “réglementaire”",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Le total pesticides « réglementaire » est la somme des concentrations des substances actives et des métabolites pertinents quantifiés lors d'un prélèvement. Les métabolites non pertinents en sont exclus, ce qui sous-estime l'exposition réelle et l'effet cocktail.",
        unite: "µg/L",
        resultatsDetails:
          "* Somme recalculée des substances actives et des métabolites pertinents quantifiés lors de chaque prélèvement.",
        resultatsTopLegend:
          "Cette carte montre le total pesticides réglementaire mesuré dans l'eau au cours de la dernière analyse dont les résultats sont disponibles, au regard de la limite de qualité de 0,5 µg/L.",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          inf_limites: {
            label: "≤ 0,5 µg/L — eau conforme",
            couleur: "#ffffd4",
            couleurAlt: "#ffffd4",
            picto: null,
          },
          sup_limite_qualite: {
            label: "> 0,5 et ≤ 1 µg/L — eau non conforme",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_1: {
            label: "> 1 et ≤ 3 µg/L — eau non conforme",
            couleur: "#d95f0e",
            couleurAlt: "#d95f0e",
            picto: "warning",
          },
          sup_3: {
            label: "> 3 et ≤ 5 µg/L — eau non conforme",
            couleur: "#993404",
            couleurAlt: "#993404",
            picto: "warning",
          },
          sup_5: {
            label: "> 5 µg/L — eau non conforme",
            couleur: "#4d1a00",
            couleurAlt: "#4d1a00",
            picto: "warning",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse non conforme*",
          ratioLabelPlural: "analyses non conformes*",
          details:
            "* Total pesticides réglementaire (paramètre PESTOT) > 0,5 µg/L",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses pour lesquelles le total pesticides réglementaire dépasse la limite de qualité de 0,5 µg/L (eau non conforme).",
        },
      },
      {
        id: "pes_total_ts",
        nomAffichage: "Total tous pesticides",
        disable: false,
        enfants: [],
        affichageBlocPageUDI: true,
        description:
          "Le total « tous pesticides » est la somme de tous les pesticides quantifiés : substances actives, métabolites pertinents et non pertinents. Nous l'avons calculé pour montrer la concentration réelle en pesticides dans l'eau, que le total réglementaire n'indique pas.",
        unite: "µg/L",
        resultatsDetails:
          "* Somme de tous les pesticides quantifiés (les substances actives, les métabolites pertinents et non pertinents).",
        resultatsTopLegend:
          "Cette carte montre le total de tous les pesticides mesurés dans l'eau au cours de la dernière analyse dont les résultats sont disponibles.",
        resultats: {
          non_recherche: {
            label: "Non recherché dans les 12 derniers mois",
            couleur: "#cccccc",
            couleurAlt: "#f7f7f7",
            picto: null,
          },
          inf_limites: {
            label: "≤ 0,5 µg/L",
            couleur: "#ffffd4",
            couleurAlt: "#ffffd4",
            picto: null,
          },
          sup_limite_qualite: {
            label: "> 0,5 et ≤ 1 µg/L",
            couleur: "#fe9929",
            couleurAlt: "#fe9929",
            picto: "warning",
          },
          sup_1: {
            label: "> 1 et ≤ 3 µg/L",
            couleur: "#d95f0e",
            couleurAlt: "#d95f0e",
            picto: "warning",
          },
          sup_3: {
            label: "> 3 et ≤ 5 µg/L",
            couleur: "#993404",
            couleurAlt: "#993404",
            picto: "warning",
          },
          sup_5: {
            label: "> 5 µg/L",
            couleur: "#4d1a00",
            couleurAlt: "#4d1a00",
            picto: "warning",
          },
        },
        resultatsAnnuels: {
          nonRechercheLabel: "Aucune recherche dans l'année",
          nonRechercheCouleur: "#d9d9d9",
          nonRechercheCouleurAlt: "#f7f7f7",
          ratioLimites: [
            {
              limite: 0,
              label: "0%",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
            },
            {
              limite: 0.25,
              label: "≤ 25%",
              couleur: "#fed98e",
              couleurAlt: "#fed98e",
            },
            {
              limite: 0.5,
              label: "25 - 50%",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
            },
            {
              limite: 0.75,
              label: "50 - 75%",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
            },
            {
              limite: 1,
              label: "75 - 100%",
              couleur: "#993404",
              couleurAlt: "#993404",
            },
          ],
          ratioLabelSingular: "analyse > 0,5 µg/L*",
          ratioLabelPlural: "analyses > 0,5 µg/L*",
          details:
            "* Somme des pesticides (substances actives, métabolites pertinents et non pertinents) > 0,5 µg/L",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses pour lesquelles le total de tous les pesticides dépasse 0,5 µg/L, la limite de qualité qui ne s'applique réglementairement qu'au total pesticides réglementaire.",
        },
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
      "Les nitrates sont une des formes de l'azote, élément essentiel à la croissance des plantes. On estime que 88 % des nitrates présents dans les eaux viennent de l'agriculture (épandages de lisier et d'engrais azotés), le reste des rejets urbains et industriels.",
    unite: "mg/L",
    resultatsDetails: "* D'après les instructions du Ministère de la Santé",
    resultatsTopLegend:
      "Cette carte montre les concentrations en nitrates mesurées dans l'eau au cours des dernières analyses dont les résultats sont disponibles.",
    resultats: {
      non_recherche: {
        label: "Non recherché dans les 12 derniers mois",
        couleur: "#cccccc",
        couleurAlt: "#f7f7f7",
        picto: null,
      },
      non_quantifie: {
        label: "Non quantifié ou ≤ 10 mg/L",
        couleur: "#74c476",
        couleurAlt: "#c7e9c0",
        picto: null,
      },
      no3_inf_25: {
        label: "Entre 10 et 25 mg/L",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      no3_inf_40: {
        label: "Entre 25 et 40 mg/L",
        couleur: "#FDC70C",
        couleurAlt: "#FDC70C",
        picto: null,
      },
      inf_valeur_sanitaire: {
        label: "Entre 40 et 50 mg/L",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: null,
      },
      sup_valeur_sanitaire: {
        label:
          "> 50 mg/L — eau non conforme, déconseillée aux femmes enceintes et aux nourrissons*",
        couleur: "#f03b20",
        couleurAlt: "#bd0026",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#d9d9d9",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#ffffd4", couleurAlt: "#ffffd4" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fed98e",
          couleurAlt: "#fed98e",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#d95f0e",
          couleurAlt: "#d95f0e",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#993404",
          couleurAlt: "#993404",
        },
      ],
      ratioLabelSingular: "analyse non conforme*",
      ratioLabelPlural: "analyses non conformes*",
      details: "* Concentration > 50 mg/L",
      topLegend:
        "Cette carte montre sur une année le pourcentage des analyses de nitrates non conformes à la réglementation (supérieures à la limite de qualité de 50 mg/L).",
    },
  },
  {
    id: "cvm",
    nomAffichage: "CVM",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Le CVM (chlorure de vinyle monomère) est une substance gazeuse utilisée pour fabriquer le PVC, classée cancérogène certain pour l'homme. Les canalisations en PVC posées avant 1980 peuvent en relarguer dans l'eau, souvent sur quelques tronçons seulement d'un réseau.",
    unite: "µg/L",
    resultatsDetails: "* D'après les instructions du Ministère de la Santé",
    resultatsTopLegend:
      "Cette carte montre les concentrations en CVM mesurées dans l'eau au cours des dernières analyses dont les résultats sont disponibles.",
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
        label: "≤ 0,5 µg/L",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      cvm_sup_0_5: {
        label:
          "> 0,5 µg/L — limite de qualité dépassée, consommation pouvant être restreinte*",
        couleur: "#fe9929",
        couleurAlt: "#fe9929",
        picto: null,
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#d9d9d9",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#ffffd4", couleurAlt: "#ffffd4" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fed98e",
          couleurAlt: "#fed98e",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#d95f0e",
          couleurAlt: "#d95f0e",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#993404",
          couleurAlt: "#993404",
        },
      ],
      ratioLabelSingular: "analyse non conforme*",
      ratioLabelPlural: "analyses non conformes*",
      details: "* Concentration > 0,5 µg/L",
      topLegend:
        "Cette carte montre sur une année le pourcentage des analyses de CVM non conformes à la réglementation (supérieures à la limite de qualité de 0,5 µg/L).",
    },
  },
  /*{
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
        },
      },*/
  {
    id: "sub_indus_perchlorate",
    nomAffichage: "Perchlorate",
    disable: false,
    enfants: [],
    affichageBlocPageUDI: true,
    description:
      "Les perchlorates sont des sels utilisés dans des applications militaires (dispositifs pyrotechniques, poudres), industrielles (propulseurs) et agricoles (engrais). Très stables et solubles, ils persistent des dizaines d'années dans l'eau une fois émis.",
    unite: "µg/L",
    resultatsDetails: "* D'après les instructions du Ministère de la Santé",
    resultatsTopLegend:
      "Cette carte montre les concentrations en perchlorates mesurées dans l'eau au cours des dernières analyses dont les résultats sont disponibles. Aucune limite réglementaire ne s'applique aux perchlorates, les seuils affichés sont ceux recommandés par le ministère de la Santé.",
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
        label: "≤ 4 µg/L",
        couleur: "#FFF33B",
        couleurAlt: "#FFF33B",
        picto: null,
      },
      sup_valeur_sanitaire: {
        label:
          "Entre 4 et 15 µg/L — eau à éviter pour les biberons des nourrissons de moins de 6 mois*",
        couleur: "#FB726C",
        couleurAlt: "#FB726C",
        picto: "red cross",
      },
      sup_valeur_sanitaire_2: {
        label:
          "> 15 µg/L — eau également déconseillée aux femmes enceintes et allaitantes*",
        couleur: "#FC3127",
        couleurAlt: "#FC3127",
        picto: "red cross",
      },
    },
    resultatsAnnuels: {
      nonRechercheLabel: "Aucune recherche dans l'année",
      nonRechercheCouleur: "#d9d9d9",
      nonRechercheCouleurAlt: "#f7f7f7",
      ratioLimites: [
        { limite: 0, label: "0%", couleur: "#ffffd4", couleurAlt: "#ffffd4" },
        {
          limite: 0.25,
          label: "≤ 25%",
          couleur: "#fed98e",
          couleurAlt: "#fed98e",
        },
        {
          limite: 0.5,
          label: "25 - 50%",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
        },
        {
          limite: 0.75,
          label: "50 - 75%",
          couleur: "#d95f0e",
          couleurAlt: "#d95f0e",
        },
        {
          limite: 1,
          label: "75 - 100%",
          couleur: "#993404",
          couleurAlt: "#993404",
        },
      ],
      ratioLabelSingular: "analyse > 4 µg/L*",
      ratioLabelPlural: "analyses > 4 µg/L*",
      details:
        "* Le dépassement de 4 µg/L, qui n'est pas une limite de qualité réglementaire, n'est pas considéré comme une \"non conformité\"",
      topLegend:
        "Cette carte montre sur une année le pourcentage des analyses pour lesquelles les concentrations en perchlorates dépassent 4 µg/L, seuil au-delà duquel l'eau ne doit pas être utilisée pour la préparation des biberons des nourrissons de moins de 6 mois.",
    },
  },
  /*],
  },*/
  /*{
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
        },
      },
    ],
  },*/
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
