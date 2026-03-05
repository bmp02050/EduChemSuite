import {
  Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import Konva from 'konva';
import { AtomicStructureGraph } from '../../models/atomic-structure.model';

@Component({
  selector: 'lib-atom-compare',
  standalone: true,
  template: `
    <div class="atom-compare">
      <div #container></div>
      <div class="legend">
        <span class="legend-item"><span class="dot correct"></span> Correct</span>
        <span class="legend-item"><span class="dot student"></span> Student</span>
      </div>
    </div>
  `,
  styles: `
    .atom-compare { display: inline-block; border: 1px solid var(--tool-border); border-radius: 6px; overflow: hidden; background: var(--tool-bg); }
    .legend { display: flex; gap: 16px; padding: 6px 12px; border-top: 1px solid var(--tool-border-light); font-size: 12px; color: var(--tool-text-secondary); }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.correct { background: #52c41a; }
    .dot.student { background: #1890ff; }
  `,
})
export class AtomCompareComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @Input() studentGraph: string | null = null;
  @Input() correctGraph: string | null = null;
  @Input() width = 400;
  @Input() height = 280;

  private stage!: Konva.Stage;
  private layer!: Konva.Layer;

  ngAfterViewInit(): void {
    this.stage = new Konva.Stage({
      container: this.containerRef.nativeElement,
      width: this.width,
      height: this.height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.render();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.stage) {
      this.stage.width(this.width);
      this.stage.height(this.height);
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.stage?.destroy();
  }

  private parse(json: string | null): AtomicStructureGraph | null {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
  }

  private render(): void {
    if (!this.layer) return;
    this.layer.destroyChildren();

    const correct = this.parse(this.correctGraph);
    const student = this.parse(this.studentGraph);

    // Render correct answer first (semi-transparent green)
    if (correct) this.renderModel(correct, '#52c41a', 0.35);
    // Render student answer on top
    if (student) this.renderModel(student, '#1890ff', 0.8);

    this.layer.batchDraw();
  }

  private renderModel(g: AtomicStructureGraph, color: string, opacity: number): void {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxRadius = Math.min(cx, cy) - 15;
    const nucleusRadius = Math.max(20, maxRadius * 0.15);
    const shellCount = g.shells.length;
    const shellSpacing = shellCount > 0 ? (maxRadius - nucleusRadius) / (shellCount + 0.5) : 0;

    // Nucleus
    this.layer.add(new Konva.Circle({
      x: cx, y: cy, radius: nucleusRadius,
      stroke: color, strokeWidth: 2, fill: 'transparent', opacity,
    }));
    this.layer.add(new Konva.Text({
      x: cx - nucleusRadius, y: cy - 8, width: nucleusRadius * 2,
      text: `${g.nucleus.protons}p+`, fontSize: 10, fill: color, align: 'center', opacity,
    }));

    // Shells and electrons
    for (let i = 0; i < shellCount; i++) {
      const r = nucleusRadius + shellSpacing * (i + 1);
      this.layer.add(new Konva.Circle({
        x: cx, y: cy, radius: r,
        stroke: color, strokeWidth: 1, dash: [4, 3], fill: 'transparent', opacity: opacity * 0.6,
      }));

      const shell = g.shells[i];
      for (let e = 0; e < shell.electrons; e++) {
        const angle = (2 * Math.PI * e) / Math.max(shell.electrons, 1) - Math.PI / 2;
        this.layer.add(new Konva.Circle({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          radius: 4, fill: color, opacity,
        }));
      }
    }
  }
}
