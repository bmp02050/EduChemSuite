import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChemicalEquation, Compound, parseEquationString } from './models/chemical-equation.model';

@Injectable()
export class EquationBalancerService {
  private readonly _equation = new BehaviorSubject<ChemicalEquation>({
    reactants: [],
    products: [],
  });
  readonly equation$ = this._equation.asObservable();

  get equation(): ChemicalEquation {
    return this._equation.value;
  }

  loadEquation(eq: ChemicalEquation): void {
    this._equation.next(structuredClone(eq));
  }

  loadFromString(input: string): boolean {
    const parsed = parseEquationString(input);
    if (!parsed) return false;
    this._equation.next(parsed);
    return true;
  }

  clear(): void {
    this._equation.next({ reactants: [], products: [] });
  }

  setCoefficient(side: 'reactants' | 'products', index: number, value: number): void {
    const eq = structuredClone(this._equation.value);
    const compounds = eq[side];
    if (index >= 0 && index < compounds.length) {
      compounds[index].coefficient = Math.max(1, Math.round(value));
      this._equation.next(eq);
    }
  }

  /** Strip coefficients for student display (all set to 1) */
  getStudentVersion(): ChemicalEquation {
    const eq = structuredClone(this._equation.value);
    [...eq.reactants, ...eq.products].forEach(c => c.coefficient = 1);
    return eq;
  }

  /** Get all coefficients as a flat array [r1, r2, ..., p1, p2, ...] */
  getCoefficients(): number[] {
    const eq = this._equation.value;
    return [...eq.reactants, ...eq.products].map(c => c.coefficient);
  }
}
