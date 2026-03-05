import { Atom } from './atom.model';
import { Bond } from './bond.model';
export interface MoleculeGraph {
    atoms: Atom[];
    bonds: Bond[];
}
