
export const availableCategories = [
  { id: "cvm", label: "Chlorure de Vinyle Monomère", disabled:false },
  { id: "pesticides", label: "Pesticide", disabled:true },
  { id: "pfas", label: "Pfas", disabled:true },
  { id: "metauxlourds", label: "Métaux lourds",disabled:true },
  { id: "minéral", label: "Minéral", disabled:true },
  { id: "microbio", label: "Microbio", disabled:true },
  { id: "radioactivité", label: "Radioactivité", disabled:true },
  { id: "médicament", label: "Médicament", disabled:true },
  { id: "nitrite", label: "Nitrites", disabled:true },
  { id: "phtalate", label: "Phtalate", disabled:true },
  { id: "phénol", label: "Phénol", disabled:true },
  { id: "hap", label: "Hap", disabled:true },
  { id: "perchlorate", label: "Perchlorate", disabled:true },
  { id: "dioxine_et_furane", label: "Dioxine et Furane", disabled:true },
];

export function formatCategoryName(id: string) {
  const category = availableCategories.find((category) => category.id === id);
  return category ? category.label : id;
}
