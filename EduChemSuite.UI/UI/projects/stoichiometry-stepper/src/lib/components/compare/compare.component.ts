import { Component, Input, OnChanges } from '@angular/core';
import { StoichiometryProblem } from '../../models/stoichiometry.model';

@Component({
  selector: 'stoichiometry-compare',
  standalone: true,
  template: `
    <div class="stoich-compare">
      <div class="compare-row">
        <span class="label">Your answer:</span>
        <div class="chain">
          <span class="given">{{ studentProblem.givenValue }} {{ studentProblem.givenUnit }}</span>
          @for (step of studentProblem.steps; track $index; let i = $index) {
            <span class="op">×</span>
            <div class="fraction" [class.wrong]="!isStepCorrect(i)">
              <span class="num">{{ step.numerator }}</span>
              <div class="line"></div>
              <span class="den">{{ step.denominator }}</span>
            </div>
          }
          <span class="op">=</span>
          <span class="final" [class.wrong]="!isFinalCorrect" [class.correct]="isFinalCorrect">
            {{ studentProblem.finalAnswer.value }} {{ studentProblem.finalAnswer.unit }}
          </span>
        </div>
      </div>
      <div class="compare-row">
        <span class="label">Correct:</span>
        <div class="chain correct">
          <span class="given">{{ correctProblem.givenValue }} {{ correctProblem.givenUnit }}</span>
          @for (step of correctProblem.steps; track $index) {
            <span class="op">×</span>
            <div class="fraction">
              <span class="num">{{ step.numerator }}</span>
              <div class="line"></div>
              <span class="den">{{ step.denominator }}</span>
            </div>
          }
          <span class="op">=</span>
          <span class="final">
            {{ correctProblem.finalAnswer.value }} {{ correctProblem.finalAnswer.unit }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .stoich-compare {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 12px; background: var(--tool-bg);
    }
    .compare-row { margin-bottom: 8px; color: var(--tool-text); }
    .compare-row:last-child { margin-bottom: 0; }
    .label {
      display: block; font-size: 11px; font-weight: 600;
      color: var(--tool-text-muted); text-transform: uppercase; margin-bottom: 4px;
    }
    .chain {
      display: flex; align-items: center; gap: 6px;
      font-size: 14px; flex-wrap: wrap;
    }
    .chain.correct { color: #52c41a; }
    .given { font-weight: 600; }
    .op { color: var(--tool-text-muted); }
    .fraction {
      display: inline-flex; flex-direction: column; align-items: center;
    }
    .fraction.wrong { color: #ff4d4f; }
    .line { width: 100%; height: 1px; background: currentColor; margin: 1px 0; }
    .num, .den { font-size: 12px; padding: 0 4px; }
    .final { font-weight: 700; }
    .final.wrong { color: #ff4d4f; }
    .final.correct { color: #52c41a; }
  `,
})
export class StoichiometryCompareComponent implements OnChanges {
  @Input() studentGraph = '';
  @Input() correctGraph = '';

  studentProblem: StoichiometryProblem = this.empty();
  correctProblem: StoichiometryProblem = this.empty();
  isFinalCorrect = false;

  ngOnChanges(): void {
    this.studentProblem = this.parse(this.studentGraph);
    this.correctProblem = this.parse(this.correctGraph);
    const tol = this.correctProblem.finalAnswer.tolerance || 0.01;
    this.isFinalCorrect =
      Math.abs(this.studentProblem.finalAnswer.value - this.correctProblem.finalAnswer.value) <= tol;
  }

  isStepCorrect(index: number): boolean {
    const s = this.studentProblem.steps[index];
    const c = this.correctProblem.steps[index];
    if (!s || !c) return false;
    return this.norm(s.numerator) === this.norm(c.numerator) &&
           this.norm(s.denominator) === this.norm(c.denominator);
  }

  private norm(s: string): string {
    return s.replace(/\s+/g, '').toLowerCase();
  }

  private parse(json: string): StoichiometryProblem {
    try { return JSON.parse(json); }
    catch { return this.empty(); }
  }

  private empty(): StoichiometryProblem {
    return {
      problemText: '', givenValue: 0, givenUnit: '',
      steps: [], finalAnswer: { value: 0, unit: '', tolerance: 0.01 },
    };
  }
}
