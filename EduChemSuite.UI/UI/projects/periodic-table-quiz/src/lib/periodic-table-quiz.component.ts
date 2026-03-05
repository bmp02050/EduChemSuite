import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  PeriodicTableQuiz, PeriodicTableResponse, QuizMode,
  IdentifyConfig, TrendConfig, ClassifyConfig,
} from './models/periodic-table-quiz.model';
import { PeriodicTableQuizService } from './periodic-table-quiz.service';
import {
  ELEMENTS, ElementData, getElementByNumber,
  PERIODIC_TABLE_LAYOUT, TableCell,
} from 'chemistry-data';

interface CellDisplay {
  element: ElementData;
  row: number;
  col: number;
  isTarget: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'periodic-table-quiz',
  standalone: true,
  imports: [FormsModule],
  providers: [PeriodicTableQuizService],
  template: `
    <div class="ptq" [style.max-width.px]="width">
      @if (showConfig && !readOnly) {
        <div class="config">
          <div class="field">
            <label>Quiz mode:</label>
            <select [value]="configMode" (change)="onModeChange($event)">
              <option value="identify">Identify Element</option>
              <option value="trend">Trend Ordering</option>
              <option value="classify">Classification</option>
            </select>
          </div>
          @if (configMode === 'identify') {
            <div class="field">
              <label>Clue text:</label>
              <input type="text" [(ngModel)]="identifyClue" placeholder="Which element has 26 protons?" />
            </div>
            <p class="hint">Click element(s) on the table to set as correct answer.</p>
          }
          @if (configMode === 'trend') {
            <div class="field">
              <label>Property:</label>
              <select [(ngModel)]="trendProperty">
                <option value="electronegativity">Electronegativity</option>
                <option value="atomicRadius">Atomic Radius</option>
                <option value="ionizationEnergy">Ionization Energy</option>
              </select>
            </div>
            <p class="hint">Click elements to add them. Order = correct answer (low → high).</p>
          }
          @if (configMode === 'classify') {
            <p class="hint">Click elements to add them. Classifications auto-filled from data.</p>
          }
        </div>
      }

      @if (quiz && !showConfig) {
        @if (quiz.mode === 'identify') {
          <div class="clue">{{ identifyConfigFromQuiz?.clue }}</div>
        }
        @if (quiz.mode === 'trend') {
          <div class="clue">Order these elements by {{ trendConfigFromQuiz?.property }} (low → high):</div>
          <div class="order-track">
            @for (sym of response.orderedElements ?? []; track sym) {
              <span class="order-chip" (click)="removeFromOrder(sym)">{{ sym }} ×</span>
            }
          </div>
        }
        @if (quiz.mode === 'classify') {
          <div class="clue">Classify each highlighted element:</div>
        }
      }

      <div class="periodic-table">
        @for (cell of cells; track cell.element.atomicNumber) {
          <div class="cell"
            [style.grid-row]="cell.row"
            [style.grid-column]="cell.col"
            [class.target]="cell.isTarget"
            [class.selected]="cell.isSelected"
            [style.background]="getCellColor(cell)"
            [title]="cell.element.name"
            (click)="onCellClick(cell)">
            <span class="z">{{ cell.element.atomicNumber }}</span>
            <span class="sym">{{ cell.element.symbol }}</span>
          </div>
        }
      </div>

      @if (!showConfig && quiz?.mode === 'classify') {
        <div class="classify-section">
          @for (sym of classifyTargets; track sym) {
            <div class="classify-row">
              <span class="classify-el">{{ sym }}</span>
              <select [value]="getClassification(sym)" (change)="onClassify(sym, $event)">
                <option value="">--</option>
                <option value="metal">Metal</option>
                <option value="nonmetal">Nonmetal</option>
                <option value="metalloid">Metalloid</option>
              </select>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .ptq {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 12px; background: var(--tool-bg);
    }
    .config { margin-bottom: 12px; }
    .field { margin-bottom: 8px; }
    .field label {
      font-size: 12px; font-weight: 600; color: var(--tool-text-secondary); margin-right: 6px;
    }
    .field input, .field select {
      padding: 4px 8px; border: 1px solid var(--tool-input-border); border-radius: 6px;
      font-size: 13px; background: var(--tool-bg); color: var(--tool-text);
    }
    .field input { width: 100%; box-sizing: border-box; }
    .hint { font-size: 12px; color: var(--tool-text-muted); margin: 4px 0; }
    .clue {
      font-size: 14px; font-weight: 500; margin-bottom: 8px;
      padding: 8px; background: var(--tool-bg-secondary); border-radius: 6px;
      color: var(--tool-text);
    }
    .order-track {
      display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;
    }
    .order-chip {
      padding: 2px 8px; background: #1890ff; color: #fff;
      border-radius: 12px; font-size: 12px; cursor: pointer;
    }
    .periodic-table {
      display: grid;
      grid-template-columns: repeat(18, 1fr);
      gap: 1px; font-size: 10px;
    }
    .cell {
      padding: 2px; text-align: center; border: 1px solid var(--tool-border-light);
      border-radius: 2px; cursor: default; min-height: 36px;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center;
    }
    .cell.target { border: 2px solid #1890ff; cursor: pointer; }
    .cell.selected { background: #bae7ff !important; border-color: #096dd9; }
    .z { font-size: 10px; color: var(--tool-text-muted); }
    .sym { font-size: 13px; font-weight: 700; color: var(--tool-text); }
    .classify-section { margin-top: 8px; }
    .classify-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
    }
    .classify-el { font-weight: 600; width: 30px; color: var(--tool-text); }
    .classify-row select {
      padding: 2px 6px; border: 1px solid var(--tool-input-border); border-radius: 4px;
      background: var(--tool-bg); color: var(--tool-text);
    }
  `,
})
export class PeriodicTableQuizComponent implements OnChanges, OnDestroy {
  @Input() graph: PeriodicTableQuiz | null = null;
  @Input() responseGraph: PeriodicTableResponse | null = null;
  @Input() readOnly = false;
  @Input() showConfig = false;
  @Input() width = 700;
  @Output() graphChange = new EventEmitter<PeriodicTableQuiz>();
  @Output() responseChange = new EventEmitter<PeriodicTableResponse>();

  quiz: PeriodicTableQuiz | null = null;
  response: PeriodicTableResponse = { mode: 'identify' };
  cells: CellDisplay[] = [];

  // Config mode fields
  configMode: QuizMode = 'identify';
  identifyClue = '';
  trendProperty: 'electronegativity' | 'atomicRadius' | 'ionizationEnergy' = 'electronegativity';
  configSelectedElements: string[] = [];

  private subs: Subscription[] = [];

  get identifyConfigFromQuiz(): IdentifyConfig | null {
    return this.quiz?.mode === 'identify' ? this.quiz.config as IdentifyConfig : null;
  }

  get trendConfigFromQuiz(): TrendConfig | null {
    return this.quiz?.mode === 'trend' ? this.quiz.config as TrendConfig : null;
  }

  get classifyTargets(): string[] {
    if (this.quiz?.mode !== 'classify') return [];
    return (this.quiz.config as ClassifyConfig).elements;
  }

  constructor(private service: PeriodicTableQuizService) {
    this.subs.push(
      this.service.quiz$.subscribe(q => { this.quiz = q; this.buildCells(); }),
      this.service.response$.subscribe(r => {
        this.response = r;
        this.responseChange.emit(structuredClone(r));
        this.buildCells();
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph'] && this.graph) {
      this.service.loadQuiz(this.graph);
    }
    if (changes['responseGraph'] && this.responseGraph) {
      this.service.loadResponse(this.responseGraph);
    }
    this.buildCells();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  buildCells(): void {
    const targetElements = this.getTargetElements();
    const selectedElements = this.getSelectedElements();

    this.cells = PERIODIC_TABLE_LAYOUT.map(tc => {
      const el = getElementByNumber(tc.atomicNumber);
      if (!el) return null;
      return {
        element: el,
        row: tc.row,
        col: tc.col,
        isTarget: targetElements.has(el.symbol),
        isSelected: selectedElements.has(el.symbol),
      };
    }).filter((c): c is CellDisplay => c !== null);
  }

  getCellColor(cell: CellDisplay): string {
    if (cell.isSelected) return '#bae7ff';
    if (cell.isTarget) return '#e6f7ff';
    const colors: Record<string, string> = {
      'nonmetal': '#a8e6cf', 'noble-gas': '#dcd3ff', 'alkali-metal': '#ffb3ba',
      'alkaline-earth': '#ffd9a0', 'metalloid': '#ffe0ac', 'halogen': '#bae1ff',
      'transition-metal': '#ffc3a0', 'post-transition-metal': '#d5f4e6',
      'lanthanide': '#f0d9ff', 'actinide': '#ffd6e7',
    };
    return colors[cell.element.category] || '#f9f9f9';
  }

  onCellClick(cell: CellDisplay): void {
    if (this.readOnly) return;

    if (this.showConfig) {
      // Config mode: toggle element selection for building the quiz
      const idx = this.configSelectedElements.indexOf(cell.element.symbol);
      if (idx >= 0) this.configSelectedElements.splice(idx, 1);
      else this.configSelectedElements.push(cell.element.symbol);
      this.emitConfig();
      this.buildCells();
      return;
    }

    if (!this.quiz) return;

    if (this.quiz.mode === 'identify') {
      this.service.toggleElement(cell.element.symbol);
    } else if (this.quiz.mode === 'trend') {
      if ((this.quiz.config as TrendConfig).elements.includes(cell.element.symbol)) {
        this.service.addToOrder(cell.element.symbol);
      }
    }
  }

  onModeChange(e: Event): void {
    this.configMode = (e.target as HTMLSelectElement).value as QuizMode;
    this.configSelectedElements = [];
    this.emitConfig();
  }

  onClassify(symbol: string, e: Event): void {
    const val = (e.target as HTMLSelectElement).value as 'metal' | 'nonmetal' | 'metalloid';
    if (val) this.service.classify(symbol, val);
  }

  getClassification(symbol: string): string {
    return this.response.classifications?.[symbol] || '';
  }

  removeFromOrder(symbol: string): void {
    this.service.removeFromOrder(symbol);
  }

  private emitConfig(): void {
    let config: IdentifyConfig | TrendConfig | ClassifyConfig;
    if (this.configMode === 'identify') {
      config = { clue: this.identifyClue, correctElements: [...this.configSelectedElements] };
    } else if (this.configMode === 'trend') {
      config = {
        property: this.trendProperty,
        elements: [...this.configSelectedElements],
        correctOrder: [...this.configSelectedElements],
      };
    } else {
      const classifications: Record<string, 'metal' | 'nonmetal' | 'metalloid'> = {};
      for (const sym of this.configSelectedElements) {
        const el = ELEMENTS.find(e => e.symbol === sym);
        if (el) classifications[sym] = el.metalClass;
      }
      config = { elements: [...this.configSelectedElements], correctClassifications: classifications };
    }
    const quiz: PeriodicTableQuiz = { mode: this.configMode, config };
    this.graphChange.emit(quiz);
  }

  private getTargetElements(): Set<string> {
    if (this.showConfig) return new Set(this.configSelectedElements);
    if (!this.quiz) return new Set();
    if (this.quiz.mode === 'identify') return new Set(); // All clickable in identify
    if (this.quiz.mode === 'trend') return new Set((this.quiz.config as TrendConfig).elements);
    if (this.quiz.mode === 'classify') return new Set((this.quiz.config as ClassifyConfig).elements);
    return new Set();
  }

  private getSelectedElements(): Set<string> {
    if (this.showConfig) return new Set(this.configSelectedElements);
    if (this.response.selectedElements) return new Set(this.response.selectedElements);
    if (this.response.orderedElements) return new Set(this.response.orderedElements);
    return new Set();
  }
}
