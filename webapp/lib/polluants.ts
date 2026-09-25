/**
 * Gravité normalisée, commune à toutes les catégories. Chaque catégorie a ses
 * propres clés de résultat (cf. `resultats` ci-dessous) : cette échelle permet
 * de les comparer entre elles pour le bloc résumé du panel de zone.
 */
export type Severity =
  | "non_recherche"
  | "non_quantifie"
  | "quantifie"
  | "vigilance"
  | "non_conforme"
  | "deconseille";

interface DetailResultat {
  label: string;
  couleur: string;
  couleurAlt: string;
  severite: Severity;
  explication?: string;
}

interface RatioLimite {
  limite: number;
  label: string;
  couleur: string;
  couleurAlt: string;
}

// Bloc "dernière analyse" : le dernier prélèvement connu par zone
// (period = "dernier_prel").
interface DerniereAnalyse {
  topLegend: string;
  resultats: { [key: string]: DetailResultat };
}

// Bloc "bilan annuel" : taux de non-conformité sur une année
// (period = "bilan_annuel_YYYY").
interface BilanAnnuel {
  topLegend?: string;
  nonRechercheLabel: string;
  nonRechercheCouleur: string;
  nonRechercheCouleurAlt: string;
  ratioLimites: RatioLimite[];
  ratioLabelSingular: string;
  ratioLabelPlural: string;
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
  description: string;
  lienExterne?: string;
  unite?: string;
  derniereAnalyse: DerniereAnalyse;
  bilanAnnuel?: BilanAnnuel;
}

export const availableCategories: ICategory[] = [
  {
    id: "tous",
    nomAffichage: "Tous polluants",
    disable: false,
    enfants: [],
    description:
      "Dans « tous polluants », nous regroupons les données des principaux polluants chimiques de l'eau potable : pesticides, nitrates, PFAS, CVM et perchlorates. La qualité de l'eau est évaluée au regard des limites de qualité fixées par la réglementation et des limites sanitaires établies et recommandées par les autorités de santé.",
    derniereAnalyse: {
      topLegend:
        "Cette carte montre l'état actuel de l'eau d'après les dernières analyses disponibles pour chaque polluant : pesticides, nitrates, PFAS, CVM et perchlorates. Chaque réseau est classé d'après le résultat le plus défavorable parmi l'ensemble des polluants étudiés.",
      resultats: {
        non_recherche: {
          label: "Aucun polluant recherché dans les 12 derniers mois",
          couleur: "#cccccc",
          couleurAlt: "#f7f7f7",
          severite: "non_recherche",
        },
        non_quantifie: {
          label: "Eau conforme sans aucun polluant",
          couleur: "#74c476",
          couleurAlt: "#c7e9c0",
          severite: "non_quantifie",
        },
        quantifie: {
          label: "Eau conforme avec au moins 1 polluant quantifié",
          couleur: "#FFF33B",
          couleurAlt: "#FFF33B",
          severite: "quantifie",
        },
        sup_limite_qualite: {
          label: "Eau non conforme",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
          severite: "non_conforme",
        },
        sup_limite_sanitaire: {
          label: "Eau déconseillée à la consommation",
          couleur: "#f03b20",
          couleurAlt: "#bd0026",
          severite: "deconseille",
          explication:
            "L'eau devrait être déconseillée à la consommation pour tout ou partie de la population (femmes enceintes, nourrissons…), d'après les recommandations du Ministère de la Santé ou du Haut Conseil de la Santé Publique.",
        },
      },
    },
  },
  {
    id: "pfas",
    nomAffichage: "PFAS",
    disable: false,
    // "pfas" désigne ici la carte des 20 PFAS réglementés
    description:
      "Les PFAS sont des molécules chimiques très persistantes utilisées dans diverses industries et produits de consommation en raison de leur propriétés antiadhésives, résistantes aux fortes chaleurs et imperméabilisantes.",
    unite: "µg/L",
    derniereAnalyse: {
      topLegend:
        "Cette carte montre les concentrations pour les 20 PFAS réglementés; mesurées lors des dernières analyses disponibles. Les concentrations sont comparées avec 3 types de limites:\n- la limite de qualité réglementaire de 0.1 µg/L pour la somme de 20 PFAS\n- la limite recommandée par le Haut Conseil de la Santé Publique (HCSP) de 0.02 µg/L pour la somme de 4 PFAS\n- des valeurs sanitaires établies par les autorités sanitaires pour chaque PFAS",
      resultats: {
        non_recherche: {
          label: "Non recherché dans les 12 derniers mois",
          couleur: "#cccccc",
          couleurAlt: "#f7f7f7",
          severite: "non_recherche",
        },
        non_quantifie: {
          label: "Eau conforme, sans aucun PFAS",
          couleur: "#74c476",
          couleurAlt: "#c7e9c0",
          severite: "non_quantifie",
        },
        somme_20pfas_inf_0_1_et_4pfas_inf_0_02: {
          label: "Eau conforme avec au moins 1 PFAS quantifié",
          couleur: "#FFF33B",
          couleurAlt: "#FFF33B",
          severite: "quantifie",
        },
        somme_20pfas_inf_0_1_et_4pfas_sup_0_02: {
          label: "Eau conforme mais dépassement de la limite HCSP",
          couleur: "#FDC70C",
          couleurAlt: "#FDC70C",
          severite: "vigilance",
        },
        somme_20pfas_sup_0_1: {
          label: "Eau non conforme",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
          severite: "non_conforme",
        },
        sup_valeur_sanitaire: {
          label: "Eau non conforme et déconseillée à la consommation",
          couleur: "#f03b20",
          couleurAlt: "#bd0026",
          severite: "deconseille",
          explication:
            "La concentration d'un ou plusieurs PFAS dépasse la limite sanitaire.",
        },
      },
    },
    bilanAnnuel: {
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
        "Cette carte montre le pourcentage des analyses des 20 PFAS réalisées dans l’année non conformes à la réglementation (supérieures à la limite de qualité de 0.1 µg/L pour la somme de 20 PFAS). ",
      valeurSanitaireLabel: "une limite sanitaire",
    },
    groupes: [
      {
        titre: "Connaître la conformité de l'eau à la réglementation pour…",
        options: [{ id: "pfas", label: "20 PFAS réglementés" }],
      },
      {
        titre: "Connaître la concentration en TFA",
        options: [{ id: "tfa", label: "TFA" }],
      },
    ],
    enfants: [
      {
        id: "tfa",
        nomAffichage: "TFA",
        disable: false,
        enfants: [],
        description:
          "Le TFA (acide trifluoroacétique) est un PFAS à chaîne très courte, issu notamment de la dégradation d'autres PFAS et de certains pesticides. Il ne fait pas partie des 20 PFAS réglementés.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre les concentrations en TFA mesurées lors des dernières analyses disponibles.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Absense",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            tfa_inf_0_1: {
              label: "≤ 0,1 µg/L",
              couleur: "#c7e9c0",
              couleurAlt: "#c7e9c0",
              severite: "quantifie",
            },
            tfa_inf_0_5: {
              label: "> 0,1 et ≤ 0,5 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#FFF33B",
              severite: "quantifie",
            },
            tfa_inf_2_2: {
              label: "> 0,5 et ≤ 2,2 µg/L",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "vigilance",
            },
            tfa_inf_10: {
              label: "> 2,2 et ≤ 10 µg/L",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
              severite: "vigilance",
            },
            tfa_inf_60: {
              label: "> 10 et ≤ 60 µg/L",
              couleur: "#FB726C",
              couleurAlt: "#FB726C",
              severite: "vigilance",
            },
            tfa_sup_60: {
              label: "> 60 µg/L",
              couleur: "#f03b20",
              couleurAlt: "#bd0026",
              severite: "vigilance",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse > 0,5 µg/L",
          ratioLabelPlural: "analyses > 0,5 µg/L",
          topLegend:
            "Cette carte montre sur une année le pourcentage des analyses pour lesquelles la concentration en TFA dépasse 0,5 µg/L, la limite de qualité réglementaire du total PFAS auquel le TFA appartient.",
        },
      },
    ],
  },
  {
    id: "pesticide",
    nomAffichage: "Pesticides",
    disable: false,
    description:
      "Le terme “pesticides” regroupe ici les substances actives chimiques (herbicides, insecticides, fongicides etc.) contenues dans les produits phytosanitaires (utilisés en agriculture) ou biocides (utilisés à domicile ou dans les bâtiments) ainsi que les substances issues de leur dégradation, appelés métabolites.",
    unite: "µg/L",
    derniereAnalyse: {
      topLegend:
        "Cette carte montre la conformité de l’eau pour l’ensemble des pesticides réglementés (substances actives et métabolites pertinents), d’après les dernières analyses disponibles. Cette carte est une agrégation des 3 cartes “substances actives”, métabolites pertinents” et “total pesticide réglementaire”.\n\nLa réglementation distingue les métabolites pertinents (susceptibles d’avoir un risque pour la santé) et les métabolites non pertinents. Seuls les métabolites pertinents sont pris en compte pour établir la conformité de l’eau.\n\nSi au moins une de ces 2 limites de qualité est dépassée, l'eau est déclarée “non conforme”.\n- 0,1 µg/L pour chaque substance active et métabolites pertinents\n- 0,5 µg/L pour la somme des substance actives et métabolites pertinents (paramètre “total pesticide réglementaire”)",
      resultats: {
        non_recherche: {
          label: "Non recherché dans les 12 derniers mois",
          couleur: "#cccccc",
          couleurAlt: "#f7f7f7",
          severite: "non_recherche",
        },
        non_quantifie: {
          label: "Eau conforme, sans aucun pesticide",
          couleur: "#74c476",
          couleurAlt: "#c7e9c0",
          severite: "non_quantifie",
        },
        inf_limite_qualite: {
          label: "Eau conforme, avec au moins un pesticide quantifié",
          couleur: "#FFF33B",
          couleurAlt: "#FFF33B",
          severite: "quantifie",
        },
        sup_limite_qualite: {
          label: "Eau non conforme",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
          severite: "non_conforme",
        },
        sup_valeur_sanitaire: {
          label: "Eau non conforme et déconseillée à la consommation",
          couleur: "#f03b20",
          couleurAlt: "#bd0026",
          severite: "deconseille",
          explication:
            "L'eau est déconseillée à la consommation d'après les recommandations du Haut Conseil de la Santé Publique.",
        },
      },
    },
    bilanAnnuel: {
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
        "Cette carte montre le pourcentage des analyses de pesticides réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L pour une substance active ou un métabolite pertinent, et/ou à 0,5 µg/L pour le total pesticides réglementaire).",
      valeurSanitaireLabel:
        "la limite devant entraîner des restrictions de consommation",
    },
    groupes: [
      {
        titre: "Connaître la conformité de l'eau à la réglementation pour…",
        options: [
          { id: "pesticide", label: "Pesticides réglementés" },
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
        enfants: [],
        description:
          "Les substances actives sont les molécules des pesticides ayant des propriétés herbicides, insecticides ou fongicides.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre la conformité de l’eau pour les substances actives uniquement, d’après les dernières analyses disponibles. Lorsque la limite de qualité de 0,1 µg/L est dépassée pour au moins une substance active, l’eau est declarée non conforme.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Aucune substance active",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limite_qualite: {
              label: "Au moins une substance active quantifiée, ≤ 1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#FFF33B",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label:
                "Eau non conforme (au moins une substance active > 0.1 µg/L)",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "non_conforme",
            },
            sup_valeur_sanitaire: {
              label: "Eau non conforme et déconseillée à la consommation",
              couleur: "#f03b20",
              couleurAlt: "#bd0026",
              severite: "deconseille",
              explication:
                "L'eau est déconseillée à la consommation d'après les recommandations du Haut Conseil de la Santé Publique.",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          topLegend:
            "Cette carte montre le pourcentage des analyses de substances actives réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L pour au moins une substance active).",
          valeurSanitaireLabel:
            "la limite devant entraîner des restrictions de consommation",
        },
      },
      {
        id: "metabolite_p",
        nomAffichage: "Métabolites pertinents",
        disable: false,
        description:
          "Les métabolites sont des substances issues de la dégradation des pesticides dans l'environnement. Ils sont jugés pertinents “s'il y a lieu de considérer qu'il pourrait engendrer un risque sanitaire inacceptable pour le consommateur”.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre la conformité de l’eau pour les métabolites pertinents uniquement, d’après les dernières analyses disponibles. Lorsque la limite de qualité de 0,1 µg/L est dépassée pour au moins un métabolite pertinent, l’eau est declarée non conforme.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Aucun métabolite pertinent",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label: "Au moins un métabolite pertinent quantifié, ≤ 1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#FFF33B",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label:
                "Eau non conforme (au moins un métabolite pertinent > 0,1 µg/L)",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "non_conforme",
            },
            sup_valeur_sanitaire: {
              label: "Eau déconseillée à la consommation",
              couleur: "#f03b20",
              couleurAlt: "#bd0026",
              severite: "deconseille",
              explication:
                "L'eau est déconseillée à la consommation d'après les recommandations du Haut Conseil de la Santé Publique.",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          topLegend:
            "Cette carte montre le pourcentage des analyses de métabolites pertinents réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L pour au moins un métabolite pertinent).",
          valeurSanitaireLabel:
            "la limite devant entraîner des restrictions de consommation",
        },
        enfants: [],
      },

      {
        id: "metabolite_np",
        nomAffichage: "Métabolites non pertinents",
        disable: false,
        description:
          "Les métabolites sont des substances issues de la dégradation des pesticides dans l'environnement. Les métabolites non pertinents, jugés sans risque sanitaire inacceptable pour le consommateur, doivent respecter une valeur “indicative” de 0.9 µg/L. Le dépassement de cette valeur n'est toutefois pas considéré comme une “non conformité”. Les métabolites non pertinents ne sont pas comptés dans le total pesticide réglementaire.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre la concentration des métabolites non pertinents mesurées lors des dernières analyses disponibles. La carte permet de savoir si la limite indicative de 0.9 µg/L est respectée.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Aucun métabolite non pertinent",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label:
                "Au moins un métabolite non pertinent quantifié, ≤ 0,1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#fec44f",
              severite: "quantifie",
            },
            inf_limites_sup_0_1: {
              label:
                "Au moins un métabolite non pertinent entre 0,1 et 0,9 µg/L",
              couleur: "#eedf00",
              couleurAlt: "#fe9929",
              severite: "quantifie",
            },
            sup_limite_indicative: {
              label: "Au moins un métabolite non pertinent > 0,9 µg/L",
              couleur: "#FDC70C",
              couleurAlt: "#d95f0e",
              severite: "vigilance",
            },
          },
        },
        bilanAnnuel: {
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
          topLegend:
            "Cette carte montre le pourcentage des analyses de métabolites non pertinents réalisées dans l’année pour lesquelles au moins un métabolite non pertinent dépasse la valeur indicative de 0,9 µg/L — un dépassement qui n'est pas considéré comme une non conformité par les autorités.",
        },
        enfants: [],
      },
      {
        id: "metabolite_esa_metolachlore",
        nomAffichage: "ESA-métolachlore",
        disable: false,
        enfants: [],
        description:
          "L'ESA-métolachlore est un métabolite du S-métolachlore, herbicide très utilisé sur le maïs, le soja et le tournesol, interdit en France et en Europe depuis 2024. D’abord jugé “pertinent” par l'Anses en 2019, il a été déclassé en “non pertinent” en 2022, alors que son potentiel cancérigène n'a jamais été évalué. \nJusqu'en 2022, la limite de qualité réglementaire de 0,1 µg/L s'appliquait.\nDepuis 2023, la limite “indicative” de 0,9 µg/L s'applique.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre les concentrations en ESA-métolachlore mesurées lors des dernières analyses disponibles.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Absence",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label: "≤ 0,1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#fec44f",
              severite: "quantifie",
            },
            inf_limites_sup_0_1: {
              label: "Entre 0,1 et 0,9 µg/L",
              couleur: "#eedf00",
              couleurAlt: "#fe9929",
              severite: "quantifie",
            },
            sup_limite_indicative: {
              label: "> 0,9 µg/L",
              couleur: "#FDC70C",
              couleurAlt: "#d95f0e",
              severite: "vigilance",
            },
            metabolite_sup_3: {
              label: "> 3 µg/L",
              couleur: "#d95f0e",
              couleurAlt: "#993404",
              severite: "vigilance",
              explication:
                "La valeur de 3 µg/L, utilisée en Allemagne comme valeur de gestion, indique une contamination élevée.",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse non conforme ou > 0,9 µg/L",
          ratioLabelPlural: "analyses non conformes ou > 0,9 µg/L",
          topLegend:
            "Cette carte montre le pourcentage des analyses d'ESA-métolachlore réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L) jusqu'en 2022, puis supérieures à la valeur indicative de 0,9 µg/L à partir de 2023.",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_chlorothalonil_r471811",
        nomAffichage: "Chlorothalonil R471811",
        disable: false,
        enfants: [],
        description:
          "Le Chlorothalonil R471811 est un métabolite du chlorothalonil, fongicide très utilisé sur les céréales et interdit en France et en Europe depuis 2020. D’abord jugé “pertinent” par l'Anses en 2022, il a été déclassé en “non pertinent” en 2024 sans qu'une évaluation complète de son potentiel cancérigène ait été faite. \n\nJusqu'au 30 avril 2024, la limite de qualité réglementaire de 0,1 µg/L s'appliquait. Depuis cette date, la limite “indicative” de 0,9 µg/L s'applique. Pour des questions de faisabilité, il est considéré pertinent sur notre carte toute l’année 2024 et non pertinent à partir de 2025.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre les concentrations en chlorothalonil R471811 mesurées lors des dernières analyses disponibles.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Absence",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label: "≤ 0,1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#fec44f",
              severite: "quantifie",
            },
            inf_limites_sup_0_1: {
              label: "Entre 0,1 et 0,9 µg/L",
              couleur: "#eedf00",
              couleurAlt: "#fe9929",
              severite: "quantifie",
            },
            sup_limite_indicative: {
              label: "> 0,9 µg/L",
              couleur: "#FDC70C",
              couleurAlt: "#d95f0e",
              severite: "vigilance",
            },
            metabolite_sup_3: {
              label: "> 3 µg/L",
              couleur: "#d95f0e",
              couleurAlt: "#993404",
              severite: "vigilance",
              explication:
                "La valeur de 3 µg/L, utilisée en Allemagne comme valeur de gestion, indique une contamination élevée.",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse non conforme ou > 0,9 µg/L",
          ratioLabelPlural: "analyses non conformes ou > 0,9 µg/L",
          topLegend:
            "Cette carte montre le pourcentage des analyses de chlorothalonil R471811 réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L) jusqu'en 2024, puis supérieures à la valeur indicative de 0,9 µg/L à partir de 2025.",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_chloridazone_desphenyl",
        nomAffichage: "Chloridazone desphényl",
        disable: false,
        enfants: [],
        description:
          "Le chloridazone desphényl est un métabolite de la chloridazone, herbicide utilisé sur les betteraves des années 1960 jusqu'à son interdiction fin 2020. L'Anses le juge “pertinent”. La limite de qualité réglementaire de 0,1 µg/L s’applique.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre les concentrations en chloridazone desphényl mesurées lors des dernières analyses disponibles.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Absence",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label: "≤ 0,1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#FFF33B",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label: "> 0,1 µg/L — eau non conforme",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "non_conforme",
            },
            sup_valeur_sanitaire: {
              label:
                "> 11 µg/L (valeur sanitaire Vmax) — eau devant être déconseillée à la consommation",
              couleur: "#f03b20",
              couleurAlt: "#bd0026",
              severite: "deconseille",
              explication:
                "L'eau est déconseillée à la consommation d'après les recommandations du Haut Conseil de la Santé Publique.",
            },
          },
        },
        bilanAnnuel: {
          topLegend:
            "Cette carte montre le pourcentage des analyses de chloridazone desphényl réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L).",
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
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_chloridazone_methyl_desphenyl",
        nomAffichage: "Chloridazone methyl desphényl",
        disable: false,
        enfants: [],
        description:
          "Le chloridazone méthyl-desphényl est un métabolite de la chloridazone, herbicide utilisé sur les betteraves des années 1960 jusqu'à son interdiction fin 2020. L'Anses le juge “pertinent”. La limite de qualité réglementaire de 0,1 µg/L s’applique.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre les concentrations en chloridazone méthyl-desphényl mesurées lors des dernières analyses disponibles.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Absence",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label: "≤ 0,1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#FFF33B",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label: "> 0,1 µg/L — eau non conforme",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "non_conforme",
            },
            sup_valeur_sanitaire: {
              label:
                "> 110 µg/L (valeur sanitaire Vmax) — eau devant être déconseillée à la consommation",
              couleur: "#f03b20",
              couleurAlt: "#bd0026",
              severite: "deconseille",
              explication:
                "L'eau est déconseillée à la consommation d'après les recommandations du Haut Conseil de la Santé Publique.",
            },
          },
        },
        bilanAnnuel: {
          topLegend:
            "Cette carte montre le pourcentage des analyses de chloridazone méthyl-desphényl réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L).",
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
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "metabolite_atrazine_desethyl",
        nomAffichage: "Atrazine déséthyl",
        disable: false,
        enfants: [],
        description:
          "L'atrazine déséthyl est un métabolite de l'atrazine, herbicide très utilisé sur le maïs et le blé des années 1960 jusqu'à son interdiction en 2003. Il est considéré “pertinent par défaut”, sa pertinence n'ayant jamais été évaluée par l'Anses. La limite de qualité réglementaire de 0,1 µg/L s’applique.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre les concentrations en atrazine déséthyl mesurées lors des dernières analyses disponibles.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            non_quantifie: {
              label: "Absence",
              couleur: "#74c476",
              couleurAlt: "#c7e9c0",
              severite: "non_quantifie",
            },
            inf_limites: {
              label: "≤ 0,1 µg/L",
              couleur: "#FFF33B",
              couleurAlt: "#FFF33B",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label: "> 0,1 µg/L — eau non conforme",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "non_conforme",
            },
            sup_valeur_sanitaire: {
              label:
                "> 60 µg/L (valeur sanitaire Vmax) — eau devant être déconseillée à la consommation",
              couleur: "#f03b20",
              couleurAlt: "#bd0026",
              severite: "deconseille",
              explication:
                "L'eau est déconseillée à la consommation d'après les recommandations du Haut Conseil de la Santé Publique.",
            },
          },
        },
        bilanAnnuel: {
          topLegend:
            "Cette carte montre le pourcentage des analyses d'atrazine déséthyl réalisées dans l’année non conformes à la réglementation (supérieures à 0,1 µg/L).",
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
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          valeurSanitaireLabel: "la limite sanitaire",
        },
      },
      {
        id: "pes_total_reg",
        nomAffichage: "Total pesticides réglementaire",
        disable: false,
        enfants: [],
        description:
          "Le total pesticides « réglementaire » est la somme des concentrations des substances actives et des métabolites pertinents quantifiés lors d'un prélèvement. Les métabolites non pertinents en sont exclus, ce qui sous-estime l'exposition réelle et l'effet cocktail.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre la somme des concentrations des substances actives et  métabolites pertinents (aussi appelé total pesticides réglementaires) mesurées lors des dernières analyses disponibles. Lorsque la limite de qualité de 0,5 µg/L est dépassée pour le total pesticides réglementaire, l’eau est declarée non conforme. Les métabolites non pertinents ne sont pas pris en compte dans ce total.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            inf_limites: {
              label: "≤ 0,5 µg/L",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label: "> 0,5 et ≤ 1 µg/L — eau non conforme",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "non_conforme",
            },
            sup_1: {
              label: "> 1 et ≤ 3 µg/L — eau non conforme",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
              severite: "non_conforme",
            },
            sup_3: {
              label: "> 3 et ≤ 5 µg/L — eau non conforme",
              couleur: "#993404",
              couleurAlt: "#993404",
              severite: "non_conforme",
            },
            sup_5: {
              label: "> 5 µg/L — eau non conforme",
              couleur: "#4d1a00",
              couleurAlt: "#4d1a00",
              severite: "non_conforme",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse non conforme",
          ratioLabelPlural: "analyses non conformes",
          topLegend:
            "Cette carte montre le pourcentage d’analyses de pesticides réalisées dans l’année pour lesquelles le total pesticides réglementaire (somme des substances actives et métabolites pertinents) dépasse la limite de qualité de 0,5 µg/L (eau non conforme). Les métabolites non pertinents ne sont pas pris en compte dans ce total.",
        },
      },
      {
        id: "pes_total_ts",
        nomAffichage: "Total tous pesticides",
        disable: false,
        enfants: [],
        description:
          "Le terme “pesticides” regroupe ici les substances actives chimiques (herbicides, insecticides, fongicides etc.) contenues dans les produits phytosanitaires (utilisés en agriculture) ou biocides (utilisés à domicile ou dans les bâtiments) ainsi que les substances issues de leur dégradation, appelés métabolites.",
        unite: "µg/L",
        derniereAnalyse: {
          topLegend:
            "Cette carte montre la concentration totale en pesticides dans l’eau mesurée lors des dernières analyses disponibles. Contrairement à la carte “total pesticides réglementaires”, les métabolites non pertinents sont pris en compte dans le calcul.",
          resultats: {
            non_recherche: {
              label: "Non recherché dans les 12 derniers mois",
              couleur: "#cccccc",
              couleurAlt: "#f7f7f7",
              severite: "non_recherche",
            },
            inf_limites: {
              label: "≤ 0,5 µg/L",
              couleur: "#ffffd4",
              couleurAlt: "#ffffd4",
              severite: "quantifie",
            },
            sup_limite_qualite: {
              label: "> 0,5 et ≤ 1 µg/L",
              couleur: "#fe9929",
              couleurAlt: "#fe9929",
              severite: "quantifie",
            },
            sup_1: {
              label: "> 1 et ≤ 3 µg/L",
              couleur: "#d95f0e",
              couleurAlt: "#d95f0e",
              severite: "quantifie",
            },
            sup_3: {
              label: "> 3 et ≤ 5 µg/L",
              couleur: "#993404",
              couleurAlt: "#993404",
              severite: "quantifie",
            },
            sup_5: {
              label: "> 5 µg/L",
              couleur: "#4d1a00",
              couleurAlt: "#4d1a00",
              severite: "quantifie",
            },
          },
        },
        bilanAnnuel: {
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
          ratioLabelSingular: "analyse > 0,5 µg/L",
          ratioLabelPlural: "analyses > 0,5 µg/L",
          topLegend:
            "Cette carte montre le pourcentage des analyses de pesticides réalisées dans l’année pour lesquelles le total de tous les pesticides (substances actives, métabolites pertinents et non pertinents) dépasse 0,5 µg/L. Nous avons choisi cette valeur pour pouvoir comparer avec la carte “total pesticides réglementaires” qui ne prend pas en compte les métabolites non pertinents.",
        },
      },
    ],
  },
  {
    id: "nitrate",
    nomAffichage: "Nitrates",
    disable: false,
    enfants: [],
    description:
      "Les nitrates sont une des formes de l'azote qui est un élément essentiel à la croissance des plantes. On estime que l'agriculture, via l’épandage de lisier ou d'engrais azotés de synthèse, est à l'origine de 88 % des nitrates contenus dans les eaux.",
    unite: "mg/L",
    derniereAnalyse: {
      topLegend:
        "Cette carte montre les concentrations en nitrates mesurées lors des dernières analyses disponibles. Au-delà de la limite de qualité réglementaire fixée à 50 mg/L, l’eau est non conforme et déconseillée aux femmes enceintes et nourissons",
      resultats: {
        non_recherche: {
          label: "Non recherché dans les 12 derniers mois",
          couleur: "#cccccc",
          couleurAlt: "#f7f7f7",
          severite: "non_recherche",
        },
        non_quantifie: {
          label: "Absence ou ≤ 10 mg/L",
          couleur: "#74c476",
          couleurAlt: "#c7e9c0",
          severite: "non_quantifie",
        },
        no3_inf_25: {
          label: "Entre 10 et 25 mg/L",
          couleur: "#FFF33B",
          couleurAlt: "#FFF33B",
          severite: "quantifie",
        },
        no3_inf_40: {
          label: "Entre 25 et 40 mg/L",
          couleur: "#FDC70C",
          couleurAlt: "#FDC70C",
          severite: "quantifie",
        },
        inf_valeur_sanitaire: {
          label: "Entre 40 et 50 mg/L",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
          severite: "quantifie",
        },
        sup_valeur_sanitaire: {
          label:
            "> 50 mg/L — eau non conforme, déconseillée aux femmes enceintes et nourrissons",
          couleur: "#f03b20",
          couleurAlt: "#bd0026",
          severite: "deconseille",
        },
      },
    },
    bilanAnnuel: {
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
        "Cette carte montre le pourcentage des analyses de nitrates réalisées dans l’année non conformes à la réglementation (supérieures à la limite de qualité de 50 mg/L).",
    },
  },
  {
    id: "cvm",
    nomAffichage: "CVM",
    disable: false,
    enfants: [],
    description:
      "Le CVM, ou Chlorure de Vinyl Monomère, est une substance chimique gazeuse utilisée dans la fabrication des canalisations en PVC (polychlorure de vinyle). Les conduites en PVC datant d'avant 1980 sont susceptibles de contenir des résidus de CVM et d'en relarguer dans l'eau. Souvent, seules quelques rues d’un réseau sont concernées par la contamination au CVM.",
    unite: "µg/L",
    derniereAnalyse: {
      topLegend:
        "Cette carte montre les concentrations en CVM mesurées lors des dernières analyses disponibles. Si deux analyses consécutives sont supérieures à la limite de qualité réglementaire fixée à 0,5 µg/L, l’eau est déclarée non conforme et sa consommation peut être interdite.",
      resultats: {
        non_recherche: {
          label: "Non recherché dans les 12 derniers mois",
          couleur: "#cccccc",
          couleurAlt: "#f7f7f7",
          severite: "non_recherche",
        },
        non_quantifie: {
          label: "Absence",
          couleur: "#74c476",
          couleurAlt: "#c7e9c0",
          severite: "non_quantifie",
        },
        inf_limites: {
          label: "< 0.5 µg/L",
          couleur: "#FFF33B",
          couleurAlt: "#FFF33B",
          severite: "quantifie",
        },
        cvm_sup_0_5: {
          label: "> 0.5 µg/L — eau non conforme",
          couleur: "#fe9929",
          couleurAlt: "#fe9929",
          severite: "non_conforme",
        },
      },
    },
    bilanAnnuel: {
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
        "Cette carte montre le pourcentage des analyses de CVM réalisées dans l’année non conformes à la réglementation (supérieures à la limite de qualité de 0,5 µ/L).",
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
    description:
      "Les ions perchlorates sont des sels chlorés très solubles dans l’eau. Les perchlorates peuvent se retrouver dans l’environnement à la suite de rejets industriels, mais également dans des zones ayant fait l’objet de combats pendant la première guerre mondiale. Très stables et solubles, ils persistent des dizaines d'années dans l'eau une fois émis.",
    unite: "µg/L",
    derniereAnalyse: {
      topLegend:
        "Cette carte montre les concentrations en perchlorates mesurées lors des dernières analyses disponibles. Il n'existe pas de limite réglementaire pour les perchlorates dans l'eau potable. Le ministère de la santé recommande, par précaution, de limiter la consommation de l’eau pour les nourrissons de moins de 6 mois si la concentration en perchlorate dépasse 4 µg/L et de limiter la consommation pour les femmes enceintes et allaitantes au delà de 15 µg/L.",
      resultats: {
        non_recherche: {
          label: "Non recherché dans les 12 derniers mois",
          couleur: "#cccccc",
          couleurAlt: "#f7f7f7",
          severite: "non_recherche",
        },
        non_quantifie: {
          label: "Absence",
          couleur: "#74c476",
          couleurAlt: "#c7e9c0",
          severite: "non_quantifie",
        },
        inf_valeur_sanitaire: {
          label: "Inférieure au seuil d’alerte de 4 µg/L",
          couleur: "#FFF33B",
          couleurAlt: "#FFF33B",
          severite: "quantifie",
        },
        sup_valeur_sanitaire: {
          label:
            "Entre 4 et 15 µg/L — eau déconseillée aux nourrissons de moins de 6 mois",
          couleur: "#FB726C",
          couleurAlt: "#FB726C",
          severite: "deconseille",
        },
        sup_valeur_sanitaire_2: {
          label:
            "Supérieure à 15 µg/L — eau déconseillée aux nourrissons, femmes enceintes et allaitantes",
          couleur: "#FC3127",
          couleurAlt: "#FC3127",
          severite: "deconseille",
        },
      },
    },
    bilanAnnuel: {
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
      ratioLabelSingular: "analyse > 4 µg/L",
      ratioLabelPlural: "analyses > 4 µg/L",
      topLegend:
        "Cette carte montre le pourcentage des analyses de perchlorates réalisées dans l’année supérieures à 4 µg/L, seuil au-delà duquel l'eau est déconseillée aux nourrissons de moins de 6 mois. A noter que le dépassement de 4 µg/L, qui n'est pas une limite de qualité réglementaire, n'est pas considéré comme une “non conformité”.",
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

/**
 * Catégories de premier niveau effectivement proposées, dans l'ordre de
 * `availableCategories`. "tous" en est exclu : il est traité à part, là où il
 * sert de résumé. Version non récursive de `getAllEnabledCategories`.
 */
export const TOP_LEVEL_CATEGORIES = availableCategories.filter(
  (item) => !item.disable && item.id !== "tous",
);

/**
 * Remonte à la catégorie de premier niveau à partir d'un identifiant qui peut
 * être une sous-catégorie (ex. une molécule de pesticide précise) : ni le
 * panel de zone ni le sélecteur de la carte n'ont de ligne dédiée aux
 * sous-catégories.
 */
export function findTopLevelCategory(
  selectedId: string,
  categories: ICategory[] = availableCategories,
): ICategory | undefined {
  return categories.find(
    (item) =>
      item.id === selectedId ||
      item.enfants?.some((child) => child.id === selectedId),
  );
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
