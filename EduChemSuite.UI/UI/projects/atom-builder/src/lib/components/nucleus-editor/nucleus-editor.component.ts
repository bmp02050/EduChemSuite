import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AtomBuilderService } from '../../atom-builder.service';
import { map } from 'rxjs';

@Component({
  selector: 'lib-nucleus-editor',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="nucleus-editor">
      <div class="row">
        <span class="label">Protons</span>
        <button class="btn" (click)="adjustProtons(-1)">-</button>
        <span class="value">{{ protons$ | async }}</span>
        <button class="btn" (click)="adjustProtons(1)">+</button>
      </div>
      <div class="row">
        <span class="label">Neutrons</span>
        <button class="btn" (click)="adjustNeutrons(-1)">-</button>
        <span class="value">{{ neutrons$ | async }}</span>
        <button class="btn" (click)="adjustNeutrons(1)">+</button>
      </div>
    </div>
  `,
  styles: `
    .nucleus-editor { display: flex; gap: 16px; padding: 8px; }
    .row { display: flex; align-items: center; gap: 6px; }
    .label { font-size: 12px; font-weight: 600; width: 65px; color: var(--tool-text); }
    .value { font-size: 14px; font-weight: 700; min-width: 28px; text-align: center; color: var(--tool-text); }
    .btn {
      width: 24px; height: 24px; border: 1px solid var(--tool-input-border); border-radius: 4px;
      background: var(--tool-bg); cursor: pointer; font-size: 14px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; color: var(--tool-text);
    }
    .btn:hover { border-color: #1890ff; color: #1890ff; }
  `,
})
export class NucleusEditorComponent {
  service = inject(AtomBuilderService);
  protons$ = this.service.graph.pipe(map(g => g.nucleus.protons));
  neutrons$ = this.service.graph.pipe(map(g => g.nucleus.neutrons));

  adjustProtons(delta: number): void {
    const current = this.service.getGraph().nucleus.protons;
    this.service.setProtons(current + delta);
  }

  adjustNeutrons(delta: number): void {
    const current = this.service.getGraph().nucleus.neutrons;
    this.service.setNeutrons(current + delta);
  }
}
