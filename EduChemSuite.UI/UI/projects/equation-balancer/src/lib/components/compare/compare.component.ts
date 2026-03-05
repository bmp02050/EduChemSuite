import { Component, Input, OnChanges } from '@angular/core';
import { ChemicalEquation, Compound, formulaToHtml } from '../../models/chemical-equation.model';

@Component({
  selector: 'equation-compare',
  standalone: true,
  template: `
    <div class="equation-compare">
      <div class="compare-row">
        <span class="label">Your answer:</span>
        <div class="eq-display">
          @for (compound of studentEq.reactants; track $index; let i = $index) {
            @if (i > 0) { <span class="op">+</span> }
            <span class="compound" [class.wrong]="!isReactantCorrect(i)">
              <span class="coeff">{{ compound.coefficient }}</span>
              <span [innerHTML]="getFormulaHtml(compound.formula)"></span>
            </span>
          }
          <span class="arrow">→</span>
          @for (compound of studentEq.products; track $index; let i = $index) {
            @if (i > 0) { <span class="op">+</span> }
            <span class="compound" [class.wrong]="!isProductCorrect(i)">
              <span class="coeff">{{ compound.coefficient }}</span>
              <span [innerHTML]="getFormulaHtml(compound.formula)"></span>
            </span>
          }
        </div>
      </div>
      <div class="compare-row">
        <span class="label">Correct:</span>
        <div class="eq-display correct">
          @for (compound of correctEq.reactants; track $index; let i = $index) {
            @if (i > 0) { <span class="op">+</span> }
            <span class="compound">
              <span class="coeff">{{ compound.coefficient }}</span>
              <span [innerHTML]="getFormulaHtml(compound.formula)"></span>
            </span>
          }
          <span class="arrow">→</span>
          @for (compound of correctEq.products; track $index; let i = $index) {
            @if (i > 0) { <span class="op">+</span> }
            <span class="compound">
              <span class="coeff">{{ compound.coefficient }}</span>
              <span [innerHTML]="getFormulaHtml(compound.formula)"></span>
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .equation-compare {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 12px; background: var(--tool-bg);
    }
    .compare-row { margin-bottom: 8px; }
    .compare-row:last-child { margin-bottom: 0; }
    .label {
      display: block; font-size: 11px; font-weight: 600;
      color: var(--tool-text-muted); text-transform: uppercase; margin-bottom: 4px;
    }
    .eq-display {
      display: flex; align-items: center; gap: 6px;
      font-size: 16px; flex-wrap: wrap; color: var(--tool-text);
    }
    .correct { color: #52c41a; }
    .compound { display: inline-flex; gap: 3px; }
    .compound.wrong { color: #ff4d4f; text-decoration: line-through; }
    .coeff { font-weight: 700; }
    .op { color: var(--tool-text-muted); }
    .arrow { font-size: 20px; color: var(--tool-text); }
  `,
})
export class EquationCompareComponent implements OnChanges {
  @Input() studentGraph = '';
  @Input() correctGraph = '';

  studentEq: ChemicalEquation = { reactants: [], products: [] };
  correctEq: ChemicalEquation = { reactants: [], products: [] };
  private normalizedStudent: number[] = [];
  private normalizedCorrect: number[] = [];

  ngOnChanges(): void {
    this.studentEq = this.parse(this.studentGraph);
    this.correctEq = this.parse(this.correctGraph);
    this.normalizedStudent = this.normalize(this.getAllCoeffs(this.studentEq));
    this.normalizedCorrect = this.normalize(this.getAllCoeffs(this.correctEq));
  }

  isReactantCorrect(index: number): boolean {
    return this.normalizedStudent[index] === this.normalizedCorrect[index];
  }

  isProductCorrect(index: number): boolean {
    const offset = this.correctEq.reactants.length;
    return this.normalizedStudent[offset + index] === this.normalizedCorrect[offset + index];
  }

  getFormulaHtml(formula: string): string {
    return formulaToHtml(formula);
  }

  private parse(json: string): ChemicalEquation {
    try { return JSON.parse(json); }
    catch { return { reactants: [], products: [] }; }
  }

  private getAllCoeffs(eq: ChemicalEquation): number[] {
    return [...eq.reactants, ...eq.products].map(c => c.coefficient);
  }

  private normalize(coeffs: number[]): number[] {
    if (coeffs.length === 0) return [];
    const g = coeffs.reduce((a, b) => this.gcd(a, b));
    return g > 0 ? coeffs.map(c => c / g) : coeffs;
  }

  private gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }
}
