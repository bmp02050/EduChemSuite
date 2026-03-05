export type LonePairPosition = 'top' | 'bottom' | 'left' | 'right';

export interface LonePair {
  position: LonePairPosition;
}

export interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
  charge?: number;
  lonePairs?: LonePair[];
  formalCharge?: number;
}

/** Valence electrons by element for formal charge calculation */
export const VALENCE_ELECTRONS: Record<string, number> = {
  H: 1, C: 4, N: 5, O: 6, F: 7, Cl: 7, Br: 7, I: 7, S: 6, P: 5,
};
