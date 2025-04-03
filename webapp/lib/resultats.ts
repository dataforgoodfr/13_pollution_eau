export const resultatsDetails = {
  // pfas
  aucun_parametre_quantifie: {
    label: "Aucun paramètre quantifié",
    color: "#75D3B4",
  },
  somme_20pfas_inf_0_1_et_4pfas_inf_0_02: {
    label:
      "Au moins un paramètre quantifié mais concentration inférieure aux valeurs seuils",
    color: "#B4E681",
  },
  somme_20pfas_inf_0_1_et_4pfas_sup_0_02: {
    label:
      "Concerntration des PFOA, PFOS, PFNA, PFHxS supérieure à la recommendation (0.02 µg/L)",
    color: "#EFE765",
  },
  somme_20pfas_sup_0_1: {
    label:
      "Concerntration totale en PFAS supérieure à la recommendation (>0,1 µg/L)",
    color: "#FBBD6C",
  },
  un_pfas_sup_valeur_sanitaire: {
    label: "Au moins un paramètre au dessus de la limite sanitaire",
    color: "#FB726C",
  },
  // cvm
  non_quantifie: {
    label: "CVM non quantifié",
    color: "#75D3B4",
  },
  inf_0_5: {
    label: "CVM quantifié mais < 0,5 µg/L",
    color: "#EFE765",
  },
  sup_0_5: {
    label: "CVM > 0,5 µg/L (fait passer l'affichage total polluant en rouge)",
    color: "#FB726C",
  },
};
