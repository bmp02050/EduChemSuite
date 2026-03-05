import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  PeriodicTableQuiz, PeriodicTableResponse, QuizMode,
  IdentifyConfig, TrendConfig, ClassifyConfig,
} from './models/periodic-table-quiz.model';

@Injectable()
export class PeriodicTableQuizService {
  private readonly _quiz = new BehaviorSubject<PeriodicTableQuiz | null>(null);
  private readonly _response = new BehaviorSubject<PeriodicTableResponse>({ mode: 'identify' });
  readonly quiz$ = this._quiz.asObservable();
  readonly response$ = this._response.asObservable();

  get quiz(): PeriodicTableQuiz | null { return this._quiz.value; }
  get response(): PeriodicTableResponse { return this._response.value; }

  loadQuiz(q: PeriodicTableQuiz): void {
    this._quiz.next(structuredClone(q));
    this._response.next({ mode: q.mode });
  }

  loadResponse(r: PeriodicTableResponse): void {
    this._response.next(structuredClone(r));
  }

  clear(): void {
    this._quiz.next(null);
    this._response.next({ mode: 'identify' });
  }

  // Identify mode
  toggleElement(symbol: string): void {
    const r = structuredClone(this._response.value);
    if (!r.selectedElements) r.selectedElements = [];
    const idx = r.selectedElements.indexOf(symbol);
    if (idx >= 0) r.selectedElements.splice(idx, 1);
    else r.selectedElements.push(symbol);
    this._response.next(r);
  }

  // Trend mode
  setOrder(symbols: string[]): void {
    const r = structuredClone(this._response.value);
    r.orderedElements = symbols;
    this._response.next(r);
  }

  addToOrder(symbol: string): void {
    const r = structuredClone(this._response.value);
    if (!r.orderedElements) r.orderedElements = [];
    if (!r.orderedElements.includes(symbol)) {
      r.orderedElements.push(symbol);
      this._response.next(r);
    }
  }

  removeFromOrder(symbol: string): void {
    const r = structuredClone(this._response.value);
    if (r.orderedElements) {
      r.orderedElements = r.orderedElements.filter(s => s !== symbol);
      this._response.next(r);
    }
  }

  // Classify mode
  classify(symbol: string, classification: 'metal' | 'nonmetal' | 'metalloid'): void {
    const r = structuredClone(this._response.value);
    if (!r.classifications) r.classifications = {};
    r.classifications[symbol] = classification;
    this._response.next(r);
  }
}
