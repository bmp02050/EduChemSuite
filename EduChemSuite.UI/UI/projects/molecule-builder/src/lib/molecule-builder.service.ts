import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Atom, LonePairPosition, VALENCE_ELECTRONS } from './models/atom.model';
import { Bond, BondType } from './models/bond.model';
import { MoleculeGraph } from './models/molecule-graph.model';

export type InteractionMode = 'select' | 'placeAtom' | 'drawBond' | 'erase' | 'lonePair';

@Injectable()
export class MoleculeBuilderService {
  private atoms$ = new BehaviorSubject<Atom[]>([]);
  private bonds$ = new BehaviorSubject<Bond[]>([]);
  private selectedElement$ = new BehaviorSubject<string>('C');
  private selectedBondType$ = new BehaviorSubject<BondType>('single');
  private mode$ = new BehaviorSubject<InteractionMode>('select');
  private selectedAtomId$ = new BehaviorSubject<string | null>(null);
  private idCounter = 0;

  readonly atoms = this.atoms$.asObservable();
  readonly bonds = this.bonds$.asObservable();
  readonly selectedElement = this.selectedElement$.asObservable();
  readonly selectedBondType = this.selectedBondType$.asObservable();
  readonly mode = this.mode$.asObservable();
  readonly selectedAtomId = this.selectedAtomId$.asObservable();

  private generateId(): string {
    return `node-${++this.idCounter}-${Date.now()}`;
  }

  getGraph(): MoleculeGraph {
    return {
      atoms: [...this.atoms$.value],
      bonds: [...this.bonds$.value],
    };
  }

  loadGraph(graph: MoleculeGraph): void {
    this.atoms$.next([...graph.atoms]);
    this.bonds$.next([...graph.bonds]);
    this.selectedAtomId$.next(null);
  }

  clear(): void {
    this.atoms$.next([]);
    this.bonds$.next([]);
    this.selectedAtomId$.next(null);
    this.idCounter = 0;
  }

  setMode(mode: InteractionMode): void {
    this.mode$.next(mode);
    if (mode !== 'select') {
      this.selectedAtomId$.next(null);
    }
  }

  setSelectedElement(element: string): void {
    this.selectedElement$.next(element);
    this.setMode('placeAtom');
  }

  setSelectedBondType(type: BondType): void {
    this.selectedBondType$.next(type);
    this.setMode('drawBond');
  }

  selectAtom(atomId: string | null): void {
    this.selectedAtomId$.next(atomId);
  }

  addAtom(x: number, y: number): Atom {
    const atom: Atom = {
      id: this.generateId(),
      element: this.selectedElement$.value,
      x,
      y,
    };
    this.atoms$.next([...this.atoms$.value, atom]);
    return atom;
  }

  moveAtom(atomId: string, x: number, y: number): void {
    const atoms = this.atoms$.value.map((a) =>
      a.id === atomId ? { ...a, x, y } : a
    );
    this.atoms$.next(atoms);
  }

  removeAtom(atomId: string): void {
    this.atoms$.next(this.atoms$.value.filter((a) => a.id !== atomId));
    this.bonds$.next(
      this.bonds$.value.filter(
        (b) => b.fromAtomId !== atomId && b.toAtomId !== atomId
      )
    );
    if (this.selectedAtomId$.value === atomId) {
      this.selectedAtomId$.next(null);
    }
  }

  addBond(fromAtomId: string, toAtomId: string): Bond | null {
    if (fromAtomId === toAtomId) return null;

    const exists = this.bonds$.value.find(
      (b) =>
        (b.fromAtomId === fromAtomId && b.toAtomId === toAtomId) ||
        (b.fromAtomId === toAtomId && b.toAtomId === fromAtomId)
    );
    if (exists) return null;

    const bond: Bond = {
      id: this.generateId(),
      fromAtomId,
      toAtomId,
      type: this.selectedBondType$.value,
    };
    this.bonds$.next([...this.bonds$.value, bond]);
    return bond;
  }

  removeBond(bondId: string): void {
    this.bonds$.next(this.bonds$.value.filter((b) => b.id !== bondId));
  }

  getAtomById(id: string): Atom | undefined {
    return this.atoms$.value.find((a) => a.id === id);
  }

  get currentMode(): InteractionMode {
    return this.mode$.value;
  }

  /** Add a lone pair to an atom. Auto-picks next available position. */
  addLonePair(atomId: string): void {
    const atoms = this.atoms$.value.map(a => {
      if (a.id !== atomId) return a;
      const pairs = a.lonePairs ?? [];
      const used = new Set(pairs.map(p => p.position));
      const positions: LonePairPosition[] = ['top', 'right', 'bottom', 'left'];
      const next = positions.find(p => !used.has(p));
      if (!next) return a; // all 4 positions taken
      return { ...a, lonePairs: [...pairs, { position: next }] };
    });
    this.atoms$.next(atoms);
  }

  /** Remove last lone pair from an atom. */
  removeLonePair(atomId: string): void {
    const atoms = this.atoms$.value.map(a => {
      if (a.id !== atomId) return a;
      const pairs = a.lonePairs ?? [];
      if (pairs.length === 0) return a;
      return { ...a, lonePairs: pairs.slice(0, -1) };
    });
    this.atoms$.next(atoms);
  }

  /** Calculate and set formal charges on all atoms.
   *  Formal charge = valence electrons − lone pair electrons − bond electrons shared
   */
  calculateFormalCharges(): void {
    const bonds = this.bonds$.value;
    const bondCountMap = new Map<string, number>();

    for (const bond of bonds) {
      const bondElectrons = bond.type === 'triple' ? 3 : bond.type === 'double' ? 2 : 1;
      bondCountMap.set(bond.fromAtomId, (bondCountMap.get(bond.fromAtomId) ?? 0) + bondElectrons);
      bondCountMap.set(bond.toAtomId, (bondCountMap.get(bond.toAtomId) ?? 0) + bondElectrons);
    }

    const atoms = this.atoms$.value.map(a => {
      const valence = VALENCE_ELECTRONS[a.element];
      if (valence === undefined) return { ...a, formalCharge: 0 };
      const lonePairElectrons = (a.lonePairs?.length ?? 0) * 2;
      const bondElectrons = bondCountMap.get(a.id) ?? 0;
      const formalCharge = valence - lonePairElectrons - bondElectrons;
      return { ...a, formalCharge };
    });
    this.atoms$.next(atoms);
  }
}
