import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoichiometryProblem } from './models/stoichiometry.model';
import { StoichiometryStepperService } from './stoichiometry-stepper.service';

@Component({
  selector: 'stoichiometry-stepper',
  standalone: true,
  imports: [FormsModule],
  providers: [StoichiometryStepperService],
  template: `
    <div class="stoich-stepper" [style.max-width.px]="width">
      @if (showConfig && !readOnly) {
        <div class="config-section">
          <div class="field">
            <label>Problem text:</label>
            <textarea rows="2"
              [value]="problem.problemText"
              (input)="onProblemTextChange($event)"></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Given value:</label>
              <input type="number" [value]="problem.givenValue"
                (input)="onGivenValueChange($event)" />
            </div>
            <div class="field">
              <label>Given unit:</label>
              <input type="text" [value]="problem.givenUnit"
                (input)="onGivenUnitChange($event)" placeholder="e.g. g Fe" />
            </div>
          </div>
        </div>
      }

      @if (problem.problemText) {
        <div class="problem-text">{{ problem.problemText }}</div>
      }

      <div class="chain">
        <div class="given">
          <span class="given-value">{{ problem.givenValue }}</span>
          <span class="given-unit">{{ problem.givenUnit }}</span>
        </div>

        @for (step of problem.steps; track $index; let i = $index) {
          <span class="multiply">×</span>
          <div class="fraction">
            @if (!readOnly) {
              <input class="frac-input num" [value]="step.numerator"
                (input)="onStepChange(i, 'numerator', $event)"
                placeholder="numerator" />
              <div class="frac-line"></div>
              <input class="frac-input den" [value]="step.denominator"
                (input)="onStepChange(i, 'denominator', $event)"
                placeholder="denominator" />
              @if (!showConfig) {
                <button class="remove-step" (click)="removeStep(i)" title="Remove step">×</button>
              }
            } @else {
              <span class="frac-text num">{{ step.numerator }}</span>
              <div class="frac-line"></div>
              <span class="frac-text den">{{ step.denominator }}</span>
            }
          </div>
        }

        @if (!readOnly && !showConfig) {
          <button class="add-step" (click)="addStep()">+ Step</button>
        }
        @if (showConfig && !readOnly) {
          <button class="add-step" (click)="addStep()">+ Step</button>
        }

        <span class="equals">=</span>
        <div class="answer">
          @if (!readOnly && !showConfig) {
            <input type="number" class="answer-value" step="any"
              [value]="problem.finalAnswer.value"
              (input)="onFinalValueChange($event)" />
            <input type="text" class="answer-unit"
              [value]="problem.finalAnswer.unit"
              (input)="onFinalUnitChange($event)" placeholder="unit" />
          } @else {
            <span class="answer-display">
              {{ problem.finalAnswer.value }} {{ problem.finalAnswer.unit }}
            </span>
          }
        </div>
      </div>

      @if (showConfig && !readOnly) {
        <div class="tolerance-field">
          <label>Tolerance (±):</label>
          <input type="number" step="any" [value]="problem.finalAnswer.tolerance"
            (input)="onToleranceChange($event)" />
        </div>
      }
    </div>
  `,
  styles: `
    .stoich-stepper {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 16px; background: var(--tool-bg);
    }
    .config-section { margin-bottom: 12px; }
    .field { margin-bottom: 8px; }
    .field label {
      display: block; font-size: 12px; font-weight: 600; color: var(--tool-text-secondary); margin-bottom: 2px;
    }
    .field textarea, .field input {
      width: 100%; padding: 6px 10px; border: 1px solid var(--tool-input-border);
      border-radius: 6px; font-size: 14px; box-sizing: border-box;
      background: var(--tool-bg); color: var(--tool-text);
    }
    .field-row { display: flex; gap: 12px; }
    .field-row .field { flex: 1; }
    .problem-text {
      font-size: 14px; color: var(--tool-text); margin-bottom: 12px;
      padding: 8px; background: var(--tool-bg-secondary); border-radius: 6px;
    }
    .chain {
      display: flex; align-items: center; gap: 8px;
      flex-wrap: wrap; padding: 8px 0; color: var(--tool-text);
    }
    .given {
      display: flex; flex-direction: column; align-items: center;
      font-weight: 600; font-size: 16px;
    }
    .given-value { font-size: 18px; }
    .given-unit { font-size: 12px; color: var(--tool-text-secondary); }
    .multiply, .equals { font-size: 20px; color: var(--tool-text-secondary); }
    .fraction {
      display: inline-flex; flex-direction: column; align-items: center;
      position: relative; min-width: 80px;
    }
    .frac-line {
      width: 100%; height: 2px; background: var(--tool-text); margin: 2px 0;
    }
    .frac-input {
      width: 120px; padding: 4px 8px; border: 1px solid var(--tool-input-border);
      border-radius: 4px; font-size: 13px; text-align: center;
      background: var(--tool-bg); color: var(--tool-text);
    }
    .frac-input:focus { border-color: #1890ff; outline: none; }
    .frac-text { font-size: 14px; padding: 2px 4px; }
    .num { margin-bottom: 1px; }
    .den { margin-top: 1px; }
    .remove-step {
      position: absolute; right: -8px; top: -8px;
      width: 18px; height: 18px; border-radius: 50%;
      border: 1px solid #ff4d4f; background: var(--tool-bg); color: #ff4d4f;
      cursor: pointer; font-size: 12px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .add-step {
      padding: 4px 12px; border: 1px dashed #1890ff; border-radius: 6px;
      background: transparent; color: #1890ff; cursor: pointer;
      font-size: 13px;
    }
    .add-step:hover { background: var(--tool-bg-hover); }
    .answer { display: flex; gap: 6px; align-items: center; }
    .answer-value {
      width: 80px; padding: 4px 8px; border: 1px solid var(--tool-input-border);
      border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center;
      background: var(--tool-bg); color: var(--tool-text);
    }
    .answer-unit {
      width: 80px; padding: 4px 8px; border: 1px solid var(--tool-input-border);
      border-radius: 6px; font-size: 14px; background: var(--tool-bg); color: var(--tool-text);
    }
    .answer-display { font-size: 16px; font-weight: 600; }
    .tolerance-field {
      margin-top: 8px; display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: var(--tool-text-secondary);
    }
    .tolerance-field input {
      width: 80px; padding: 4px 8px; border: 1px solid var(--tool-input-border);
      border-radius: 6px; font-size: 13px; background: var(--tool-bg); color: var(--tool-text);
    }
  `,
})
export class StoichiometryStepperComponent implements OnChanges, OnDestroy {
  @Input() graph: StoichiometryProblem | null = null;
  @Input() readOnly = false;
  @Input() showConfig = false;
  @Input() width = 700;
  @Output() graphChange = new EventEmitter<StoichiometryProblem>();

  problem: StoichiometryProblem = {
    problemText: '', givenValue: 0, givenUnit: '',
    steps: [], finalAnswer: { value: 0, unit: '', tolerance: 0.01 },
  };
  private sub: Subscription;

  constructor(private service: StoichiometryStepperService) {
    this.sub = this.service.problem$.subscribe(p => {
      this.problem = p;
      this.graphChange.emit(structuredClone(p));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph'] && this.graph) {
      this.service.loadProblem(this.graph);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onProblemTextChange(e: Event): void {
    this.service.setProblemText((e.target as HTMLTextAreaElement).value);
  }

  onGivenValueChange(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(v)) this.service.setGiven(v, this.problem.givenUnit);
  }

  onGivenUnitChange(e: Event): void {
    this.service.setGiven(this.problem.givenValue, (e.target as HTMLInputElement).value);
  }

  onStepChange(index: number, field: 'numerator' | 'denominator', e: Event): void {
    this.service.updateStep(index, field, (e.target as HTMLInputElement).value);
  }

  addStep(): void {
    this.service.addStep();
  }

  removeStep(index: number): void {
    this.service.removeStep(index);
  }

  onFinalValueChange(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(v)) this.service.setFinalAnswer(v, this.problem.finalAnswer.unit);
  }

  onFinalUnitChange(e: Event): void {
    this.service.setFinalAnswer(this.problem.finalAnswer.value, (e.target as HTMLInputElement).value);
  }

  onToleranceChange(e: Event): void {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(v)) this.service.setFinalAnswer(
      this.problem.finalAnswer.value, this.problem.finalAnswer.unit, v);
  }
}
