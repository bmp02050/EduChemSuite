import * as i0 from '@angular/core';
import { Injectable, Component, Input, EventEmitter, ViewChild, Output } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';
import Konva from 'konva';

class MoleculeBuilderService {
    atoms$ = new BehaviorSubject([]);
    bonds$ = new BehaviorSubject([]);
    selectedElement$ = new BehaviorSubject('C');
    selectedBondType$ = new BehaviorSubject('single');
    mode$ = new BehaviorSubject('select');
    selectedAtomId$ = new BehaviorSubject(null);
    idCounter = 0;
    atoms = this.atoms$.asObservable();
    bonds = this.bonds$.asObservable();
    selectedElement = this.selectedElement$.asObservable();
    selectedBondType = this.selectedBondType$.asObservable();
    mode = this.mode$.asObservable();
    selectedAtomId = this.selectedAtomId$.asObservable();
    generateId() {
        return `node-${++this.idCounter}-${Date.now()}`;
    }
    getGraph() {
        return {
            atoms: [...this.atoms$.value],
            bonds: [...this.bonds$.value],
        };
    }
    loadGraph(graph) {
        this.atoms$.next([...graph.atoms]);
        this.bonds$.next([...graph.bonds]);
        this.selectedAtomId$.next(null);
    }
    clear() {
        this.atoms$.next([]);
        this.bonds$.next([]);
        this.selectedAtomId$.next(null);
        this.idCounter = 0;
    }
    setMode(mode) {
        this.mode$.next(mode);
        if (mode !== 'select') {
            this.selectedAtomId$.next(null);
        }
    }
    setSelectedElement(element) {
        this.selectedElement$.next(element);
        this.setMode('placeAtom');
    }
    setSelectedBondType(type) {
        this.selectedBondType$.next(type);
        this.setMode('drawBond');
    }
    selectAtom(atomId) {
        this.selectedAtomId$.next(atomId);
    }
    addAtom(x, y) {
        const atom = {
            id: this.generateId(),
            element: this.selectedElement$.value,
            x,
            y,
        };
        this.atoms$.next([...this.atoms$.value, atom]);
        return atom;
    }
    moveAtom(atomId, x, y) {
        const atoms = this.atoms$.value.map((a) => a.id === atomId ? { ...a, x, y } : a);
        this.atoms$.next(atoms);
    }
    removeAtom(atomId) {
        this.atoms$.next(this.atoms$.value.filter((a) => a.id !== atomId));
        this.bonds$.next(this.bonds$.value.filter((b) => b.fromAtomId !== atomId && b.toAtomId !== atomId));
        if (this.selectedAtomId$.value === atomId) {
            this.selectedAtomId$.next(null);
        }
    }
    addBond(fromAtomId, toAtomId) {
        if (fromAtomId === toAtomId)
            return null;
        const exists = this.bonds$.value.find((b) => (b.fromAtomId === fromAtomId && b.toAtomId === toAtomId) ||
            (b.fromAtomId === toAtomId && b.toAtomId === fromAtomId));
        if (exists)
            return null;
        const bond = {
            id: this.generateId(),
            fromAtomId,
            toAtomId,
            type: this.selectedBondType$.value,
        };
        this.bonds$.next([...this.bonds$.value, bond]);
        return bond;
    }
    removeBond(bondId) {
        this.bonds$.next(this.bonds$.value.filter((b) => b.id !== bondId));
    }
    getAtomById(id) {
        return this.atoms$.value.find((a) => a.id === id);
    }
    get currentMode() {
        return this.mode$.value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MoleculeBuilderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MoleculeBuilderService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MoleculeBuilderService, decorators: [{
            type: Injectable
        }] });

class AtomPaletteComponent {
    service;
    elements = [];
    constructor(service) {
        this.service = service;
    }
    selectElement(el) {
        this.service.setSelectedElement(el);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: AtomPaletteComponent, deps: [{ token: MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: AtomPaletteComponent, isStandalone: true, selector: "lib-atom-palette", inputs: { elements: "elements" }, ngImport: i0, template: `
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
  `, isInline: true, styles: [".atom-palette{display:flex;flex-direction:column;gap:6px;padding:8px;background:#f8f9fa;border-right:1px solid #dee2e6;min-width:64px}.palette-label{font-size:11px;font-weight:600;text-transform:uppercase;color:#6c757d;text-align:center}.palette-grid{display:flex;flex-direction:column;gap:4px}.element-btn{width:48px;height:48px;border:2px solid #dee2e6;border-radius:8px;background:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:all .15s ease;color:#212529}.element-btn:hover{border-color:#0d6efd;background:#e7f1ff}.element-btn.active{border-color:#0d6efd;background:#0d6efd;color:#fff}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "pipe", type: i2.AsyncPipe, name: "async" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: AtomPaletteComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-atom-palette', standalone: true, imports: [CommonModule], template: `
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
  `, styles: [".atom-palette{display:flex;flex-direction:column;gap:6px;padding:8px;background:#f8f9fa;border-right:1px solid #dee2e6;min-width:64px}.palette-label{font-size:11px;font-weight:600;text-transform:uppercase;color:#6c757d;text-align:center}.palette-grid{display:flex;flex-direction:column;gap:4px}.element-btn{width:48px;height:48px;border:2px solid #dee2e6;border-radius:8px;background:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:all .15s ease;color:#212529}.element-btn:hover{border-color:#0d6efd;background:#e7f1ff}.element-btn.active{border-color:#0d6efd;background:#0d6efd;color:#fff}\n"] }]
        }], ctorParameters: () => [{ type: MoleculeBuilderService }], propDecorators: { elements: [{
                type: Input
            }] } });

class BondToolbarComponent {
    service;
    tools = [
        { label: 'Select', mode: 'select', icon: '\u25B3' },
        { label: 'Single', mode: 'drawBond', bondType: 'single', icon: '\u2014' },
        { label: 'Double', mode: 'drawBond', bondType: 'double', icon: '\u003D' },
        { label: 'Triple', mode: 'drawBond', bondType: 'triple', icon: '\u2261' },
        { label: 'Erase', mode: 'erase', icon: '\u2421' },
    ];
    currentTool = this.tools[0];
    constructor(service) {
        this.service = service;
    }
    isActive(tool) {
        return this.currentTool === tool;
    }
    selectTool(tool) {
        this.currentTool = tool;
        if (tool.bondType) {
            this.service.setSelectedBondType(tool.bondType);
        }
        else {
            this.service.setMode(tool.mode);
        }
    }
    clearAll() {
        this.service.clear();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: BondToolbarComponent, deps: [{ token: MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: BondToolbarComponent, isStandalone: true, selector: "lib-bond-toolbar", ngImport: i0, template: `
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
  `, isInline: true, styles: [".bond-toolbar{display:flex;gap:4px;padding:8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;align-items:center;flex-wrap:wrap}.tool-btn{display:flex;align-items:center;gap:4px;padding:6px 12px;border:2px solid #dee2e6;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;transition:all .15s ease;color:#212529}.tool-btn:hover{border-color:#0d6efd;background:#e7f1ff}.tool-btn.active{border-color:#0d6efd;background:#0d6efd;color:#fff}.tool-btn.danger:hover{border-color:#dc3545;background:#f8d7da}.tool-icon{font-size:16px;line-height:1}.tool-label{font-weight:500}.toolbar-divider{width:1px;height:28px;background:#dee2e6;margin:0 4px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: BondToolbarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-bond-toolbar', standalone: true, imports: [CommonModule], template: `
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
  `, styles: [".bond-toolbar{display:flex;gap:4px;padding:8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;align-items:center;flex-wrap:wrap}.tool-btn{display:flex;align-items:center;gap:4px;padding:6px 12px;border:2px solid #dee2e6;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;transition:all .15s ease;color:#212529}.tool-btn:hover{border-color:#0d6efd;background:#e7f1ff}.tool-btn.active{border-color:#0d6efd;background:#0d6efd;color:#fff}.tool-btn.danger:hover{border-color:#dc3545;background:#f8d7da}.tool-icon{font-size:16px;line-height:1}.tool-label{font-weight:500}.toolbar-divider{width:1px;height:28px;background:#dee2e6;margin:0 4px}\n"] }]
        }], ctorParameters: () => [{ type: MoleculeBuilderService }] });

const ATOM_RADIUS = 22;
const BOND_OFFSET = 4;
const ELEMENT_COLORS = {
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
function getElementColor(element) {
    return ELEMENT_COLORS[element] ?? '#AAAAAA';
}
function getTextColor(element) {
    const dark = ['C', 'Br', 'I'];
    return dark.includes(element) ? '#FFFFFF' : '#000000';
}
class CanvasComponent {
    service;
    containerRef;
    width = 800;
    height = 600;
    readOnly = false;
    changed = new EventEmitter();
    stage;
    atomLayer;
    bondLayer;
    tempLayer;
    subs = new Subscription();
    bondStartAtomId = null;
    tempLine = null;
    constructor(service) {
        this.service = service;
    }
    ngAfterViewInit() {
        this.initStage();
        this.subscribeToState();
    }
    ngOnChanges(changes) {
        if (changes['width'] || changes['height']) {
            this.stage?.setSize({ width: this.width, height: this.height });
        }
    }
    ngOnDestroy() {
        this.subs.unsubscribe();
        this.stage?.destroy();
    }
    exportImage() {
        return this.stage.toDataURL({ pixelRatio: 2 });
    }
    initStage() {
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
    subscribeToState() {
        this.subs.add(combineLatest([this.service.atoms, this.service.bonds, this.service.selectedAtomId]).subscribe(([atoms, bonds, selectedId]) => {
            this.renderBonds(atoms, bonds);
            this.renderAtoms(atoms, selectedId);
        }));
    }
    bindStageEvents() {
        this.stage.on('click tap', (e) => {
            if (e.target === this.stage) {
                this.handleStageClick(e);
            }
        });
        this.stage.on('mousemove touchmove', (e) => {
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
    handleStageClick(e) {
        const pos = this.stage.getPointerPosition();
        if (!pos)
            return;
        const currentMode = this.service.currentMode;
        if (currentMode === 'placeAtom') {
            this.service.addAtom(pos.x, pos.y);
            this.changed.emit();
        }
        else if (currentMode === 'select') {
            this.service.selectAtom(null);
        }
    }
    renderAtoms(atoms, selectedId) {
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
            const circle = new Konva.Circle({
                radius: ATOM_RADIUS,
                fill: getElementColor(atom.element),
                stroke: '#212529',
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
            if (!this.readOnly) {
                this.bindAtomEvents(group, atom);
            }
            this.atomLayer.add(group);
        }
        this.atomLayer.batchDraw();
    }
    bindAtomEvents(group, atom) {
        group.on('click tap', (e) => {
            e.cancelBubble = true;
            const currentMode = this.service.currentMode;
            if (currentMode === 'erase') {
                this.service.removeAtom(atom.id);
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
                }
                else {
                    this.service.addBond(this.bondStartAtomId, atom.id);
                    this.clearTempBond();
                    this.changed.emit();
                }
                return;
            }
            if (currentMode === 'select') {
                this.service.selectAtom(atom.id);
            }
        });
        group.on('dragmove', () => {
            const pos = group.position();
            this.service.moveAtom(atom.id, pos.x, pos.y);
        });
        group.on('dragend', () => {
            this.changed.emit();
        });
    }
    clearTempBond() {
        this.bondStartAtomId = null;
        this.tempLine?.destroy();
        this.tempLine = null;
        this.tempLayer.batchDraw();
    }
    renderBonds(atoms, bonds) {
        this.bondLayer.destroyChildren();
        const atomMap = new Map(atoms.map((a) => [a.id, a]));
        for (const bond of bonds) {
            const from = atomMap.get(bond.fromAtomId);
            const to = atomMap.get(bond.toAtomId);
            if (!from || !to)
                continue;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const lines = this.getBondLines(from, to, bond.type, nx, ny);
            for (const pts of lines) {
                const line = new Konva.Line({
                    points: pts,
                    stroke: '#212529',
                    strokeWidth: 2,
                    hitStrokeWidth: 10,
                });
                if (!this.readOnly) {
                    line.on('click tap', (e) => {
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
    getBondLines(from, to, type, nx, ny) {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CanvasComponent, deps: [{ token: MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.14", type: CanvasComponent, isStandalone: true, selector: "lib-canvas", inputs: { width: "width", height: "height", readOnly: "readOnly" }, outputs: { changed: "changed" }, viewQueries: [{ propertyName: "containerRef", first: true, predicate: ["container"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: `<div #container class="canvas-container"></div>`, isInline: true, styles: [".canvas-container{flex:1;overflow:hidden;cursor:crosshair}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CanvasComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-canvas', standalone: true, imports: [], template: `<div #container class="canvas-container"></div>`, styles: [".canvas-container{flex:1;overflow:hidden;cursor:crosshair}\n"] }]
        }], ctorParameters: () => [{ type: MoleculeBuilderService }], propDecorators: { containerRef: [{
                type: ViewChild,
                args: ['container', { static: true }]
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], readOnly: [{
                type: Input
            }], changed: [{
                type: Output
            }] } });

class MoleculeBuilderComponent {
    service;
    canvasRef;
    graph = null;
    readOnly = false;
    availableElements = ['C', 'H', 'O', 'N', 'S', 'P', 'Cl', 'Br', 'F', 'I'];
    width = 800;
    height = 600;
    graphChange = new EventEmitter();
    imageExport = new EventEmitter();
    TOOLBAR_HEIGHT = 45;
    PALETTE_WIDTH = 64;
    constructor(service) {
        this.service = service;
    }
    get canvasWidth() {
        return this.readOnly ? this.width : this.width - this.PALETTE_WIDTH;
    }
    get canvasHeight() {
        return this.readOnly ? this.height : this.height - this.TOOLBAR_HEIGHT;
    }
    ngOnChanges(changes) {
        if (changes['graph'] && this.graph) {
            this.service.loadGraph(this.graph);
        }
    }
    onCanvasChanged() {
        this.graphChange.emit(this.service.getGraph());
    }
    exportImage() {
        const dataUrl = this.canvasRef.exportImage();
        this.imageExport.emit(dataUrl);
        return dataUrl;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MoleculeBuilderComponent, deps: [{ token: MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: MoleculeBuilderComponent, isStandalone: true, selector: "molecule-builder", inputs: { graph: "graph", readOnly: "readOnly", availableElements: "availableElements", width: "width", height: "height" }, outputs: { graphChange: "graphChange", imageExport: "imageExport" }, providers: [MoleculeBuilderService], viewQueries: [{ propertyName: "canvasRef", first: true, predicate: ["canvas"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="molecule-builder" [style.width.px]="width" [style.height.px]="height">
      @if (!readOnly) {
        <lib-bond-toolbar />
      }
      <div class="builder-body">
        @if (!readOnly) {
          <lib-atom-palette [elements]="availableElements" />
        }
        <lib-canvas
          #canvas
          [width]="canvasWidth"
          [height]="canvasHeight"
          [readOnly]="readOnly"
          (changed)="onCanvasChanged()" />
      </div>
    </div>
  `, isInline: true, styles: [".molecule-builder{display:flex;flex-direction:column;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;background:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}.builder-body{display:flex;flex:1;overflow:hidden}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "component", type: AtomPaletteComponent, selector: "lib-atom-palette", inputs: ["elements"] }, { kind: "component", type: BondToolbarComponent, selector: "lib-bond-toolbar" }, { kind: "component", type: CanvasComponent, selector: "lib-canvas", inputs: ["width", "height", "readOnly"], outputs: ["changed"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MoleculeBuilderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'molecule-builder', standalone: true, imports: [CommonModule, AtomPaletteComponent, BondToolbarComponent, CanvasComponent], providers: [MoleculeBuilderService], template: `
    <div class="molecule-builder" [style.width.px]="width" [style.height.px]="height">
      @if (!readOnly) {
        <lib-bond-toolbar />
      }
      <div class="builder-body">
        @if (!readOnly) {
          <lib-atom-palette [elements]="availableElements" />
        }
        <lib-canvas
          #canvas
          [width]="canvasWidth"
          [height]="canvasHeight"
          [readOnly]="readOnly"
          (changed)="onCanvasChanged()" />
      </div>
    </div>
  `, styles: [".molecule-builder{display:flex;flex-direction:column;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;background:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}.builder-body{display:flex;flex:1;overflow:hidden}\n"] }]
        }], ctorParameters: () => [{ type: MoleculeBuilderService }], propDecorators: { canvasRef: [{
                type: ViewChild,
                args: ['canvas']
            }], graph: [{
                type: Input
            }], readOnly: [{
                type: Input
            }], availableElements: [{
                type: Input
            }], width: [{
                type: Input
            }], height: [{
                type: Input
            }], graphChange: [{
                type: Output
            }], imageExport: [{
                type: Output
            }] } });

/*
 * Public API Surface of molecule-builder
 */
// Models

/**
 * Generated bundle index. Do not edit.
 */

export { AtomPaletteComponent, BondToolbarComponent, CanvasComponent, MoleculeBuilderComponent, MoleculeBuilderService };
//# sourceMappingURL=molecule-builder.mjs.map
