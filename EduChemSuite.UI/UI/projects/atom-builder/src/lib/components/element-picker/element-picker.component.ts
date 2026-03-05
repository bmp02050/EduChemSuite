import { Component, Output, EventEmitter } from '@angular/core';
import { ELEMENTS_36, ElementData } from '../../models/element-data.model';

const CATEGORY_COLORS: Record<string, string> = {
  'nonmetal': '#a8e6cf',
  'noble-gas': '#dcd3ff',
  'alkali-metal': '#ffb3ba',
  'alkaline-earth': '#ffd9a0',
  'metalloid': '#ffe0ac',
  'halogen': '#bae1ff',
  'transition-metal': '#ffc3a0',
  'post-transition-metal': '#d5f4e6',
};

@Component({
  selector: 'lib-element-picker',
  standalone: true,
  template: `
    <div class="element-picker">
      <div class="picker-label">Select Element</div>
      <div class="grid">
        @for (el of elements; track el.symbol) {
          <button class="el-btn"
            [style.background]="getCategoryColor(el)"
            [title]="el.name + ' (' + el.atomicNumber + ')'"
            (click)="picked.emit(el.symbol)">
            <span class="el-number">{{ el.atomicNumber }}</span>
            <span class="el-symbol">{{ el.symbol }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .element-picker { padding: 6px 8px; }
    .picker-label { font-size: 11px; font-weight: 600; color: var(--tool-text-secondary); margin-bottom: 4px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(18, 1fr); gap: 2px; overflow: hidden; }
    .el-btn {
      border: 1px solid var(--tool-input-border); border-radius: 3px; cursor: pointer; padding: 1px 0;
      display: flex; flex-direction: column; align-items: center;
      min-width: 0; font-family: inherit; transition: transform 0.1s;
    }
    .el-btn:hover { transform: scale(1.15); z-index: 1; border-color: #1890ff; }
    .el-number { font-size: 7px; color: var(--tool-text-secondary); }
    .el-symbol { font-size: 10px; font-weight: 700; color: var(--tool-text); }
  `,
})
export class ElementPickerComponent {
  @Output() picked = new EventEmitter<string>();
  elements = ELEMENTS_36;

  getCategoryColor(el: ElementData): string {
    return CATEGORY_COLORS[el.category] || '#f0f0f0';
  }
}
