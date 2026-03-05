import {
  Component, Input, Output, EventEmitter,
  ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import Konva from 'konva';
import { AtomBuilderService } from '../../atom-builder.service';
import { AtomicStructureGraph } from '../../models/atomic-structure.model';

const PROTON_COLOR = '#e74c3c';
const NEUTRON_COLOR = '#95a5a6';
const ELECTRON_COLOR = '#3498db';

function getCssVar(name: string): string {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

@Component({
  selector: 'lib-atom-canvas',
  standalone: true,
  template: `<div #container></div>`,
})
export class AtomCanvasComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @Input() width = 500;
  @Input() height = 400;
  @Input() readOnly = false;
  @Input() hideElement = false;
  @Output() shellClicked = new EventEmitter<number>();

  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private sub?: Subscription;

  constructor(private service: AtomBuilderService) {}

  ngAfterViewInit(): void {
    this.stage = new Konva.Stage({
      container: this.containerRef.nativeElement,
      width: this.width,
      height: this.height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.sub = this.service.graph.subscribe(() => this.render());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['width'] || changes['height']) && this.stage) {
      this.stage.width(this.width);
      this.stage.height(this.height);
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.stage?.destroy();
  }

  exportImage(): string {
    return this.stage.toDataURL({ pixelRatio: 2 });
  }

  private render(): void {
    if (!this.layer) return;
    this.layer.destroyChildren();
    const g = this.service.getGraph();
    const cx = this.width / 2;
    const cy = this.height / 2;

    const shellColor = getCssVar('--tool-border') || '#bdc3c7';
    const nucleusBg = getCssVar('--tool-bg-secondary') || '#f5f5f5';
    const textColor = getCssVar('--tool-text') || '#333';
    const textSecondary = getCssVar('--tool-text-secondary') || '#666';
    const textMuted = getCssVar('--tool-text-muted') || '#999';

    const shellCount = g.shells.length;
    const maxRadius = Math.min(cx, cy) - 20;
    const nucleusRadius = Math.max(28, maxRadius * 0.15);
    const shellSpacing = shellCount > 0 ? (maxRadius - nucleusRadius) / (shellCount + 0.5) : 0;

    // Draw shells (concentric rings) - draw from outermost to innermost
    for (let i = shellCount - 1; i >= 0; i--) {
      const r = nucleusRadius + shellSpacing * (i + 1);
      const ring = new Konva.Circle({
        x: cx, y: cy,
        radius: r,
        stroke: shellColor,
        strokeWidth: 1.5,
        dash: [6, 4],
        fill: 'transparent',
      });
      if (!this.readOnly) {
        ring.on('click tap', () => this.shellClicked.emit(i));
        ring.on('mouseenter', () => { this.stage.container().style.cursor = 'pointer'; });
        ring.on('mouseleave', () => { this.stage.container().style.cursor = 'default'; });
      }
      this.layer.add(ring);

      // Shell label
      this.layer.add(new Konva.Text({
        x: cx + r + 4, y: cy - 8,
        text: `n=${i + 1}`,
        fontSize: 10,
        fill: textMuted,
      }));

      // Electrons on this shell
      const shell = g.shells[i];
      for (let e = 0; e < shell.electrons; e++) {
        const angle = (2 * Math.PI * e) / Math.max(shell.electrons, 1) - Math.PI / 2;
        const ex = cx + r * Math.cos(angle);
        const ey = cy + r * Math.sin(angle);
        this.layer.add(new Konva.Circle({
          x: ex, y: ey,
          radius: 6,
          fill: ELECTRON_COLOR,
          stroke: '#2980b9',
          strokeWidth: 1,
        }));
      }
    }

    // Draw nucleus
    this.layer.add(new Konva.Circle({
      x: cx, y: cy,
      radius: nucleusRadius,
      fill: nucleusBg,
      stroke: shellColor,
      strokeWidth: 2,
    }));

    // Nucleus text
    const protons = g.nucleus.protons;
    const neutrons = g.nucleus.neutrons;
    this.layer.add(new Konva.Text({
      x: cx - nucleusRadius + 4,
      y: cy - 16,
      width: (nucleusRadius - 4) * 2,
      text: `${protons}p+`,
      fontSize: 13,
      fontStyle: 'bold',
      fill: PROTON_COLOR,
      align: 'center',
    }));
    this.layer.add(new Konva.Text({
      x: cx - nucleusRadius + 4,
      y: cy + 2,
      width: (nucleusRadius - 4) * 2,
      text: `${neutrons}n`,
      fontSize: 13,
      fontStyle: 'bold',
      fill: textSecondary,
      align: 'center',
    }));

    // Element label (top-left) — hidden during exams
    if (!this.hideElement) {
      const labelText = g.element
        ? `${g.element}  (Z=${g.atomicNumber}, A=${g.massNumber})`
        : `Z=${protons}, A=${protons + neutrons}`;
      this.layer.add(new Konva.Text({
        x: 10, y: 10,
        text: labelText,
        fontSize: 14,
        fontStyle: 'bold',
        fill: textColor,
      }));
    }

    // Color legend (bottom-left)
    const legendY = this.height - 50;
    this.drawLegendItem(10, legendY, PROTON_COLOR, 'Proton', textSecondary);
    this.drawLegendItem(80, legendY, NEUTRON_COLOR, 'Neutron', textSecondary);
    this.drawLegendItem(160, legendY, ELECTRON_COLOR, 'Electron', textSecondary);

    this.layer.batchDraw();
  }

  private drawLegendItem(x: number, y: number, color: string, label: string, textColor: string): void {
    this.layer.add(new Konva.Circle({ x: x + 5, y: y + 5, radius: 5, fill: color }));
    this.layer.add(new Konva.Text({ x: x + 14, y, text: label, fontSize: 11, fill: textColor }));
  }
}
