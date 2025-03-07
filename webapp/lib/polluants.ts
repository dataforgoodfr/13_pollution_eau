export const availableCategories = [
  { id: "cvm", label: "Chlorure de Vinyle Monomère" },
  { id: "pesticides", label: "Pesticides" },
];

export function formatCategoryName(id: string) {
  const category = availableCategories.find((category) => category.id === id);
  return category ? category.label : id;
}
