export interface SubshellInfo {
  name: string;
  n: number;
  l: number;
  subshell: 's' | 'p' | 'd' | 'f';
  maxElectrons: number;
  boxCount: number;
}

/** Aufbau filling order for electron configuration */
export const AUFBAU_ORDER: SubshellInfo[] = [
  { name: '1s', n: 1, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '2s', n: 2, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '2p', n: 2, l: 1, subshell: 'p', maxElectrons: 6,  boxCount: 3 },
  { name: '3s', n: 3, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '3p', n: 3, l: 1, subshell: 'p', maxElectrons: 6,  boxCount: 3 },
  { name: '4s', n: 4, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '3d', n: 3, l: 2, subshell: 'd', maxElectrons: 10, boxCount: 5 },
  { name: '4p', n: 4, l: 1, subshell: 'p', maxElectrons: 6,  boxCount: 3 },
  { name: '5s', n: 5, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '4d', n: 4, l: 2, subshell: 'd', maxElectrons: 10, boxCount: 5 },
  { name: '5p', n: 5, l: 1, subshell: 'p', maxElectrons: 6,  boxCount: 3 },
  { name: '6s', n: 6, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '4f', n: 4, l: 3, subshell: 'f', maxElectrons: 14, boxCount: 7 },
  { name: '5d', n: 5, l: 2, subshell: 'd', maxElectrons: 10, boxCount: 5 },
  { name: '6p', n: 6, l: 1, subshell: 'p', maxElectrons: 6,  boxCount: 3 },
  { name: '7s', n: 7, l: 0, subshell: 's', maxElectrons: 2,  boxCount: 1 },
  { name: '5f', n: 5, l: 3, subshell: 'f', maxElectrons: 14, boxCount: 7 },
  { name: '6d', n: 6, l: 2, subshell: 'd', maxElectrons: 10, boxCount: 5 },
  { name: '7p', n: 7, l: 1, subshell: 'p', maxElectrons: 6,  boxCount: 3 },
];

/**
 * Parse a subshell config string (e.g., "1s2 2s2 2p6") into orbital filling data.
 */
export function parseSubshellConfig(config: string): { name: string; electrons: number }[] {
  const regex = /(\d[spdf])(\d+)/g;
  const result: { name: string; electrons: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(config)) !== null) {
    result.push({ name: match[1], electrons: parseInt(match[2], 10) });
  }
  return result;
}

/**
 * Generate the aufbau-principle electron configuration for a given electron count.
 * Returns orbitals in filling order with electron counts.
 * Note: This follows strict aufbau — real elements have exceptions (Cr, Cu, etc.)
 */
export function generateAufbauConfig(electronCount: number): { name: string; electrons: number }[] {
  const result: { name: string; electrons: number }[] = [];
  let remaining = electronCount;

  for (const subshell of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const fill = Math.min(remaining, subshell.maxElectrons);
    result.push({ name: subshell.name, electrons: fill });
    remaining -= fill;
  }

  return result;
}
