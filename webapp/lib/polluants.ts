export interface ICategory {
  id: string;
  nom_affichage: string;
  disable: boolean;
  enfants: ICategory[];
  description?: string;
  healthRisks?: string;
  regulation?: string;
  exposureSources?: string;
}

export const availableCategories: ICategory[] = [
  {
    id: "tous-polluants",
    nom_affichage: "Tous polluants",
    disable: false,
    enfants: [],
    description:
      "Ensemble des substances chimiques et biologiques pouvant contaminer l'eau, l'air et les sols.",
    healthRisks:
      "Dépend du polluant : effets cancérigènes, neurotoxiques, perturbateurs endocriniens, maladies chroniques, etc.",
    regulation: "Directive cadre sur l'eau (DCE), Code de l'environnement.",
    exposureSources: "Eau potable, air, alimentation, sols contaminés.",
  },
  {
    id: "pfas",
    nom_affichage: "PFAS",
    enfants: [],
    disable: false,
    description:
      "Polluants éternels, utilisés dans l'industrie pour leurs propriétés antiadhésives et imperméables.",
    healthRisks:
      "Perturbateurs endocriniens, cancers, toxicité hépatique et immunitaire.",
    regulation:
      "Réglementation en cours d'évolution, restriction progressive en Europe.",
    exposureSources:
      "Ustensiles de cuisine, emballages alimentaires, eau potable.",
  },
  {
    id: "pesticides",
    nom_affichage: "Pesticides",
    disable: false,
    description:
      "Substances chimiques utilisées pour lutter contre les nuisibles agricoles.",
    healthRisks:
      "Cancers, troubles neurologiques, perturbations endocriniennes, toxicité aiguë.",
    regulation:
      "LMR (Limites Maximales de Résidus), règlement (CE) n°1107/2009.",
    exposureSources:
      "Agriculture, consommation de produits traités, eau potable.",
    enfants: [
      {
        id: "pesticides-substances-actives",
        nom_affichage: "Substances actives",
        disable: false,
        enfants: [],
        description:
          "Molécules ayant un effet biocide contre les organismes nuisibles.",
        healthRisks:
          "Toxicité variable : certains sont cancérigènes ou reprotoxiques.",
        regulation: "Autorisation par l'ANSES, encadrement par l'UE.",
        exposureSources:
          "Pulvérisation agricole, résidus dans l'eau et les aliments.",
      },
      {
        id: "pesticides-metabolites",
        nom_affichage: "Métabolites",
        disable: false,
        description: "Produits de dégradation des substances actives.",
        healthRisks:
          "Moins étudiés que les substances actives, certains sont toxiques.",
        regulation:
          "Réglementation récente : seuils pour certains métabolites en eau potable.",
        exposureSources:
          "Dégradation dans l'eau et les sols, consommation d'eau potable.",
        enfants: [
          {
            id: "pesticides-metabolites-esa-metolachlore",
            nom_affichage: "Métabolites ESA-métachlore",
            enfants: [],
            disable: false,
            description: "Métabolite du métolachlore, herbicide.",
            healthRisks: "Peu de données, potentiellement toxique.",
            regulation: "Limite de 0,1 µg/L en eau potable.",
            exposureSources: "Contamination de l'eau souterraine.",
          },
          {
            id: "pesticides-metabolites-chlorothalonil-r471811",
            nom_affichage: "Métabolites Chlorothalonil R471811",
            enfants: [],
            disable: false,
            description: "Métabolite du fongicide chlorothalonil.",
            healthRisks: "Classé comme probablement cancérigène.",
            regulation: "Interdit en 2019 par l'UE.",
            exposureSources: "Présent dans les nappes phréatiques.",
          },
          {
            id: "pesticides-metabolites-chloridazone-desphenyl",
            nom_affichage: "Métabolites Chloridazone desphényl",
            enfants: [],
            disable: false,
            description:
              "Métabolite de la chloridazone, herbicide utilisé pour les betteraves.",
            healthRisks: "Potentiellement toxique.",
            regulation: "Limite de 0,1 µg/L en eau potable.",
            exposureSources: "Présent dans les eaux souterraines.",
          },
          {
            id: "pesticides-metabolites-atrazine-desethyl",
            nom_affichage: "Métabolites Atrazine déséthyl",
            enfants: [],
            disable: false,
            description:
              "Métabolite de l'atrazine, herbicide interdit depuis 2003.",
            healthRisks: "Suspecté d'être perturbateur endocrinien.",
            regulation: "Limite de 0,1 µg/L en eau potable.",
            exposureSources: "Contamination résiduelle des sols et nappes.",
          },
          {
            id: "pesticides-metabolites-chloridazone-methyl-desphenyl",
            nom_affichage: "Chloridazone methyl desphényl",
            enfants: [],
            disable: false,
            description: "Autre métabolite de la chloridazone.",
            healthRisks: "Effets toxiques incertains.",
            regulation: "Surveillance renforcée en eau potable.",
            exposureSources: "Contamination des ressources en eau.",
          },
        ],
      },
    ],
  },
  {
    id: "nitrites",
    nom_affichage: "Nitrates et Nitrites",
    disable: false,
    enfants: [],
    description:
      "Résidus azotés provenant des engrais et des déchets organiques.",
    healthRisks: "Méthémoglobinémie, risque de cancer gastro-intestinal.",
    regulation:
      "Limite de 50 mg/L pour les nitrates, 0,5 mg/L pour les nitrites en eau potable.",
    exposureSources:
      "Agriculture intensive, effluents industriels et domestiques.",
  },
  {
    id: "cvm",
    nom_affichage: "CVM",
    disable: false,
    enfants: [],
    description: "Utilisé pour produire le PVC, polluant volatil.",
    healthRisks: "Cancérigène avéré, hépatotoxicité.",
    regulation: "Seuil de 0,5 µg/L en eau potable.",
    exposureSources: "Industrie plastique, eau contaminée.",
  },
  {
    id: "substances-industrielles",
    nom_affichage: "Substances industrielles",
    disable: true,
    description: "Composés chimiques issus des processus industriels.",
    healthRisks:
      "Variable selon la substance, risques cancérigènes et toxiques.",
    regulation:
      "Encadrement par le Code de l'environnement et les normes REACH.",
    exposureSources:
      "Déchets industriels, effluents rejetés dans l'environnement.",
    enfants: [
      {
        id: "substances-industrielles-1-4-dioxane",
        nom_affichage: "1,4-Dioxane",
        disable: false,
        enfants: [],
        description: "Solvant industriel persistant dans l'eau.",
        healthRisks: "Cancérigène probable, toxicité rénale et hépatique.",
        regulation: "Surveillance en cours, pas de norme spécifique.",
        exposureSources:
          "Industries pharmaceutiques et plastiques, eau contaminée.",
      },
      {
        id: "substances-industrielles-perchlorate",
        nom_affichage: "Perchlorate",
        disable: false,
        enfants: [],
        description:
          "Produit chimique utilisé dans les explosifs et les engrais.",
        healthRisks: "Perturbateur thyroïdien.",
        regulation: "Valeur-guide en eau potable (4 µg/L en France).",
        exposureSources: "Munitions, feux d'artifice, engrais contaminés.",
      },
    ],
  },
  {
    id: "metaux-lourds",
    nom_affichage: "Métaux lourds",
    disable: true,
    description:
      "Éléments toxiques présents naturellement ou issus de l'activité humaine.",
    healthRisks: "Cancers, atteintes neurologiques, troubles rénaux.",
    regulation:
      "Réglementation stricte selon le métal (Plomb, Mercure, Cadmium, etc.).",
    exposureSources:
      "Pollution industrielle, anciennes canalisations, alimentation.",
    enfants: [
      {
        id: "metaux-lourds-arsenic",
        nom_affichage: "Arsenic",
        disable: false,
        enfants: [],
        description: "Métal toxique d'origine naturelle et industrielle.",
        healthRisks: "Cancérigène avéré, toxicité chronique.",
        regulation: "Limite de 10 µg/L en eau potable.",
        exposureSources: "Eau souterraine, pesticides, industries.",
      },
      {
        id: "metaux-lourds-plomb",
        nom_affichage: "Plomb",
        disable: false,
        enfants: [],
        description:
          "Métal autrefois utilisé dans les canalisations et peintures.",
        healthRisks:
          "Neurotoxique, saturnisme, atteintes rénales et cardiovasculaires.",
        regulation:
          "Interdit dans l'essence et les peintures, limite de 10 µg/L en eau potable.",
        exposureSources:
          "Vieilles canalisations, pollution industrielle, sol contaminé.",
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
