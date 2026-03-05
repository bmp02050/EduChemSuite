export type BondType = 'single' | 'double' | 'triple';

export interface Bond {
  id: string;
  fromAtomId: string;
  toAtomId: string;
  type: BondType;
}
