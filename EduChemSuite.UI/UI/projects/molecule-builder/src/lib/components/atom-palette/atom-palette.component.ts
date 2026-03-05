import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoleculeBuilderService } from '../../molecule-builder.service';

@Component({
    selector: 'lib-atom-palette',
    imports: [CommonModule],
    template: `
    <div class="atom-palette">
      <div class="palette-label">Elements</div>
      <div class="palette-grid">
        @for (el of elements; track el) {
          <button
            class="element-btn"
            [class.active]="(service.selectedElement | async) === el && (service.mode | async) === 'placeAtom'"
            (click)="selectElement(el)">
            {{ el }}
          </button>
        }
      </div>
    </div>
  `,
    styles: `
    .atom-palette {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      background: var(--tool-bg-secondary);
      border-right: 1px solid var(--tool-border);
      min-width: 64px;
    }
    .palette-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--tool-text-secondary);
      text-align: center;
    }
    .palette-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .element-btn {
      width: 48px;
      height: 48px;
      border: 2px solid var(--tool-border);
      border-radius: 8px;
      background: var(--tool-bg);
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--tool-text);
    }
    .element-btn:hover {
      border-color: #0d6efd;
      background: var(--tool-bg-hover);
    }
    .element-btn.active {
      border-color: #0d6efd;
      background: #0d6efd;
      color: #fff;
    }
  `
})
export class AtomPaletteComponent {
  @Input() elements: string[] = [];

  constructor(public service: MoleculeBuilderService) {}

  selectElement(el: string): void {
    this.service.setSelectedElement(el);
  }
}
