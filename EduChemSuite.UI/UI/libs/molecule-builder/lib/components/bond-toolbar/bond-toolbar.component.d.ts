import { BondType } from '../../models/bond.model';
import { MoleculeBuilderService, InteractionMode } from '../../molecule-builder.service';
import * as i0 from "@angular/core";
interface ToolButton {
    label: string;
    mode: InteractionMode;
    bondType?: BondType;
    icon: string;
}
export declare class BondToolbarComponent {
    private service;
    tools: ToolButton[];
    private currentTool;
    constructor(service: MoleculeBuilderService);
    isActive(tool: ToolButton): boolean;
    selectTool(tool: ToolButton): void;
    clearAll(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BondToolbarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BondToolbarComponent, "lib-bond-toolbar", never, {}, {}, never, never, true, never>;
}
export {};
