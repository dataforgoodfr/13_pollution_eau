/**
 * Parse a property name into its components
 * @param propertyName The full property name in format period_category_variable
 * @returns An object with the period, category, and variable
 */
export function parsePropertyName(propertyName: string): {
  period: string;
  category: string;
  variable: string;
} | null {
  // Handle null or empty values
  if (!propertyName) {
    return null;
  }

  // Uses regex to match the pattern
  const pattern = /^(bilan_annuel_\d{4}|dernier_prel)_([^_]+)_(.+)$/;
  const match = propertyName.match(pattern);

  // If the property name doesn't match our expected format
  if (!match) {
    return null;
  }

  // Extract components from regex match
  const [, period, category, variable] = match;

  return {
    period,
    category,
    variable,
  };
}

/**
 * Get the full property name from components
 * @param period The period (e.g., "bilan_annuel_2022", "dernier_prel")
 * @param category The category (e.g., "pfas", "cvm")
 * @param variable The variable (e.g., "resultat", "dernier_prel_valeur")
 * @returns The full property name
 */
export function getPropertyName(
  period: string,
  category: string,
  variable: string,
): string {
  return `${period}_${category}_${variable}`;
}
