import { Component, Input, OnChanges } from '@angular/core';
import { ElectronConfiguration, configToNotation, totalElectrons } from '../../models/electron-config.model';

@Component({
  selector: 'electron-config-compare',
  standalone: true,
  template: `
    <div class="econfig-compare">
      <div class="compare-row">
        <span class="label">Your answer:</span>
        <div class="notation" [class.wrong]="!isCorrect">{{ studentNotation }}</div>
        <div class="orbitals">
          @for (orbital of studentConfig.orbitals; track orbital.name; let i = $index) {
            <div class="orbital-row">
              <span class="orbital-label">{{ orbital.name }}</span>
              <div class="boxes">
                @for (box of orbital.boxes; track $index) {
                  <div class="box" [class.wrong]="!isOrbitalCorrect(i)">
                    @for (electron of box.electrons; track $index) {
                      <span class="arrow" [class.up]="electron.spin === 'up'">
                        {{ electron.spin === 'up' ? '↑' : '↓' }}
                      </span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
      <div class="compare-row">
        <span class="label">Correct:</span>
        <div class="notation correct">{{ correctNotation }}</div>
      </div>
    </div>
  `,
  styles: `
    .econfig-compare {
      border: 1px solid var(--tool-border); border-radius: 8px;
      padding: 12px; background: var(--tool-bg);
    }
    .compare-row { margin-bottom: 8px; }
    .compare-row:last-child { margin-bottom: 0; }
    .label {
      display: block; font-size: 11px; font-weight: 600;
      color: var(--tool-text-muted); text-transform: uppercase; margin-bottom: 4px;
    }
    .notation {
      font-family: monospace; font-size: 14px; margin-bottom: 6px; color: var(--tool-text);
    }
    .notation.wrong { color: #ff4d4f; }
    .notation.correct { color: #52c41a; }
    .orbitals { display: flex; flex-direction: column; gap: 2px; }
    .orbital-row { display: flex; align-items: center; gap: 6px; }
    .orbital-label { width: 24px; font-size: 11px; font-weight: 600; text-align: right; color: var(--tool-text-secondary); }
    .boxes { display: flex; gap: 2px; }
    .box {
      width: 28px; height: 30px; border: 1px solid var(--tool-text-muted);
      display: flex; align-items: center; justify-content: center;
      gap: 1px; background: var(--tool-bg-secondary); border-radius: 2px; font-size: 13px;
    }
    .box.wrong { border-color: #ff4d4f; background: #fff1f0; }
    .arrow { font-weight: 700; }
    .arrow.up { color: #f5222d; }
  `,
})
export class ElectronConfigCompareComponent implements OnChanges {
  @Input() studentGraph = '';
  @Input() correctGraph = '';

  studentConfig: ElectronConfiguration = { orbitals: [] };
  correctConfig: ElectronConfiguration = { orbitals: [] };
  studentNotation = '';
  correctNotation = '';
  isCorrect = false;

  ngOnChanges(): void {
    this.studentConfig = this.parse(this.studentGraph);
    this.correctConfig = this.parse(this.correctGraph);
    this.studentNotation = configToNotation(this.studentConfig);
    this.correctNotation = configToNotation(this.correctConfig);
    this.isCorrect = this.studentNotation === this.correctNotation;
  }

  isOrbitalCorrect(index: number): boolean {
    const s = this.studentConfig.orbitals[index];
    const c = this.correctConfig.orbitals[index];
    if (!s || !c) return false;
    return totalElectrons(s) === totalElectrons(c);
  }

  private parse(json: string): ElectronConfiguration {
    try { return JSON.parse(json); }
    catch { return { orbitals: [] }; }
  }
}
