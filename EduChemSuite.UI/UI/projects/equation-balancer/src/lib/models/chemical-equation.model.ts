export interface Compound {
  formula: string;
  coefficient: number;
}

export interface ChemicalEquation {
  reactants: Compound[];
  products: Compound[];
}

/**
 * Parse a string like "2Fe + 3Cl2 -> 2FeCl3" into a ChemicalEquation.
 * Supports -> or → as separator.
 */
export function parseEquationString(input: string): ChemicalEquation | null {
  const sep = input.includes('→') ? '→' : '->';
  const parts = input.split(sep);
  if (parts.length !== 2) return null;

  const parseCompounds = (side: string): Compound[] =>
    side.split('+').map(s => s.trim()).filter(Boolean).map(token => {
      const match = token.match(/^(\d+)?\s*(.+)$/);
      if (!match) return { formula: token, coefficient: 1 };
      return {
        formula: match[2].trim(),
        coefficient: match[1] ? parseInt(match[1], 10) : 1,
      };
    });

  const reactants = parseCompounds(parts[0]);
  const products = parseCompounds(parts[1]);

  if (reactants.length === 0 || products.length === 0) return null;
  return { reactants, products };
}

/**
 * Render a formula with proper subscripts in HTML.
 * e.g., "H2O" → "H<sub>2</sub>O", "Fe2O3" → "Fe<sub>2</sub>O<sub>3</sub>"
 */
export function formulaToHtml(formula: string): string {
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}
