import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoichiometryProblem, ConversionStep } from './models/stoichiometry.model';

const EMPTY: StoichiometryProblem = {
  problemText: '',
  givenValue: 0,
  givenUnit: '',
  steps: [],
  finalAnswer: { value: 0, unit: '', tolerance: 0.01 },
};

@Injectable()
export class StoichiometryStepperService {
  private readonly _problem = new BehaviorSubject<StoichiometryProblem>(structuredClone(EMPTY));
  readonly problem$ = this._problem.asObservable();

  get problem(): StoichiometryProblem {
    return this._problem.value;
  }

  loadProblem(p: StoichiometryProblem): void {
    this._problem.next(structuredClone(p));
  }

  clear(): void {
    this._problem.next(structuredClone(EMPTY));
  }

  setProblemText(text: string): void {
    const p = structuredClone(this._problem.value);
    p.problemText = text;
    this._problem.next(p);
  }

  setGiven(value: number, unit: string): void {
    const p = structuredClone(this._problem.value);
    p.givenValue = value;
    p.givenUnit = unit;
    this._problem.next(p);
  }

  addStep(): void {
    const p = structuredClone(this._problem.value);
    p.steps.push({ numerator: '', denominator: '' });
    this._problem.next(p);
  }

  removeStep(index: number): void {
    const p = structuredClone(this._problem.value);
    if (index >= 0 && index < p.steps.length) {
      p.steps.splice(index, 1);
      this._problem.next(p);
    }
  }

  updateStep(index: number, field: 'numerator' | 'denominator', value: string): void {
    const p = structuredClone(this._problem.value);
    if (index >= 0 && index < p.steps.length) {
      p.steps[index][field] = value;
      this._problem.next(p);
    }
  }

  setFinalAnswer(value: number, unit: string, tolerance?: number): void {
    const p = structuredClone(this._problem.value);
    p.finalAnswer = { value, unit, tolerance: tolerance ?? p.finalAnswer.tolerance };
    this._problem.next(p);
  }
}
