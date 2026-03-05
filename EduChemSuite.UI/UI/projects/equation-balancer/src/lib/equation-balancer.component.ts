import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChemicalEquation, formulaToHtml } from './models/chemical-equation.model';
import { EquationBalancerService } from './equation-balancer.service';

@Component({
  selector: 'equation-balancer',
  standalone: true,
  imports: [FormsModule],
  providers: [EquationBalancerService],
  template: `
    <div class="equation-balancer" [style.max-width.px]="width">
      @if (!readOnly && showInput) {
        <div class="equation-input">
          <label>Enter balanced equation:</label>
          <input type="text"
            [value]="inputText"
            (input)="onInputChange($event)"
            placeholder="e.g. 2Fe + 3Cl2 -> 2FeCl3" />
          @if (parseError) {
            <span class="error">{{ parseError }}</span>
          }
        </div>
      }
      @if (equation.reactants.length > 0) {
        <div class="equation-display">
          @for (compound of equation.reactants; track $index; let i = $index) {
            @if (i > 0) {
              <span class="operator">+</span>
            }
            <div class="compound">
              @if (!readOnly && !showInput) {
                <input type="number" class="coeff-input"
                  [value]="compound.coefficient"
                  (input)="onCoefficientChange('reactants', i, $event)"
                  min="1" max="99" />
              } @else {
                <span class="coeff">{{ compound.coefficient }}</span>
              }
              <span class="formula" [innerHTML]="getFormulaHtml(compound.formula)"></span>
            </div>
          }
          <span class="arrow">→</span>
          @for (compound of equation.products; track $index; let i = $index) {
            @if (i > 0) {
              <span class="operator">+</span>
            }
            <div class="compound">
              @if (!readOnly && !showInput) {
                <input type="number" class="coeff-input"
                  [value]="compound.coefficient"
                  (input)="onCoefficientChange('products', i, $event)"
                  min="1" max="99" />
              } @else {
                <span class="coeff">{{ compound.coefficient }}</span>
              }
              <span class="formula" [innerHTML]="getFormulaHtml(compound.formula)"></span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .equation-balancer {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 16px; background: var(--tool-bg);
    }
    .equation-input { margin-bottom: 12px; }
    .equation-input label {
      display: block; font-size: 12px; font-weight: 600;
      color: var(--tool-text-secondary); margin-bottom: 4px;
    }
    .equation-input input {
      width: 100%; padding: 6px 10px; border: 1px solid var(--tool-input-border);
      border-radius: 6px; font-size: 14px; background: var(--tool-bg); color: var(--tool-text);
    }
    .error { color: #ff4d4f; font-size: 12px; margin-top: 4px; display: block; }
    .equation-display {
      display: flex; align-items: center; gap: 8px;
      flex-wrap: wrap; font-size: 18px; padding: 8px 0; color: var(--tool-text);
    }
    .compound {
      display: flex; align-items: center; gap: 4px;
    }
    .coeff { font-weight: 700; min-width: 16px; text-align: center; }
    .coeff-input {
      width: 48px; padding: 4px 6px; border: 1px solid var(--tool-input-border);
      border-radius: 6px; font-size: 16px; font-weight: 700;
      text-align: center; background: var(--tool-bg); color: var(--tool-text);
    }
    .coeff-input:focus { border-color: #1890ff; outline: none; }
    .formula { font-size: 18px; }
    .operator { color: var(--tool-text-secondary); font-weight: 500; margin: 0 2px; }
    .arrow { font-size: 22px; color: var(--tool-text); margin: 0 4px; }
  `,
})
export class EquationBalancerComponent implements OnChanges, OnDestroy {
  @Input() graph: ChemicalEquation | null = null;
  @Input() readOnly = false;
  @Input() width = 600;
  @Input() showInput = true;
  @Output() graphChange = new EventEmitter<ChemicalEquation>();

  equation: ChemicalEquation = { reactants: [], products: [] };
  inputText = '';
  parseError = '';
  private sub: Subscription;

  constructor(private service: EquationBalancerService) {
    this.sub = this.service.equation$.subscribe(eq => {
      this.equation = eq;
      this.graphChange.emit(structuredClone(eq));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph'] && this.graph) {
      this.service.loadEquation(this.graph);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onInputChange(event: Event): void {
    this.inputText = (event.target as HTMLInputElement).value;
    this.parseError = '';
    if (!this.inputText.trim()) {
      this.service.clear();
      return;
    }
    const ok = this.service.loadFromString(this.inputText);
    if (!ok) {
      this.parseError = 'Invalid format. Use: 2Fe + 3Cl2 -> 2FeCl3';
    }
  }

  onCoefficientChange(side: 'reactants' | 'products', index: number, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= 1) {
      this.service.setCoefficient(side, index, val);
    }
  }

  getFormulaHtml(formula: string): string {
    return formulaToHtml(formula);
  }
}
