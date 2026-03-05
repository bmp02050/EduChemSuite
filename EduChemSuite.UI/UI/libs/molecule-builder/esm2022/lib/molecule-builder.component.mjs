import { Component, Input, Output, EventEmitter, ViewChild, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoleculeBuilderService } from './molecule-builder.service';
import { AtomPaletteComponent } from './components/atom-palette/atom-palette.component';
import { BondToolbarComponent } from './components/bond-toolbar/bond-toolbar.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import * as i0 from "@angular/core";
import * as i1 from "./molecule-builder.service";
export class MoleculeBuilderComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MoleculeBuilderComponent, deps: [{ token: i1.MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
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
        }], ctorParameters: () => [{ type: i1.MoleculeBuilderService }], propDecorators: { canvasRef: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9sZWN1bGUtYnVpbGRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9tb2xlY3VsZS1idWlsZGVyL3NyYy9saWIvbW9sZWN1bGUtYnVpbGRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFHWixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRS9DLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQzs7O0FBMEN2RSxNQUFNLE9BQU8sd0JBQXdCO0lBZWY7SUFkQyxTQUFTLENBQW1CO0lBRXhDLEtBQUssR0FBeUIsSUFBSSxDQUFDO0lBQ25DLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDakIsaUJBQWlCLEdBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuRixLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ1osTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUVaLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBaUIsQ0FBQztJQUNoRCxXQUFXLEdBQUcsSUFBSSxZQUFZLEVBQVUsQ0FBQztJQUVsQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFFcEMsWUFBb0IsT0FBK0I7UUFBL0IsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7SUFBRyxDQUFDO0lBRXZELElBQUksV0FBVztRQUNiLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3RFLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxXQUFXO1FBQ1QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO3dHQXZDVSx3QkFBd0I7NEZBQXhCLHdCQUF3QixnUUFwQ3hCLENBQUMsc0JBQXNCLENBQUMsb0pBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCVCxxVUFuQlMsWUFBWSwrQkFBRSxvQkFBb0IsbUZBQUUsb0JBQW9CLDZEQUFFLGVBQWU7OzRGQXFDeEUsd0JBQXdCO2tCQXhDcEMsU0FBUzsrQkFDRSxrQkFBa0IsY0FDaEIsSUFBSSxXQUNQLENBQUMsWUFBWSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsQ0FBQyxhQUN6RSxDQUFDLHNCQUFzQixDQUFDLFlBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCVDsyRkFtQm9CLFNBQVM7c0JBQTdCLFNBQVM7dUJBQUMsUUFBUTtnQkFFVixLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxpQkFBaUI7c0JBQXpCLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFFSSxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENvbXBvbmVudCxcclxuICBJbnB1dCxcclxuICBPdXRwdXQsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIE9uQ2hhbmdlcyxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgTW9sZWN1bGVHcmFwaCB9IGZyb20gJy4vbW9kZWxzL21vbGVjdWxlLWdyYXBoLm1vZGVsJztcclxuaW1wb3J0IHsgTW9sZWN1bGVCdWlsZGVyU2VydmljZSB9IGZyb20gJy4vbW9sZWN1bGUtYnVpbGRlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXRvbVBhbGV0dGVDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvYXRvbS1wYWxldHRlL2F0b20tcGFsZXR0ZS5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBCb25kVG9vbGJhckNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9ib25kLXRvb2xiYXIvYm9uZC10b29sYmFyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IENhbnZhc0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9jYW52YXMvY2FudmFzLmNvbXBvbmVudCc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ21vbGVjdWxlLWJ1aWxkZXInLFxyXG4gIHN0YW5kYWxvbmU6IHRydWUsXHJcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgQXRvbVBhbGV0dGVDb21wb25lbnQsIEJvbmRUb29sYmFyQ29tcG9uZW50LCBDYW52YXNDb21wb25lbnRdLFxyXG4gIHByb3ZpZGVyczogW01vbGVjdWxlQnVpbGRlclNlcnZpY2VdLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgICA8ZGl2IGNsYXNzPVwibW9sZWN1bGUtYnVpbGRlclwiIFtzdHlsZS53aWR0aC5weF09XCJ3aWR0aFwiIFtzdHlsZS5oZWlnaHQucHhdPVwiaGVpZ2h0XCI+XHJcbiAgICAgIEBpZiAoIXJlYWRPbmx5KSB7XHJcbiAgICAgICAgPGxpYi1ib25kLXRvb2xiYXIgLz5cclxuICAgICAgfVxyXG4gICAgICA8ZGl2IGNsYXNzPVwiYnVpbGRlci1ib2R5XCI+XHJcbiAgICAgICAgQGlmICghcmVhZE9ubHkpIHtcclxuICAgICAgICAgIDxsaWItYXRvbS1wYWxldHRlIFtlbGVtZW50c109XCJhdmFpbGFibGVFbGVtZW50c1wiIC8+XHJcbiAgICAgICAgfVxyXG4gICAgICAgIDxsaWItY2FudmFzXHJcbiAgICAgICAgICAjY2FudmFzXHJcbiAgICAgICAgICBbd2lkdGhdPVwiY2FudmFzV2lkdGhcIlxyXG4gICAgICAgICAgW2hlaWdodF09XCJjYW52YXNIZWlnaHRcIlxyXG4gICAgICAgICAgW3JlYWRPbmx5XT1cInJlYWRPbmx5XCJcclxuICAgICAgICAgIChjaGFuZ2VkKT1cIm9uQ2FudmFzQ2hhbmdlZCgpXCIgLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICBgLFxyXG4gIHN0eWxlczogYFxyXG4gICAgLm1vbGVjdWxlLWJ1aWxkZXIge1xyXG4gICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjZGVlMmU2O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiA4cHg7XHJcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICAgIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcclxuICAgIH1cclxuICAgIC5idWlsZGVyLWJvZHkge1xyXG4gICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICBmbGV4OiAxO1xyXG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgfVxyXG4gIGAsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNb2xlY3VsZUJ1aWxkZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xyXG4gIEBWaWV3Q2hpbGQoJ2NhbnZhcycpIGNhbnZhc1JlZiE6IENhbnZhc0NvbXBvbmVudDtcclxuXHJcbiAgQElucHV0KCkgZ3JhcGg6IE1vbGVjdWxlR3JhcGggfCBudWxsID0gbnVsbDtcclxuICBASW5wdXQoKSByZWFkT25seSA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIGF2YWlsYWJsZUVsZW1lbnRzOiBzdHJpbmdbXSA9IFsnQycsICdIJywgJ08nLCAnTicsICdTJywgJ1AnLCAnQ2wnLCAnQnInLCAnRicsICdJJ107XHJcbiAgQElucHV0KCkgd2lkdGggPSA4MDA7XHJcbiAgQElucHV0KCkgaGVpZ2h0ID0gNjAwO1xyXG5cclxuICBAT3V0cHV0KCkgZ3JhcGhDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPE1vbGVjdWxlR3JhcGg+KCk7XHJcbiAgQE91dHB1dCgpIGltYWdlRXhwb3J0ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgVE9PTEJBUl9IRUlHSFQgPSA0NTtcclxuICBwcml2YXRlIHJlYWRvbmx5IFBBTEVUVEVfV0lEVEggPSA2NDtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzZXJ2aWNlOiBNb2xlY3VsZUJ1aWxkZXJTZXJ2aWNlKSB7fVxyXG5cclxuICBnZXQgY2FudmFzV2lkdGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnJlYWRPbmx5ID8gdGhpcy53aWR0aCA6IHRoaXMud2lkdGggLSB0aGlzLlBBTEVUVEVfV0lEVEg7XHJcbiAgfVxyXG5cclxuICBnZXQgY2FudmFzSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWFkT25seSA/IHRoaXMuaGVpZ2h0IDogdGhpcy5oZWlnaHQgLSB0aGlzLlRPT0xCQVJfSEVJR0hUO1xyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG4gICAgaWYgKGNoYW5nZXNbJ2dyYXBoJ10gJiYgdGhpcy5ncmFwaCkge1xyXG4gICAgICB0aGlzLnNlcnZpY2UubG9hZEdyYXBoKHRoaXMuZ3JhcGgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25DYW52YXNDaGFuZ2VkKCk6IHZvaWQge1xyXG4gICAgdGhpcy5ncmFwaENoYW5nZS5lbWl0KHRoaXMuc2VydmljZS5nZXRHcmFwaCgpKTtcclxuICB9XHJcblxyXG4gIGV4cG9ydEltYWdlKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBkYXRhVXJsID0gdGhpcy5jYW52YXNSZWYuZXhwb3J0SW1hZ2UoKTtcclxuICAgIHRoaXMuaW1hZ2VFeHBvcnQuZW1pdChkYXRhVXJsKTtcclxuICAgIHJldHVybiBkYXRhVXJsO1xyXG4gIH1cclxufVxyXG4iXX0=