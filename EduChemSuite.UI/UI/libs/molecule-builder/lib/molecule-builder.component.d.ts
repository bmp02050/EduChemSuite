import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MoleculeGraph } from './models/molecule-graph.model';
import { MoleculeBuilderService } from './molecule-builder.service';
import { CanvasComponent } from './components/canvas/canvas.component';
import * as i0 from "@angular/core";
export declare class MoleculeBuilderComponent implements OnChanges {
    private service;
    canvasRef: CanvasComponent;
    graph: MoleculeGraph | null;
    readOnly: boolean;
    availableElements: string[];
    width: number;
    height: number;
    graphChange: EventEmitter<MoleculeGraph>;
    imageExport: EventEmitter<string>;
    private readonly TOOLBAR_HEIGHT;
    private readonly PALETTE_WIDTH;
    constructor(service: MoleculeBuilderService);
    get canvasWidth(): number;
    get canvasHeight(): number;
    ngOnChanges(changes: SimpleChanges): void;
    onCanvasChanged(): void;
    exportImage(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MoleculeBuilderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MoleculeBuilderComponent, "molecule-builder", never, { "graph": { "alias": "graph"; "required": false; }; "readOnly": { "alias": "readOnly"; "required": false; }; "availableElements": { "alias": "availableElements"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; }, { "graphChange": "graphChange"; "imageExport": "imageExport"; }, never, never, true, never>;
}
