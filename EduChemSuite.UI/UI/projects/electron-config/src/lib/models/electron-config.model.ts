export type SpinDirection = 'up' | 'down';

export interface OrbitalElectron {
  spin: SpinDirection;
}

export interface OrbitalBox {
  electrons: OrbitalElectron[];
}

export interface Orbital {
  name: string;
  subshell: 's' | 'p' | 'd' | 'f';
  n: number;
  maxElectrons: number;
  boxCount: number;
  boxes: OrbitalBox[];
}

export interface ElectronConfiguration {
  element?: string;
  atomicNumber?: number;
  orbitals: Orbital[];
}

/** Generate notation string like "1s² 2s² 2p⁶ 3s¹" */
export function configToNotation(config: ElectronConfiguration): string {
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return config.orbitals
    .filter(o => totalElectrons(o) > 0)
    .map(o => {
      const count = totalElectrons(o);
      const sup = String(count).split('').map(c => superscripts[c] || c).join('');
      return `${o.name}${sup}`;
    })
    .join(' ');
}

export function totalElectrons(orbital: Orbital): number {
  return orbital.boxes.reduce((sum, b) => sum + b.electrons.length, 0);
}
