export interface AtomicStructureGraph {
  nucleus: { protons: number; neutrons: number };
  shells: { n: number; electrons: number; maxElectrons: number }[];
  element?: string;
  atomicNumber?: number;
  massNumber?: number;
}
