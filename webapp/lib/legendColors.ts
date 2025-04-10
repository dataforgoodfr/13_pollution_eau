interface LegendColor {
  category: string;
  label: string | null;
  color: string | null;
}

export const categoryNameMapping = {
  cvm: "CVM",
  pesticides: "Pesticides",
  pfas: "PFAS",
};

// exported from https://docs.google.com/spreadsheets/d/1YOj05YwsN8u-VkncXaEbWKcC0zIcDXzR7W3BeEGJ7Kg/edit?gid=131077573#gid=131077573
export const legendColors: LegendColor[] = [
  {
    category: "Tous polluants",
    label: "Aucun dépassement des valeurs seuils",
    color: "#B4E681",
  },
  {
    category: "Tous polluants",
    label:
      "Au moins un paramètre au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Tous polluants",
    label:
      "Au moins un paramètre au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides",
    label: "Aucun paramètre quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides",
    label:
      "Au moins un paramètre quantifié mais aucun dépassement des valeurs seuils",
    color: "#B4E681",
  },
  {
    category: "Pesticides",
    label:
      "Au moins un paramètre au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides",
    label:
      "Au moins un paramètre au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Substances actives",
    label: "Aucun paramètre quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Substances actives",
    label:
      "Au moins un paramètre quantifié mais aucun dépassement des valeurs seuils",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Substances actives",
    label:
      "Au moins un paramètre au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Substances actives",
    label:
      "Au moins un paramètre au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Métabolites",
    label: "Aucun paramètre quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Métabolites",
    label:
      "Au moins un paramètre quantifié mais aucun dépassement des valeurs seuils",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Métabolites",
    label:
      "Au moins un paramètre au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Métabolites",
    label:
      "Au moins un paramètre au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Métabolites - ESA-métolachlore",
    label: "Paramètre non recheché",
    color: "hachuré",
  },
  {
    category: "Pesticides - Métabolites - ESA-métolachlore",
    label: "Paramètre non quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Métabolites - ESA-métolachlore",
    label:
      "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Métabolites - ESA-métolachlore",
    label: "?",
    color: "#EFE765",
  },
  {
    category: "Pesticides - Métabolites - ESA-métolachlore",
    label:
      "Paramètre quantifié au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Métabolites - ESA-métolachlore",
    label:
      "Paramètre quantifié au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Métabolites - Chlorothalonil R471811",
    label: "Paramètre non recheché",
    color: "hachuré",
  },
  {
    category: "Pesticides - Métabolites - Chlorothalonil R471811",
    label: "Paramètre non quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Métabolites - Chlorothalonil R471811",
    label:
      "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Métabolites - Chlorothalonil R471811",
    label: "?",
    color: "#EFE765",
  },
  {
    category: "Pesticides - Métabolites - Chlorothalonil R471811",
    label:
      "Paramètre quantifié au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Métabolites - Chlorothalonil R471811",
    label:
      "Paramètre quantifié au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone desphényl",
    label: "Paramètre non recheché",
    color: "hachuré",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone desphényl",
    label: "Paramètre non quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone desphényl",
    label:
      "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone desphényl",
    label:
      "Paramètre quantifié au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone desphényl",
    label:
      "Paramètre quantifié au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone methyl desphényl",
    label: "Paramètre non recheché",
    color: "hachuré",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone methyl desphényl",
    label: "Paramètre non quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone methyl desphényl",
    label:
      "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone methyl desphényl",
    label:
      "Paramètre quantifié au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Métabolites - Chloridazone methyl desphényl",
    label:
      "Paramètre quantifié au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Pesticides - Métabolites - Atrazine déséthyl",
    label: "Paramètre non recheché",
    color: "hachuré",
  },
  {
    category: "Pesticides - Métabolites - Atrazine déséthyl",
    label: "Paramètre non quantifié",
    color: "#75D3B4",
  },
  {
    category: "Pesticides - Métabolites - Atrazine déséthyl",
    label:
      "Paramètre quantifié mais en dessous de la limite de qualité (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Pesticides - Métabolites - Atrazine déséthyl",
    label:
      "Paramètre quantifié au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Pesticides - Métabolites - Atrazine déséthyl",
    label:
      "Paramètre quantifié au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Nitrites et nitrates",
    label: "Concentration inférieure aux valeurs seuils : eau conforme",
    color: "#B4E681",
  },
  {
    category: "Nitrites et nitrates",
    label: "Concentration supérieure aux valeurs seuils : eau non conforme",
    color: "#FB726C",
  },
  {
    category: "PFAS",
    label: "PFAS non recherchés",
    color: "hachuré",
  },
  {
    category: "PFAS",
    label: "Aucun paramètre quantifié",
    color: "#75D3B4",
  },
  {
    category: "PFAS",
    label:
      "Au moins un paramètre quantifié mais concentration inférieure aux valeurs seuils",
    color: "#B4E681",
  },
  {
    category: "PFAS",
    label:
      "Concerntration des PFOA, PFOS, PFNA, PFHxS supérieure à la recommendation (0.02 µg/L)",
    color: "#EFE765",
  },
  {
    category: "PFAS",
    label:
      "Concerntration totale en PFAS supérieure à la recommendation (>0,1 µg/L)",
    color: "#FBBD6C",
  },
  {
    category: "PFAS",
    label: "Au moins un paramètre au dessus de la limite sanitaire",
    color: "#FB726C",
  },
  {
    category: "CVM",
    label: "CVM non recherché",
    color: "hachuré",
  },
  {
    category: "CVM",
    label: "CVM non quantifié",
    color: "#75D3B4",
  },
  {
    category: "CVM",
    label:
      "CVM quantifié en concentration inférieure à la limite sanitaire (norme ou recommendation)",
    color: "#EFE765",
  },
  {
    category: "CVM",
    label:
      "CVM quantifié en concentration supérieure à la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Métaux lourds",
    label: null,
    color: null,
  },
  {
    category: "Métaux lourds - Arsenic",
    label: null,
    color: null,
  },
  {
    category: "Métaux lourds - Plomb",
    label: null,
    color: null,
  },
  {
    category: "Substances industrielles",
    label: "Aucun paramètre recherché",
    color: "hachuré",
  },
  {
    category: "Substances industrielles",
    label: "Aucun paramètre quantifié",
    color: "#75D3B4",
  },
  {
    category: "Substances industrielles",
    label:
      "Au moins un paramètre au dessus de la limite de qualité (norme ou recommendation)",
    color: "#FBBD6C",
  },
  {
    category: "Substances industrielles",
    label:
      "Au moins un paramètre au dessus de la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Substances industrielles - 1,4 dioxane",
    label: "Paramètre non recherché",
    color: "hachuré",
  },
  {
    category: "Substances industrielles - 1,4 dioxane",
    label: "Paramètre non.quantifié",
    color: "#75D3B4",
  },
  {
    category: "Substances industrielles - 1,4 dioxane",
    label:
      "Paramètre quantifié mais en concentration inférieure à la limite sanitaire (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Substances industrielles - 1,4 dioxane",
    label:
      "Paramètre quantifié en concentration supérieure à la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
  {
    category: "Substances industrielles - perchlorate",
    label: "Paramètre non recherché",
    color: "hachuré",
  },
  {
    category: "Substances industrielles - perchlorate",
    label: "Paramètre non.quantifié",
    color: "#75D3B4",
  },
  {
    category: "Substances industrielles - perchlorate",
    label:
      "Paramètre quantifié mais en concentration inférieure à la limite sanitaire (norme ou recommendation)",
    color: "#B4E681",
  },
  {
    category: "Substances industrielles - perchlorate",
    label:
      "Paramètre quantifié en concentration supérieure à la limite sanitaire (norme ou recommendation)",
    color: "#FB726C",
  },
];
