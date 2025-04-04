import { POLLUTANT_CATEGORIES } from "./polluantConfig";

export const availableCategories = POLLUTANT_CATEGORIES.map((p) => ({
  id: p.id.toLowerCase(),
  label: p.shortName.toUpperCase(),
  disabled:
    p.id.toLowerCase() != "cvm" && p.id.toLowerCase() != "tous-polluants",
}));

export function formatCategoryName(id: string) {
  const category = availableCategories.find((category) => category.id === id);
  return category ? category.label : id;
}
