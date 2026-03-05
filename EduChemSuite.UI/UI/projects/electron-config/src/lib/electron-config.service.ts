import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronConfiguration, Orbital, OrbitalBox } from './models/electron-config.model';
import { AUFBAU_ORDER, parseSubshellConfig } from 'chemistry-data';
import { getElementBySymbol, getElementByNumber } from 'chemistry-data';

@Injectable()
export class ElectronConfigService {
  private readonly _config = new BehaviorSubject<ElectronConfiguration>({ orbitals: [] });
  readonly config$ = this._config.asObservable();

  get config(): ElectronConfiguration {
    return this._config.value;
  }

  loadConfig(c: ElectronConfiguration): void {
    this._config.next(structuredClone(c));
  }

  clear(): void {
    this._config.next({ orbitals: [] });
  }

  /** Initialize empty orbitals up to a given shell level */
  initOrbitals(maxOrbitalIndex: number = 18): void {
    const orbitals: Orbital[] = AUFBAU_ORDER.slice(0, maxOrbitalIndex).map(info => ({
      name: info.name,
      subshell: info.subshell,
      n: info.n,
      maxElectrons: info.maxElectrons,
      boxCount: info.boxCount,
      boxes: Array.from({ length: info.boxCount }, () => ({ electrons: [] })),
    }));
    this._config.next({ orbitals });
  }

  /** Load correct config from element's subshell configuration string */
  selectElement(symbol: string): void {
    const el = getElementBySymbol(symbol);
    if (!el) return;

    const parsed = parseSubshellConfig(el.subshellConfig);
    const orbitals: Orbital[] = [];

    for (const { name, electrons } of parsed) {
      const info = AUFBAU_ORDER.find(a => a.name === name);
      if (!info) continue;

      const boxes: OrbitalBox[] = Array.from({ length: info.boxCount }, () => ({ electrons: [] }));
      // Fill following Hund's rule: one up in each box first, then down
      let remaining = electrons;
      // First pass: one up per box
      for (let i = 0; i < boxes.length && remaining > 0; i++) {
        boxes[i].electrons.push({ spin: 'up' });
        remaining--;
      }
      // Second pass: one down per box
      for (let i = 0; i < boxes.length && remaining > 0; i++) {
        boxes[i].electrons.push({ spin: 'down' });
        remaining--;
      }

      orbitals.push({
        name: info.name,
        subshell: info.subshell,
        n: info.n,
        maxElectrons: info.maxElectrons,
        boxCount: info.boxCount,
        boxes,
      });
    }

    this._config.next({
      element: el.symbol,
      atomicNumber: el.atomicNumber,
      orbitals,
    });
  }

  /** Toggle an electron in a specific box (click cycle: empty → up → up+down → empty) */
  toggleBox(orbitalIndex: number, boxIndex: number): void {
    const c = structuredClone(this._config.value);
    const orbital = c.orbitals[orbitalIndex];
    if (!orbital) return;
    const box = orbital.boxes[boxIndex];
    if (!box) return;

    if (box.electrons.length === 0) {
      box.electrons = [{ spin: 'up' }];
    } else if (box.electrons.length === 1) {
      box.electrons = [{ spin: 'up' }, { spin: 'down' }];
    } else {
      box.electrons = [];
    }

    this._config.next(c);
  }
}
