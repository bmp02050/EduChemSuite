import { Component, Input, OnChanges } from '@angular/core';
import {
  PeriodicTableQuiz, PeriodicTableResponse,
  IdentifyConfig, TrendConfig, ClassifyConfig,
} from '../../models/periodic-table-quiz.model';

@Component({
  selector: 'periodic-table-compare',
  standalone: true,
  template: `
    <div class="ptq-compare">
      @if (quiz?.mode === 'identify') {
        <div class="compare-row">
          <span class="label">Your selection:</span>
          <span [class.wrong]="!isCorrect" [class.correct]="isCorrect">
            {{ studentResponse.selectedElements?.join(', ') || 'None' }}
          </span>
        </div>
        <div class="compare-row">
          <span class="label">Correct:</span>
          <span class="correct">{{ identifyConfig?.correctElements?.join(', ') }}</span>
        </div>
      }
      @if (quiz?.mode === 'trend') {
        <div class="compare-row">
          <span class="label">Your order:</span>
          <span [class.wrong]="!isCorrect" [class.correct]="isCorrect">
            {{ studentResponse.orderedElements?.join(' → ') || 'None' }}
          </span>
        </div>
        <div class="compare-row">
          <span class="label">Correct order:</span>
          <span class="correct">{{ trendConfig?.correctOrder?.join(' → ') }}</span>
        </div>
      }
      @if (quiz?.mode === 'classify') {
        <div class="compare-row">
          <span class="label">Your classifications:</span>
          @for (el of classifyElements; track el) {
            <span class="classify-item"
              [class.wrong]="!isClassifyCorrect(el)"
              [class.correct]="isClassifyCorrect(el)">
              {{ el }}: {{ studentResponse.classifications?.[el] || '?' }}
            </span>
          }
        </div>
        <div class="compare-row">
          <span class="label">Correct:</span>
          @for (el of classifyElements; track el) {
            <span class="classify-item correct">
              {{ el }}: {{ classifyConfig?.correctClassifications?.[el] }}
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .ptq-compare {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 12px; background: var(--tool-bg);
    }
    .compare-row { margin-bottom: 6px; color: var(--tool-text); }
    .label {
      display: block; font-size: 11px; font-weight: 600;
      color: var(--tool-text-muted); text-transform: uppercase; margin-bottom: 2px;
    }
    .wrong { color: #ff4d4f; }
    .correct { color: #52c41a; }
    .classify-item {
      display: inline-block; margin-right: 8px;
      font-size: 13px; font-weight: 500;
    }
  `,
})
export class PeriodicTableCompareComponent implements OnChanges {
  @Input() studentGraph = '';
  @Input() correctGraph = '';
  @Input() quizGraph = '';

  quiz: PeriodicTableQuiz | null = null;
  studentResponse: PeriodicTableResponse = { mode: 'identify' };
  isCorrect = false;

  get identifyConfig(): IdentifyConfig | null {
    return this.quiz?.mode === 'identify' ? this.quiz.config as IdentifyConfig : null;
  }
  get trendConfig(): TrendConfig | null {
    return this.quiz?.mode === 'trend' ? this.quiz.config as TrendConfig : null;
  }
  get classifyConfig(): ClassifyConfig | null {
    return this.quiz?.mode === 'classify' ? this.quiz.config as ClassifyConfig : null;
  }
  get classifyElements(): string[] {
    return this.classifyConfig?.elements ?? [];
  }

  ngOnChanges(): void {
    this.quiz = this.parse(this.quizGraph);
    this.studentResponse = this.parse(this.studentGraph) ?? { mode: 'identify' };
    this.checkCorrectness();
  }

  isClassifyCorrect(element: string): boolean {
    return this.studentResponse.classifications?.[element] ===
           this.classifyConfig?.correctClassifications?.[element];
  }

  private checkCorrectness(): void {
    if (!this.quiz) { this.isCorrect = false; return; }
    if (this.quiz.mode === 'identify') {
      const correct = new Set(this.identifyConfig?.correctElements ?? []);
      const student = new Set(this.studentResponse.selectedElements ?? []);
      this.isCorrect = correct.size === student.size && [...correct].every(e => student.has(e));
    } else if (this.quiz.mode === 'trend') {
      const correct = this.trendConfig?.correctOrder ?? [];
      const student = this.studentResponse.orderedElements ?? [];
      this.isCorrect = JSON.stringify(correct) === JSON.stringify(student);
    } else if (this.quiz.mode === 'classify') {
      this.isCorrect = this.classifyElements.every(e => this.isClassifyCorrect(e));
    }
  }

  private parse<T>(json: string): T | null {
    try { return JSON.parse(json); }
    catch { return null; }
  }
}
