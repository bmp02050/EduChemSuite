import { MoleculeBuilderService } from '../../molecule-builder.service';
import * as i0 from "@angular/core";
export declare class AtomPaletteComponent {
    service: MoleculeBuilderService;
    elements: string[];
    constructor(service: MoleculeBuilderService);
    selectElement(el: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AtomPaletteComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AtomPaletteComponent, "lib-atom-palette", never, { "elements": { "alias": "elements"; "required": false; }; }, {}, never, never, true, never>;
}
