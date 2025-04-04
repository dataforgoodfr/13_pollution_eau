import { POLLUTANT_CATEGORIES } from "./polluantConfig";

const activeCat = ["cvm", "tous-polluants", "pfas"];

export const availableCategories = POLLUTANT_CATEGORIES.map((p) => ({
  id: p.id.toLowerCase(),
  label: p.shortName.toUpperCase(),
  disabled: !activeCat.includes(p.id.toLowerCase()),
}));

export function formatCategoryName(id: string) {
  const category = availableCategories.find((category) => category.id === id);
  return category ? category.label : id;
}
