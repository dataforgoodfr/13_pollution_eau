export interface PollutantCategory {
  id: string;
  shortName: string;
  longName: string;
  subtitle: string;
  description: string;
  exposureSources: string;
  healthRisks: string;
  regulation: string;
}

export const POLLUTANT_CATEGORIES: PollutantCategory[] = [
  {
    id: "tous-polluants",
    shortName: "Tous polluants",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description:
      "Ensemble des substances chimiques et biologiques pouvant contaminer l'eau, l'air et les sols.",
    exposureSources: "Eau potable, air, alimentation, sols contaminés.",
    healthRisks:
      "Dépend du polluant : effets cancérigènes, neurotoxiques, perturbateurs endocriniens, maladies chroniques, etc.",
    regulation: "Directive cadre sur l'eau (DCE), Code de l'environnement.",
  },
  {
    id: "pesticides",
    shortName: "Pesticides",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description:
      "Substances chimiques utilisées pour lutter contre les nuisibles agricoles.",
    exposureSources:
      "Agriculture, consommation de produits traités, eau potable.",
    healthRisks:
      "Cancers, troubles neurologiques, perturbations endocriniennes, toxicité aiguë.",
    regulation:
      "LMR (Limites Maximales de Résidus), règlement (CE) n°1107/2009.",
  },
  {
    id: "pesticides-substances-actives",
    shortName: "Substances actives",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description:
      "Molécules ayant un effet biocide contre les organismes nuisibles.",
    exposureSources:
      "Pulvérisation agricole, résidus dans l'eau et les aliments.",
    healthRisks:
      "Toxicité variable : certains sont cancérigènes ou reprotoxiques.",
    regulation: "Autorisation par l'ANSES, encadrement par l'UE.",
  },
  {
    id: "pesticides-metabolites",
    shortName: "Métabolites",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Produits de dégradation des substances actives.",
    exposureSources:
      "Dégradation dans l'eau et les sols, consommation d'eau potable.",
    healthRisks:
      "Moins étudiés que les substances actives, certains sont toxiques.",
    regulation:
      "Réglementation récente : seuils pour certains métabolites en eau potable.",
  },
  {
    id: "pesticides-metabolites-esa-metolachlore",
    shortName: "ESA-métolachlore",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Métabolite du métolachlore, herbicide.",
    exposureSources: "Contamination de l'eau souterraine.",
    healthRisks: "Peu de données, potentiellement toxique.",
    regulation: "Limite de 0,1 µg/L en eau potable.",
  },
  {
    id: "pesticides-metabolites-chlorothalonil-r471811",
    shortName: "Chlorothalonil R471811",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Métabolite du fongicide chlorothalonil.",
    exposureSources: "Présent dans les nappes phréatiques.",
    healthRisks: "Classé comme probablement cancérigène.",
    regulation: "Interdit en 2019 par l'UE.",
  },
  {
    id: "pesticides-metabolites-chloridazone-desphenyl",
    shortName: "Chloridazone desphényl",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description:
      "Métabolite de la chloridazone, herbicide utilisé pour les betteraves.",
    exposureSources: "Présent dans les eaux souterraines.",
    healthRisks: "Potentiellement toxique.",
    regulation: "Limite de 0,1 µg/L en eau potable.",
  },
  {
    id: "pesticides-metabolites-chloridazone-methyl-desphenyl",
    shortName: "Chloridazone methyl desphényl",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Autre métabolite de la chloridazone.",
    exposureSources: "Contamination des ressources en eau.",
    healthRisks: "Effets toxiques incertains.",
    regulation: "Surveillance renforcée en eau potable.",
  },
  {
    id: "pesticides-metabolites-atrazine-desethyl",
    shortName: "Atrazine déséthyl",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Métabolite de l'atrazine, herbicide interdit depuis 2003.",
    exposureSources: "Contamination résiduelle des sols et nappes.",
    healthRisks: "Suspecté d'être perturbateur endocrinien.",
    regulation: "Limite de 0,1 µg/L en eau potable.",
  },
  {
    id: "nitrites-et-nitrates",
    shortName: "Nitrites et nitrates",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description:
      "Résidus azotés provenant des engrais et des déchets organiques.",
    exposureSources:
      "Agriculture intensive, effluents industriels et domestiques.",
    healthRisks: "Méthémoglobinémie, risque de cancer gastro-intestinal.",
    regulation:
      "Limite de 50 mg/L pour les nitrates, 0,5 mg/L pour les nitrites en eau potable.",
  },
  {
    id: "pfas",
    shortName: "PFAS",
    longName: "per- et polyfluoroalkylées",
    subtitle: "lorem ipsum",
    description:
      "Polluants éternels, utilisés dans l'industrie pour leurs propriétés antiadhésives et imperméables.",
    exposureSources:
      "Ustensiles de cuisine, emballages alimentaires, eau potable.",
    healthRisks:
      "Perturbateurs endocriniens, cancers, toxicité hépatique et immunitaire.",
    regulation:
      "Réglementation en cours d'évolution, restriction progressive en Europe.",
  },
  {
    id: "cvm",
    shortName: "CVM",
    longName: "chlorure de vinyle monomère",
    subtitle: "lorem ipsum",
    description: "Utilisé pour produire le PVC, polluant volatil.",
    exposureSources: "Industrie plastique, eau contaminée.",
    healthRisks: "Cancérigène avéré, hépatotoxicité.",
    regulation: "Seuil de 0,5 µg/L en eau potable.",
  },
  {
    id: "metaux-lourds",
    shortName: "Métaux lourds",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description:
      "Éléments toxiques présents naturellement ou issus de l'activité humaine.",
    exposureSources:
      "Pollution industrielle, anciennes canalisations, alimentation.",
    healthRisks: "Cancers, atteintes neurologiques, troubles rénaux.",
    regulation:
      "Réglementation stricte selon le métal (Plomb, Mercure, Cadmium, etc.).",
  },
  {
    id: "metaux-lourds-arsenic",
    shortName: "Arsenic",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Métal toxique d'origine naturelle et industrielle.",
    exposureSources: "Eau souterraine, pesticides, industries.",
    healthRisks: "Cancérigène avéré, toxicité chronique.",
    regulation: "Limite de 10 µg/L en eau potable.",
  },
  {
    id: "metaux-lourds-plomb",
    shortName: "Plomb",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Métal autrefois utilisé dans les canalisations et peintures.",
    exposureSources:
      "Vieilles canalisations, pollution industrielle, sol contaminé.",
    healthRisks:
      "Neurotoxique, saturnisme, atteintes rénales et cardiovasculaires.",
    regulation:
      "Interdit dans l'essence et les peintures, limite de 10 µg/L en eau potable.",
  },
  {
    id: "substances-industrielles",
    shortName: "Substances industrielles",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Composés chimiques issus des processus industriels.",
    exposureSources:
      "Déchets industriels, effluents rejetés dans l'environnement.",
    healthRisks:
      "Variable selon la substance, risques cancérigènes et toxiques.",
    regulation:
      "Encadrement par le Code de l'environnement et les normes REACH.",
  },
  {
    id: "substances-industrielles-1-4-dioxane",
    shortName: "1,4 dioxane",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Solvant industriel persistant dans l'eau.",
    exposureSources:
      "Industries pharmaceutiques et plastiques, eau contaminée.",
    healthRisks: "Cancérigène probable, toxicité rénale et hépatique.",
    regulation: "Surveillance en cours, pas de norme spécifique.",
  },
  {
    id: "substances-industrielles-perchlorate",
    shortName: "Perchlorate",
    longName: "n/a",
    subtitle: "lorem ipsum",
    description: "Produit chimique utilisé dans les explosifs et les engrais.",
    exposureSources: "Munitions, feux d'artifice, engrais contaminés.",
    healthRisks: "Perturbateur thyroïdien.",
    regulation: "Valeur-guide en eau potable (4 µg/L en France).",
  },
];

// Helper function to get a category by ID
export function getCategoryById(id: string): PollutantCategory | undefined {
  return POLLUTANT_CATEGORIES.find((category) => category.id === id);
}

export function getCategoryIdAndShortname() {
  return POLLUTANT_CATEGORIES.map((p) => ({
    id: p.id,
    shortName: p.shortName,
  }));
}
