import { Component } from '@angular/core';

import { BondType } from '../../models/bond.model';
import { MoleculeBuilderService, InteractionMode } from '../../molecule-builder.service';

interface ToolButton {
  label: string;
  mode: InteractionMode;
  bondType?: BondType;
  icon: string;
}

@Component({
    selector: 'lib-bond-toolbar',
    imports: [],
    template: `
    <div class="bond-toolbar">
      @for (tool of tools; track tool.label) {
        <button
          class="tool-btn"
          [class.active]="isActive(tool)"
          [title]="tool.label"
          (click)="selectTool(tool)">
          <span class="tool-icon">{{ tool.icon }}</span>
          <span class="tool-label">{{ tool.label }}</span>
        </button>
      }
      <div class="toolbar-divider"></div>
      <button class="tool-btn danger" title="Clear All" (click)="clearAll()">
        <span class="tool-icon">&#x2716;</span>
        <span class="tool-label">Clear</span>
      </button>
    </div>
  `,
    styles: `
    .bond-toolbar {
      display: flex;
      gap: 4px;
      padding: 8px;
      background: var(--tool-bg-secondary);
      border-bottom: 1px solid var(--tool-border);
      align-items: center;
      flex-wrap: wrap;
    }
    .tool-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: 2px solid var(--tool-border);
      border-radius: 6px;
      background: var(--tool-bg);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s ease;
      color: var(--tool-text);
    }
    .tool-btn:hover {
      border-color: #0d6efd;
      background: var(--tool-bg-hover);
    }
    .tool-btn.active {
      border-color: #0d6efd;
      background: #0d6efd;
      color: #fff;
    }
    .tool-btn.danger:hover {
      border-color: #dc3545;
      background: #f8d7da;
    }
    .tool-icon {
      font-size: 16px;
      line-height: 1;
    }
    .tool-label {
      font-weight: 500;
    }
    .toolbar-divider {
      width: 1px;
      height: 28px;
      background: var(--tool-border);
      margin: 0 4px;
    }
  `
})
export class BondToolbarComponent {
  tools: ToolButton[] = [
    { label: 'Select', mode: 'select', icon: '\u25B3' },
    { label: 'Single', mode: 'drawBond', bondType: 'single', icon: '\u2014' },
    { label: 'Double', mode: 'drawBond', bondType: 'double', icon: '\u003D' },
    { label: 'Triple', mode: 'drawBond', bondType: 'triple', icon: '\u2261' },
    { label: 'Erase', mode: 'erase', icon: '\u2421' },
    { label: 'Lone Pair', mode: 'lonePair', icon: '\u2237' },
  ];

  private currentTool: ToolButton = this.tools[0];

  constructor(private service: MoleculeBuilderService) {}

  isActive(tool: ToolButton): boolean {
    return this.currentTool === tool;
  }

  selectTool(tool: ToolButton): void {
    this.currentTool = tool;
    if (tool.bondType) {
      this.service.setSelectedBondType(tool.bondType);
    } else {
      this.service.setMode(tool.mode);
    }
  }

  clearAll(): void {
    this.service.clear();
  }
}
