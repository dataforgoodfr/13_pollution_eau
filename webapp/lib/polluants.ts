export const availableCategories = [
  {
    id: "tous polluants",
    nom_affichage: "Tous les polluants",
    disable: false,
    enfants: [],
  },
  { id: "pfas", nom_affichage: "PFAS", enfants: [], disable: false },
  {
    id: "pesticides",
    nom_affichage: "Pesticides",
    disable: false,
    enfants: [
      {
        id: "substances actives",
        nom_affichage: "Substances actives",
        disable: false,
        enfants: [],
      },
      {
        id: "métabolite de pesticide",
        nom_affichage: "Métabolites",
        disable: false,
        enfants: [
          {
            id: "substances actives",
            nom_affichage: "Métabolites ESA-métachlore",
            enfants: [],
            disable: false,
          },
          {
            id: "substances actives",
            nom_affichage: "Métabolites Chlorothalonil R471811",
            enfants: [],
            disable: false,
          },
          {
            id: "substances actives",
            nom_affichage: "Métabolites Chloridazone desphényl",
            enfants: [],
            disable: false,
          },
          {
            id: "substances actives",
            nom_affichage: "Métabolites Atrazine déséthyl",
            enfants: [],
            disable: false,
          },
        ],
      },
    ],
  },
  {
    id: "nitrite",
    nom_affichage: "Nitrates et Nitrites",
    disable: false,
    enfants: [],
  },
  { id: "cvm", nom_affichage: "CVM", disable: false, enfants: [] },
  {
    id: "substances industrielles",
    nom_affichage: "Substances industrielles",
    disable: true,
    enfants: [
      {
        id: "1,4-dioxane",
        nom_affichage: "1,4-Dioxane",
        disable: false,
        enfants: [],
      },
      {
        id: "perchlorate",
        nom_affichage: "Perchlorate",
        disable: false,
        enfants: [],
      },
    ],
  },
  {
    id: "métaux lourds",
    nom_affichage: "Métaux lourds",
    disable: true,
    enfants: [
      { id: "arsenic", nom_affichage: "Arsenic", disable: false, enfants: [] },
      { id: "plomb", nom_affichage: "Plomb", disable: false, enfants: [] },
    ],
  },
];

export function formatCategoryName(id: string) {
  const category = availableCategories.find((category) => category.id === id);
  return category ? category.label : id;
}
