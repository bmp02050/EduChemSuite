import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import Konva from 'konva';
import { Atom } from '../../models/atom.model';
import { Bond, BondType } from '../../models/bond.model';
import { MoleculeGraph } from '../../models/molecule-graph.model';

const ATOM_RADIUS = 18;
const BOND_OFFSET = 4;

const ELEMENT_COLORS: Record<string, string> = {
  C: '#333333',
  H: '#FFFFFF',
  O: '#FF0D0D',
  N: '#3050F8',
  S: '#FFFF30',
  P: '#FF8000',
  Cl: '#1FF01F',
  Br: '#A62929',
  F: '#90E050',
  I: '#940094',
};

function getElementColor(element: string): string {
  return ELEMENT_COLORS[element] ?? '#AAAAAA';
}

function getTextColor(element: string): string {
  const dark = ['C', 'Br', 'I'];
  return dark.includes(element) ? '#FFFFFF' : '#000000';
}

interface NormalizedGraph {
  atoms: Atom[];
  bonds: Bond[];
}

/**
 * Computes centroid of an atom array, then translates all atoms so the
 * centroid sits at (targetX, targetY). Returns a new array (no mutation).
 */
function centerGraph(graph: MoleculeGraph, targetX: number, targetY: number): NormalizedGraph {
  const atoms = graph.atoms;
  if (atoms.length === 0) return { atoms: [], bonds: [...graph.bonds] };

  const cx = atoms.reduce((s, a) => s + a.x, 0) / atoms.length;
  const cy = atoms.reduce((s, a) => s + a.y, 0) / atoms.length;
  const dx = targetX - cx;
  const dy = targetY - cy;

  return {
    atoms: atoms.map(a => ({ ...a, x: a.x + dx, y: a.y + dy })),
    bonds: [...graph.bonds],
  };
}

@Component({
    selector: 'lib-molecule-compare',
    imports: [],
    template: `
    <div #container class="compare-container"></div>
    <div class="compare-legend">
      <span class="legend-item"><span class="legend-dot student"></span> Student</span>
      <span class="legend-item"><span class="legend-dot correct"></span> Correct</span>
    </div>
  `,
    styles: `
    .compare-container {
      border: 1px solid var(--tool-border);
      border-radius: 4px;
      overflow: hidden;
      background: var(--tool-bg-secondary);
    }
    .compare-legend {
      display: flex;
      gap: 16px;
      margin-top: 6px;
      font-size: 12px;
      color: var(--tool-text-secondary);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .legend-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .legend-dot.student {
      background: #333;
      border: 1px solid #212529;
    }
    .legend-dot.correct {
      background: rgba(82, 196, 26, 0.6);
      border: 1px solid #52c41a;
    }
  `
})
export class MoleculeCompareComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  /** JSON string of the student's MoleculeGraph */
  @Input() studentGraph: string | null = null;
  /** JSON string of the correct MoleculeGraph */
  @Input() correctGraph: string | null = null;
  @Input() width = 400;
  @Input() height = 280;

  private stage: Konva.Stage | null = null;

  ngAfterViewInit(): void {
    this.initAndRender();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.stage) {
      if (changes['width'] || changes['height']) {
        this.stage.setSize({ width: this.width, height: this.height });
      }
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.stage?.destroy();
  }

  private initAndRender(): void {
    this.stage = new Konva.Stage({
      container: this.containerRef.nativeElement,
      width: this.width,
      height: this.height,
    });
    this.render();
  }

  private render(): void {
    if (!this.stage) return;
    this.stage.destroyChildren();

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    let studentParsed: MoleculeGraph | null = null;
    let correctParsed: MoleculeGraph | null = null;

    try {
      if (this.studentGraph) studentParsed = JSON.parse(this.studentGraph);
    } catch { /* ignore */ }
    try {
      if (this.correctGraph) correctParsed = JSON.parse(this.correctGraph);
    } catch { /* ignore */ }

    // Render correct answer first (underneath, semi-transparent green)
    if (correctParsed?.atoms?.length) {
      const normalized = centerGraph(correctParsed, centerX, centerY);
      const layer = new Konva.Layer({ opacity: 0.45 });
      this.renderGraphToLayer(layer, normalized, '#52c41a', '#52c41a');
      this.stage.add(layer);
    }

    // Render student answer on top (full opacity, normal colors)
    if (studentParsed?.atoms?.length) {
      const normalized = centerGraph(studentParsed, centerX, centerY);
      const layer = new Konva.Layer();
      this.renderGraphToLayer(layer, normalized, null, '#212529');
      this.stage.add(layer);
    }
  }

  /**
   * Renders a molecule graph onto a Konva layer.
   * @param overrideColor If set, all atoms use this fill color. If null, use element colors.
   * @param bondColor The color for bonds.
   */
  private renderGraphToLayer(
    layer: Konva.Layer,
    graph: NormalizedGraph,
    overrideColor: string | null,
    bondColor: string,
  ): void {
    const atomMap = new Map(graph.atoms.map(a => [a.id, a]));

    // Bonds
    for (const bond of graph.bonds) {
      const from = atomMap.get(bond.fromAtomId);
      const to = atomMap.get(bond.toAtomId);
      if (!from || !to) continue;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const lines = this.getBondLines(from, to, bond.type, nx, ny);
      for (const pts of lines) {
        layer.add(new Konva.Line({
          points: pts,
          stroke: bondColor,
          strokeWidth: 2,
        }));
      }
    }

    // Atoms
    for (const atom of graph.atoms) {
      const group = new Konva.Group({ x: atom.x, y: atom.y });

      const fillColor = overrideColor ?? getElementColor(atom.element);
      const txtColor = overrideColor ? '#fff' : getTextColor(atom.element);

      group.add(new Konva.Circle({
        radius: ATOM_RADIUS,
        fill: fillColor,
        stroke: bondColor,
        strokeWidth: 1.5,
      }));

      group.add(new Konva.Text({
        text: atom.element,
        fontSize: 14,
        fontStyle: 'bold',
        fill: txtColor,
        align: 'center',
        verticalAlign: 'middle',
        width: ATOM_RADIUS * 2,
        height: ATOM_RADIUS * 2,
        offsetX: ATOM_RADIUS,
        offsetY: ATOM_RADIUS,
      }));

      layer.add(group);
    }

    layer.batchDraw();
  }

  private getBondLines(
    from: Atom, to: Atom, type: BondType, nx: number, ny: number,
  ): number[][] {
    switch (type) {
      case 'single':
        return [[from.x, from.y, to.x, to.y]];
      case 'double':
        return [
          [from.x + nx * BOND_OFFSET, from.y + ny * BOND_OFFSET, to.x + nx * BOND_OFFSET, to.y + ny * BOND_OFFSET],
          [from.x - nx * BOND_OFFSET, from.y - ny * BOND_OFFSET, to.x - nx * BOND_OFFSET, to.y - ny * BOND_OFFSET],
        ];
      case 'triple':
        return [
          [from.x, from.y, to.x, to.y],
          [from.x + nx * BOND_OFFSET * 1.5, from.y + ny * BOND_OFFSET * 1.5, to.x + nx * BOND_OFFSET * 1.5, to.y + ny * BOND_OFFSET * 1.5],
          [from.x - nx * BOND_OFFSET * 1.5, from.y - ny * BOND_OFFSET * 1.5, to.x - nx * BOND_OFFSET * 1.5, to.y - ny * BOND_OFFSET * 1.5],
        ];
    }
  }
}
