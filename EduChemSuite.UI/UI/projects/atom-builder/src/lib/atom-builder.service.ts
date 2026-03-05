import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AtomicStructureGraph } from './models/atomic-structure.model';
import { ELEMENTS, getShellMax } from './models/element-data.model';

@Injectable()
export class AtomBuilderService {
  private graph$ = new BehaviorSubject<AtomicStructureGraph>({
    nucleus: { protons: 1, neutrons: 0 },
    shells: [{ n: 1, electrons: 1, maxElectrons: 2 }],
    element: 'H',
    atomicNumber: 1,
    massNumber: 1,
  });

  readonly graph = this.graph$.asObservable();

  getGraph(): AtomicStructureGraph {
    return this.graph$.value;
  }

  loadGraph(g: AtomicStructureGraph): void {
    this.graph$.next({ ...g });
  }

  clear(): void {
    this.graph$.next({
      nucleus: { protons: 1, neutrons: 0 },
      shells: [{ n: 1, electrons: 1, maxElectrons: 2 }],
      element: 'H',
      atomicNumber: 1,
      massNumber: 1,
    });
  }

  selectElement(symbol: string): void {
    const el = ELEMENTS.find(e => e.symbol === symbol);
    if (!el) return;
    const shells = el.electronConfig.map((electrons, i) => ({
      n: i + 1,
      electrons,
      maxElectrons: getShellMax(i + 1),
    }));
    this.graph$.next({
      nucleus: { protons: el.atomicNumber, neutrons: el.massNumber - el.atomicNumber },
      shells,
      element: el.symbol,
      atomicNumber: el.atomicNumber,
      massNumber: el.massNumber,
    });
  }

  setProtons(count: number): void {
    if (count < 0 || count > 200) return;
    const g = { ...this.graph$.value };
    g.nucleus = { ...g.nucleus, protons: count };
    g.atomicNumber = count;
    g.massNumber = count + g.nucleus.neutrons;
    g.element = ELEMENTS.find(e => e.atomicNumber === count)?.symbol;
    this.graph$.next(g);
  }

  setNeutrons(count: number): void {
    if (count < 0 || count > 200) return;
    const g = { ...this.graph$.value };
    g.nucleus = { ...g.nucleus, neutrons: count };
    g.massNumber = g.nucleus.protons + count;
    this.graph$.next(g);
  }

  addShell(): void {
    const g = { ...this.graph$.value };
    const nextN = g.shells.length + 1;
    if (nextN > 7) return;
    g.shells = [...g.shells, { n: nextN, electrons: 0, maxElectrons: getShellMax(nextN) }];
    this.graph$.next(g);
  }

  removeShell(): void {
    const g = { ...this.graph$.value };
    if (g.shells.length <= 1) return;
    g.shells = g.shells.slice(0, -1);
    this.graph$.next(g);
  }

  setShellElectrons(shellIndex: number, count: number): void {
    const g = { ...this.graph$.value };
    if (shellIndex < 0 || shellIndex >= g.shells.length) return;
    const shell = g.shells[shellIndex];
    if (count < 0 || count > shell.maxElectrons) return;
    g.shells = g.shells.map((s, i) => i === shellIndex ? { ...s, electrons: count } : s);
    g.element = undefined;
    this.graph$.next(g);
  }

  addElectronToShell(shellIndex: number): void {
    const g = this.graph$.value;
    if (shellIndex < 0 || shellIndex >= g.shells.length) return;
    const shell = g.shells[shellIndex];
    if (shell.electrons < shell.maxElectrons) {
      this.setShellElectrons(shellIndex, shell.electrons + 1);
    }
  }

  removeElectronFromShell(shellIndex: number): void {
    const g = this.graph$.value;
    if (shellIndex < 0 || shellIndex >= g.shells.length) return;
    const shell = g.shells[shellIndex];
    if (shell.electrons > 0) {
      this.setShellElectrons(shellIndex, shell.electrons - 1);
    }
  }
}
