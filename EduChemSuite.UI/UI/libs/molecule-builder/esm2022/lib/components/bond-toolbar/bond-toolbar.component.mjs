import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "../../molecule-builder.service";
export class BondToolbarComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: BondToolbarComponent, deps: [{ token: i1.MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
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
        }], ctorParameters: () => [{ type: i1.MoleculeBuilderService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9uZC10b29sYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL21vbGVjdWxlLWJ1aWxkZXIvc3JjL2xpYi9jb21wb25lbnRzL2JvbmQtdG9vbGJhci9ib25kLXRvb2xiYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7QUFxRi9DLE1BQU0sT0FBTyxvQkFBb0I7SUFXWDtJQVZwQixLQUFLLEdBQWlCO1FBQ3BCLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDbkQsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1FBQ3pFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUN6RSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDekUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtLQUNsRCxDQUFDO0lBRU0sV0FBVyxHQUFlLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEQsWUFBb0IsT0FBK0I7UUFBL0IsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7SUFBRyxDQUFDO0lBRXZELFFBQVEsQ0FBQyxJQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDO0lBQ25DLENBQUM7SUFFRCxVQUFVLENBQUMsSUFBZ0I7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNILENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDO3dHQTVCVSxvQkFBb0I7NEZBQXBCLG9CQUFvQiw0RUF0RXJCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQlQsd3RCQW5CUyxZQUFZOzs0RkF1RVgsb0JBQW9CO2tCQTFFaEMsU0FBUzsrQkFDRSxrQkFBa0IsY0FDaEIsSUFBSSxXQUNQLENBQUMsWUFBWSxDQUFDLFlBQ2I7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCVCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBCb25kVHlwZSB9IGZyb20gJy4uLy4uL21vZGVscy9ib25kLm1vZGVsJztcclxuaW1wb3J0IHsgTW9sZWN1bGVCdWlsZGVyU2VydmljZSwgSW50ZXJhY3Rpb25Nb2RlIH0gZnJvbSAnLi4vLi4vbW9sZWN1bGUtYnVpbGRlci5zZXJ2aWNlJztcclxuXHJcbmludGVyZmFjZSBUb29sQnV0dG9uIHtcclxuICBsYWJlbDogc3RyaW5nO1xyXG4gIG1vZGU6IEludGVyYWN0aW9uTW9kZTtcclxuICBib25kVHlwZT86IEJvbmRUeXBlO1xyXG4gIGljb246IHN0cmluZztcclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdsaWItYm9uZC10b29sYmFyJyxcclxuICBzdGFuZGFsb25lOiB0cnVlLFxyXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgICA8ZGl2IGNsYXNzPVwiYm9uZC10b29sYmFyXCI+XHJcbiAgICAgIEBmb3IgKHRvb2wgb2YgdG9vbHM7IHRyYWNrIHRvb2wubGFiZWwpIHtcclxuICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICBjbGFzcz1cInRvb2wtYnRuXCJcclxuICAgICAgICAgIFtjbGFzcy5hY3RpdmVdPVwiaXNBY3RpdmUodG9vbClcIlxyXG4gICAgICAgICAgW3RpdGxlXT1cInRvb2wubGFiZWxcIlxyXG4gICAgICAgICAgKGNsaWNrKT1cInNlbGVjdFRvb2wodG9vbClcIj5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidG9vbC1pY29uXCI+e3sgdG9vbC5pY29uIH19PC9zcGFuPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sLWxhYmVsXCI+e3sgdG9vbC5sYWJlbCB9fTwvc3Bhbj5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgfVxyXG4gICAgICA8ZGl2IGNsYXNzPVwidG9vbGJhci1kaXZpZGVyXCI+PC9kaXY+XHJcbiAgICAgIDxidXR0b24gY2xhc3M9XCJ0b29sLWJ0biBkYW5nZXJcIiB0aXRsZT1cIkNsZWFyIEFsbFwiIChjbGljayk9XCJjbGVhckFsbCgpXCI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ0b29sLWljb25cIj4mI3gyNzE2Ozwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cInRvb2wtbGFiZWxcIj5DbGVhcjwvc3Bhbj5cclxuICAgICAgPC9idXR0b24+XHJcbiAgICA8L2Rpdj5cclxuICBgLFxyXG4gIHN0eWxlczogYFxyXG4gICAgLmJvbmQtdG9vbGJhciB7XHJcbiAgICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAgIGdhcDogNHB4O1xyXG4gICAgICBwYWRkaW5nOiA4cHg7XHJcbiAgICAgIGJhY2tncm91bmQ6ICNmOGY5ZmE7XHJcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZGVlMmU2O1xyXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgICBmbGV4LXdyYXA6IHdyYXA7XHJcbiAgICB9XHJcbiAgICAudG9vbC1idG4ge1xyXG4gICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgICBnYXA6IDRweDtcclxuICAgICAgcGFkZGluZzogNnB4IDEycHg7XHJcbiAgICAgIGJvcmRlcjogMnB4IHNvbGlkICNkZWUyZTY7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDZweDtcclxuICAgICAgYmFja2dyb3VuZDogI2ZmZjtcclxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICBmb250LXNpemU6IDEzcHg7XHJcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlO1xyXG4gICAgICBjb2xvcjogIzIxMjUyOTtcclxuICAgIH1cclxuICAgIC50b29sLWJ0bjpob3ZlciB7XHJcbiAgICAgIGJvcmRlci1jb2xvcjogIzBkNmVmZDtcclxuICAgICAgYmFja2dyb3VuZDogI2U3ZjFmZjtcclxuICAgIH1cclxuICAgIC50b29sLWJ0bi5hY3RpdmUge1xyXG4gICAgICBib3JkZXItY29sb3I6ICMwZDZlZmQ7XHJcbiAgICAgIGJhY2tncm91bmQ6ICMwZDZlZmQ7XHJcbiAgICAgIGNvbG9yOiAjZmZmO1xyXG4gICAgfVxyXG4gICAgLnRvb2wtYnRuLmRhbmdlcjpob3ZlciB7XHJcbiAgICAgIGJvcmRlci1jb2xvcjogI2RjMzU0NTtcclxuICAgICAgYmFja2dyb3VuZDogI2Y4ZDdkYTtcclxuICAgIH1cclxuICAgIC50b29sLWljb24ge1xyXG4gICAgICBmb250LXNpemU6IDE2cHg7XHJcbiAgICAgIGxpbmUtaGVpZ2h0OiAxO1xyXG4gICAgfVxyXG4gICAgLnRvb2wtbGFiZWwge1xyXG4gICAgICBmb250LXdlaWdodDogNTAwO1xyXG4gICAgfVxyXG4gICAgLnRvb2xiYXItZGl2aWRlciB7XHJcbiAgICAgIHdpZHRoOiAxcHg7XHJcbiAgICAgIGhlaWdodDogMjhweDtcclxuICAgICAgYmFja2dyb3VuZDogI2RlZTJlNjtcclxuICAgICAgbWFyZ2luOiAwIDRweDtcclxuICAgIH1cclxuICBgXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBCb25kVG9vbGJhckNvbXBvbmVudCB7XHJcbiAgdG9vbHM6IFRvb2xCdXR0b25bXSA9IFtcclxuICAgIHsgbGFiZWw6ICdTZWxlY3QnLCBtb2RlOiAnc2VsZWN0JywgaWNvbjogJ1xcdTI1QjMnIH0sXHJcbiAgICB7IGxhYmVsOiAnU2luZ2xlJywgbW9kZTogJ2RyYXdCb25kJywgYm9uZFR5cGU6ICdzaW5nbGUnLCBpY29uOiAnXFx1MjAxNCcgfSxcclxuICAgIHsgbGFiZWw6ICdEb3VibGUnLCBtb2RlOiAnZHJhd0JvbmQnLCBib25kVHlwZTogJ2RvdWJsZScsIGljb246ICdcXHUwMDNEJyB9LFxyXG4gICAgeyBsYWJlbDogJ1RyaXBsZScsIG1vZGU6ICdkcmF3Qm9uZCcsIGJvbmRUeXBlOiAndHJpcGxlJywgaWNvbjogJ1xcdTIyNjEnIH0sXHJcbiAgICB7IGxhYmVsOiAnRXJhc2UnLCBtb2RlOiAnZXJhc2UnLCBpY29uOiAnXFx1MjQyMScgfSxcclxuICBdO1xyXG5cclxuICBwcml2YXRlIGN1cnJlbnRUb29sOiBUb29sQnV0dG9uID0gdGhpcy50b29sc1swXTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzZXJ2aWNlOiBNb2xlY3VsZUJ1aWxkZXJTZXJ2aWNlKSB7fVxyXG5cclxuICBpc0FjdGl2ZSh0b29sOiBUb29sQnV0dG9uKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50VG9vbCA9PT0gdG9vbDtcclxuICB9XHJcblxyXG4gIHNlbGVjdFRvb2wodG9vbDogVG9vbEJ1dHRvbik6IHZvaWQge1xyXG4gICAgdGhpcy5jdXJyZW50VG9vbCA9IHRvb2w7XHJcbiAgICBpZiAodG9vbC5ib25kVHlwZSkge1xyXG4gICAgICB0aGlzLnNlcnZpY2Uuc2V0U2VsZWN0ZWRCb25kVHlwZSh0b29sLmJvbmRUeXBlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2VydmljZS5zZXRNb2RlKHRvb2wubW9kZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGVhckFsbCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc2VydmljZS5jbGVhcigpO1xyXG4gIH1cclxufVxyXG4iXX0=