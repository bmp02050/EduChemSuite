import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ElectronConfiguration, configToNotation, totalElectrons } from './models/electron-config.model';
import { ElectronConfigService } from './electron-config.service';
import { ELEMENTS } from 'chemistry-data';

@Component({
  selector: 'electron-config',
  standalone: true,
  imports: [FormsModule],
  providers: [ElectronConfigService],
  template: `
    <div class="electron-config" [style.max-width.px]="width">
      @if (showElementPicker && !readOnly) {
        <div class="element-picker">
          <label>Select element:</label>
          <select (change)="onElementSelect($event)">
            <option value="">-- Choose --</option>
            @for (el of elements; track el.symbol) {
              <option [value]="el.symbol">{{ el.atomicNumber }}. {{ el.name }} ({{ el.symbol }})</option>
            }
          </select>
        </div>
      }

      @if (config.orbitals.length > 0) {
        <div class="orbitals">
          @for (orbital of config.orbitals; track orbital.name; let oi = $index) {
            <div class="orbital-row">
              <span class="orbital-label">{{ orbital.name }}</span>
              <div class="boxes">
                @for (box of orbital.boxes; track $index; let bi = $index) {
                  <div class="box" [class.clickable]="!readOnly"
                    (click)="onBoxClick(oi, bi)">
                    @for (electron of box.electrons; track $index) {
                      <span class="arrow" [class.up]="electron.spin === 'up'"
                        [class.down]="electron.spin === 'down'">
                        {{ electron.spin === 'up' ? '↑' : '↓' }}
                      </span>
                    }
                  </div>
                }
              </div>
              <span class="electron-count">{{ getOrbitalElectrons(oi) }}</span>
            </div>
          }
        </div>
        <div class="notation">{{ notation }}</div>
      } @else if (!readOnly) {
        <div class="empty-state">
          @if (showElementPicker) {
            Select an element above to begin.
          } @else {
            Click the orbital boxes to add electrons.
          }
        </div>
      }
    </div>
  `,
  styles: `
    .electron-config {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 16px; background: var(--tool-bg);
    }
    .element-picker { margin-bottom: 12px; }
    .element-picker label {
      font-size: 12px; font-weight: 600; color: var(--tool-text-secondary); margin-right: 8px;
    }
    .element-picker select {
      padding: 4px 8px; border: 1px solid var(--tool-input-border); border-radius: 6px;
      font-size: 13px; background: var(--tool-bg); color: var(--tool-text);
    }
    .orbitals { display: flex; flex-direction: column; gap: 4px; }
    .orbital-row { display: flex; align-items: center; gap: 8px; }
    .orbital-label {
      width: 28px; font-size: 13px; font-weight: 600; text-align: right; color: var(--tool-text-secondary);
    }
    .boxes { display: flex; gap: 3px; }
    .box {
      width: 32px; height: 36px; border: 1px solid var(--tool-text-muted);
      display: flex; align-items: center; justify-content: center;
      gap: 1px; background: var(--tool-bg-secondary); border-radius: 3px;
    }
    .box.clickable { cursor: pointer; }
    .box.clickable:hover { border-color: #1890ff; background: var(--tool-bg-hover); }
    .arrow { font-size: 16px; font-weight: 700; }
    .arrow.up { color: #f5222d; }
    .arrow.down { color: #1890ff; }
    .electron-count {
      font-size: 11px; color: var(--tool-text-muted); min-width: 16px;
    }
    .notation {
      margin-top: 12px; padding: 8px 12px; background: var(--tool-bg-secondary);
      border-radius: 6px; font-size: 16px; font-family: monospace;
      letter-spacing: 0.5px; color: var(--tool-text);
    }
    .empty-state { color: var(--tool-text-muted); font-size: 14px; text-align: center; padding: 20px; }
  `,
})
export class ElectronConfigComponent implements OnChanges, OnDestroy {
  @Input() graph: ElectronConfiguration | null = null;
  @Input() readOnly = false;
  @Input() showElementPicker = false;
  @Input() width = 500;
  @Output() graphChange = new EventEmitter<ElectronConfiguration>();

  config: ElectronConfiguration = { orbitals: [] };
  notation = '';
  elements = ELEMENTS.filter(e => e.atomicNumber <= 36);
  private sub: Subscription;

  constructor(private service: ElectronConfigService) {
    this.sub = this.service.config$.subscribe(c => {
      this.config = c;
      this.notation = configToNotation(c);
      this.graphChange.emit(structuredClone(c));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph']) {
      if (this.graph) {
        this.service.loadConfig(this.graph);
      } else if (!this.readOnly) {
        this.service.initOrbitals();
      }
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onElementSelect(e: Event): void {
    const symbol = (e.target as HTMLSelectElement).value;
    if (symbol) this.service.selectElement(symbol);
  }

  onBoxClick(orbitalIndex: number, boxIndex: number): void {
    if (this.readOnly) return;
    this.service.toggleBox(orbitalIndex, boxIndex);
  }

  getOrbitalElectrons(orbitalIndex: number): number {
    return totalElectrons(this.config.orbitals[orbitalIndex]);
  }
}
