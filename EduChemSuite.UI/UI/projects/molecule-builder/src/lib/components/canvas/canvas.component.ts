import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import Konva from 'konva';
import { Atom, LonePair } from '../../models/atom.model';
import { Bond, BondType } from '../../models/bond.model';
import { MoleculeBuilderService } from '../../molecule-builder.service';

const ATOM_RADIUS = 22;
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

@Component({
    selector: 'lib-canvas',
    imports: [],
    template: `<div #container class="canvas-container"></div>`,
    styles: `
    .canvas-container {
      flex: 1;
      overflow: hidden;
      cursor: crosshair;
    }
  `
})
export class CanvasComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  @Input() width = 800;
  @Input() height = 600;
  @Input() readOnly = false;

  @Output() changed = new EventEmitter<void>();

  private stage!: Konva.Stage;
  private atomLayer!: Konva.Layer;
  private bondLayer!: Konva.Layer;
  private tempLayer!: Konva.Layer;
  private subs = new Subscription();

  private bondStartAtomId: string | null = null;
  private tempLine: Konva.Line | null = null;
  private isDragging = false;

  constructor(private service: MoleculeBuilderService) {}

  ngAfterViewInit(): void {
    this.initStage();
    this.subscribeToState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['width'] || changes['height']) {
      this.stage?.setSize({ width: this.width, height: this.height });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.stage?.destroy();
  }

  exportImage(): string {
    return this.stage.toDataURL({ pixelRatio: 2 });
  }

  private initStage(): void {
    this.stage = new Konva.Stage({
      container: this.containerRef.nativeElement,
      width: this.width,
      height: this.height,
    });

    this.bondLayer = new Konva.Layer();
    this.atomLayer = new Konva.Layer();
    this.tempLayer = new Konva.Layer();

    this.stage.add(this.bondLayer);
    this.stage.add(this.atomLayer);
    this.stage.add(this.tempLayer);

    if (!this.readOnly) {
      this.bindStageEvents();
    }
  }

  private subscribeToState(): void {
    this.subs.add(
      combineLatest([this.service.atoms, this.service.bonds, this.service.selectedAtomId]).subscribe(
        ([atoms, bonds, selectedId]) => {
          this.renderBonds(atoms, bonds);
          // Skip destroying/recreating atom groups while a drag is in progress
          if (!this.isDragging) {
            this.renderAtoms(atoms, selectedId);
          }
        }
      )
    );
  }

  private bindStageEvents(): void {
    this.stage.on('click tap', (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === this.stage) {
        this.handleStageClick(e);
      }
    });

    this.stage.on('mousemove touchmove', (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (this.bondStartAtomId && this.tempLine) {
        const pos = this.stage.getPointerPosition();
        if (pos) {
          const startAtom = this.service.getAtomById(this.bondStartAtomId);
          if (startAtom) {
            this.tempLine.points([startAtom.x, startAtom.y, pos.x, pos.y]);
            this.tempLayer.batchDraw();
          }
        }
      }
    });
  }

  private handleStageClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>): void {
    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    const currentMode = this.service.currentMode;

    if (currentMode === 'placeAtom') {
      this.service.addAtom(pos.x, pos.y);
      this.changed.emit();
    } else if (currentMode === 'select') {
      this.service.selectAtom(null);
    }
  }

  private renderAtoms(atoms: Atom[], selectedId: string | null): void {
    this.atomLayer.destroyChildren();

    for (const atom of atoms) {
      const group = new Konva.Group({
        x: atom.x,
        y: atom.y,
        draggable: !this.readOnly,
      });

      const isSelected = atom.id === selectedId;

      if (isSelected) {
        const highlight = new Konva.Circle({
          radius: ATOM_RADIUS + 4,
          stroke: '#0d6efd',
          strokeWidth: 2,
          dash: [4, 4],
        });
        group.add(highlight);
      }

      const strokeColor = getComputedStyle(document.body).getPropertyValue('--tool-text').trim() || '#212529';
      const circle = new Konva.Circle({
        radius: ATOM_RADIUS,
        fill: getElementColor(atom.element),
        stroke: strokeColor,
        strokeWidth: 2,
      });

      const label = new Konva.Text({
        text: atom.element,
        fontSize: 16,
        fontStyle: 'bold',
        fill: getTextColor(atom.element),
        align: 'center',
        verticalAlign: 'middle',
        width: ATOM_RADIUS * 2,
        height: ATOM_RADIUS * 2,
        offsetX: ATOM_RADIUS,
        offsetY: ATOM_RADIUS,
      });

      group.add(circle);
      group.add(label);

      // Render lone pairs as dot pairs around the atom
      if (atom.lonePairs && atom.lonePairs.length > 0) {
        this.renderLonePairs(group, atom.lonePairs);
      }

      // Render formal charge
      if (atom.formalCharge !== undefined && atom.formalCharge !== 0) {
        const chargeText = atom.formalCharge > 0
          ? (atom.formalCharge === 1 ? '+' : `${atom.formalCharge}+`)
          : (atom.formalCharge === -1 ? '−' : `${Math.abs(atom.formalCharge)}−`);
        const chargeLabel = new Konva.Text({
          text: chargeText,
          fontSize: 12,
          fontStyle: 'bold',
          fill: atom.formalCharge > 0 ? '#ff4d4f' : '#1890ff',
          x: ATOM_RADIUS - 4,
          y: -(ATOM_RADIUS + 10),
        });
        group.add(chargeLabel);
      }

      if (!this.readOnly) {
        this.bindAtomEvents(group, atom);
      }

      this.atomLayer.add(group);
    }

    this.atomLayer.batchDraw();
  }

  private bindAtomEvents(group: Konva.Group, atom: Atom): void {
    group.on('click tap', (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true;

      const currentMode = this.service.currentMode;

      if (currentMode === 'erase') {
        this.service.removeAtom(atom.id);
        this.changed.emit();
        return;
      }

      if (currentMode === 'lonePair') {
        this.service.addLonePair(atom.id);
        this.service.calculateFormalCharges();
        this.changed.emit();
        return;
      }

      if (currentMode === 'drawBond') {
        if (!this.bondStartAtomId) {
          this.bondStartAtomId = atom.id;
          this.tempLine = new Konva.Line({
            points: [atom.x, atom.y, atom.x, atom.y],
            stroke: '#0d6efd',
            strokeWidth: 2,
            dash: [6, 4],
          });
          this.tempLayer.add(this.tempLine);
          this.tempLayer.batchDraw();
        } else {
          this.service.addBond(this.bondStartAtomId, atom.id);
          this.service.calculateFormalCharges();
          this.clearTempBond();
          this.changed.emit();
        }
        return;
      }

      if (currentMode === 'select') {
        this.service.selectAtom(atom.id);
      }
    });

    group.on('dragstart', () => {
      this.isDragging = true;
    });

    group.on('dragmove', () => {
      // Update atom position in service so bonds re-render, but atoms layer
      // is NOT destroyed/recreated during drag (guarded by isDragging flag)
      const pos = group.position();
      this.service.moveAtom(atom.id, pos.x, pos.y);
    });

    group.on('dragend', () => {
      const pos = group.position();
      this.isDragging = false;
      // Final sync — this will trigger a full re-render including atoms
      this.service.moveAtom(atom.id, pos.x, pos.y);
      this.changed.emit();
    });
  }

  private renderLonePairs(group: Konva.Group, lonePairs: LonePair[]): void {
    const DOT_OFFSET = ATOM_RADIUS + 8;
    const DOT_GAP = 5;
    const DOT_RADIUS = 3;

    for (const lp of lonePairs) {
      let x1: number, y1: number, x2: number, y2: number;
      switch (lp.position) {
        case 'top':
          x1 = -DOT_GAP; y1 = -DOT_OFFSET;
          x2 = DOT_GAP; y2 = -DOT_OFFSET;
          break;
        case 'bottom':
          x1 = -DOT_GAP; y1 = DOT_OFFSET;
          x2 = DOT_GAP; y2 = DOT_OFFSET;
          break;
        case 'left':
          x1 = -DOT_OFFSET; y1 = -DOT_GAP;
          x2 = -DOT_OFFSET; y2 = DOT_GAP;
          break;
        case 'right':
          x1 = DOT_OFFSET; y1 = -DOT_GAP;
          x2 = DOT_OFFSET; y2 = DOT_GAP;
          break;
      }
      const dotColor = getComputedStyle(document.body).getPropertyValue('--tool-text').trim() || '#333';
      group.add(new Konva.Circle({ x: x1, y: y1, radius: DOT_RADIUS, fill: dotColor }));
      group.add(new Konva.Circle({ x: x2, y: y2, radius: DOT_RADIUS, fill: dotColor }));
    }
  }

  private clearTempBond(): void {
    this.bondStartAtomId = null;
    this.tempLine?.destroy();
    this.tempLine = null;
    this.tempLayer.batchDraw();
  }

  private renderBonds(atoms: Atom[], bonds: Bond[]): void {
    this.bondLayer.destroyChildren();

    const atomMap = new Map(atoms.map((a) => [a.id, a]));

    for (const bond of bonds) {
      const from = atomMap.get(bond.fromAtomId);
      const to = atomMap.get(bond.toAtomId);
      if (!from || !to) continue;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const lines = this.getBondLines(from, to, bond.type, nx, ny);

      const bondStroke = getComputedStyle(document.body).getPropertyValue('--tool-text').trim() || '#212529';
      for (const pts of lines) {
        const line = new Konva.Line({
          points: pts,
          stroke: bondStroke,
          strokeWidth: 2,
          hitStrokeWidth: 10,
        });

        if (!this.readOnly) {
          line.on('click tap', (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
            e.cancelBubble = true;

            const currentMode = this.service.currentMode;

            if (currentMode === 'erase') {
              this.service.removeBond(bond.id);
              this.changed.emit();
            }
          });
        }

        this.bondLayer.add(line);
      }
    }

    this.bondLayer.batchDraw();
  }

  private getBondLines(
    from: Atom,
    to: Atom,
    type: BondType,
    nx: number,
    ny: number
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
