import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AtomBuilderService } from '../../atom-builder.service';
import { map } from 'rxjs';

@Component({
  selector: 'lib-shell-editor',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="shell-editor">
      <div class="header">
        <span class="label">Shells</span>
        <button class="btn-sm" (click)="service.addShell()" title="Add shell">+</button>
        <button class="btn-sm" (click)="service.removeShell()" title="Remove last shell">-</button>
      </div>
      @for (shell of shells$ | async; track shell.n; let i = $index) {
        <div class="shell-row">
          <span class="shell-label">n={{ shell.n }}</span>
          <button class="btn" (click)="service.removeElectronFromShell(i)">-</button>
          <span class="value">{{ shell.electrons }}</span>
          <button class="btn" (click)="service.addElectronToShell(i)">+</button>
          <span class="max">/{{ shell.maxElectrons }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .shell-editor { padding: 8px; }
    .header { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
    .label { font-size: 11px; font-weight: 600; flex: 1; color: var(--tool-text); min-width: 50px; }
    .btn-sm {
      font-size: 10px; padding: 1px 4px; border: 1px solid var(--tool-input-border); border-radius: 3px;
      background: var(--tool-bg); cursor: pointer; color: var(--tool-text);
    }
    .btn-sm:hover { border-color: #1890ff; color: #1890ff; }
    .shell-row { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
    .shell-label { font-size: 11px; width: 32px; color: var(--tool-text-secondary); }
    .value { font-size: 12px; font-weight: 700; min-width: 16px; text-align: center; color: var(--tool-text); }
    .max { font-size: 10px; color: var(--tool-text-muted); }
    .btn {
      width: 20px; height: 20px; border: 1px solid var(--tool-input-border); border-radius: 3px;
      background: var(--tool-bg); cursor: pointer; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; color: var(--tool-text);
    }
    .btn:hover { border-color: #1890ff; color: #1890ff; }
  `,
})
export class ShellEditorComponent {
  service = inject(AtomBuilderService);
  shells$ = this.service.graph.pipe(map(g => g.shells));
}
