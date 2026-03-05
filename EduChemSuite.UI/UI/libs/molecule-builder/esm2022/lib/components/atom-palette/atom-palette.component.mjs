import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "../../molecule-builder.service";
import * as i2 from "@angular/common";
export class AtomPaletteComponent {
    service;
    elements = [];
    constructor(service) {
        this.service = service;
    }
    selectElement(el) {
        this.service.setSelectedElement(el);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: AtomPaletteComponent, deps: [{ token: i1.MoleculeBuilderService }], target: i0.ɵɵFactoryTarget.Component });
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
        }], ctorParameters: () => [{ type: i1.MoleculeBuilderService }], propDecorators: { elements: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXRvbS1wYWxldHRlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL21vbGVjdWxlLWJ1aWxkZXIvc3JjL2xpYi9jb21wb25lbnRzL2F0b20tcGFsZXR0ZS9hdG9tLXBhbGV0dGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7OztBQW1FL0MsTUFBTSxPQUFPLG9CQUFvQjtJQUdaO0lBRlYsUUFBUSxHQUFhLEVBQUUsQ0FBQztJQUVqQyxZQUFtQixPQUErQjtRQUEvQixZQUFPLEdBQVAsT0FBTyxDQUF3QjtJQUFHLENBQUM7SUFFdEQsYUFBYSxDQUFDLEVBQVU7UUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0QyxDQUFDO3dHQVBVLG9CQUFvQjs0RkFBcEIsb0JBQW9CLDhHQTVEckI7Ozs7Ozs7Ozs7Ozs7O0dBY1QsdXFCQWZTLFlBQVk7OzRGQTZEWCxvQkFBb0I7a0JBaEVoQyxTQUFTOytCQUNFLGtCQUFrQixjQUNoQixJQUFJLFdBQ1AsQ0FBQyxZQUFZLENBQUMsWUFDYjs7Ozs7Ozs7Ozs7Ozs7R0FjVDsyRkErQ1EsUUFBUTtzQkFBaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgTW9sZWN1bGVCdWlsZGVyU2VydmljZSB9IGZyb20gJy4uLy4uL21vbGVjdWxlLWJ1aWxkZXIuc2VydmljZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2xpYi1hdG9tLXBhbGV0dGUnLFxyXG4gIHN0YW5kYWxvbmU6IHRydWUsXHJcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgdGVtcGxhdGU6IGBcclxuICAgIDxkaXYgY2xhc3M9XCJhdG9tLXBhbGV0dGVcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cInBhbGV0dGUtbGFiZWxcIj5FbGVtZW50czwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwicGFsZXR0ZS1ncmlkXCI+XHJcbiAgICAgICAgQGZvciAoZWwgb2YgZWxlbWVudHM7IHRyYWNrIGVsKSB7XHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIGNsYXNzPVwiZWxlbWVudC1idG5cIlxyXG4gICAgICAgICAgICBbY2xhc3MuYWN0aXZlXT1cIihzZXJ2aWNlLnNlbGVjdGVkRWxlbWVudCB8IGFzeW5jKSA9PT0gZWwgJiYgKHNlcnZpY2UubW9kZSB8IGFzeW5jKSA9PT0gJ3BsYWNlQXRvbSdcIlxyXG4gICAgICAgICAgICAoY2xpY2spPVwic2VsZWN0RWxlbWVudChlbClcIj5cclxuICAgICAgICAgICAge3sgZWwgfX1cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIH1cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICBgLFxyXG4gIHN0eWxlczogYFxyXG4gICAgLmF0b20tcGFsZXR0ZSB7XHJcbiAgICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgICAgIGdhcDogNnB4O1xyXG4gICAgICBwYWRkaW5nOiA4cHg7XHJcbiAgICAgIGJhY2tncm91bmQ6ICNmOGY5ZmE7XHJcbiAgICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNkZWUyZTY7XHJcbiAgICAgIG1pbi13aWR0aDogNjRweDtcclxuICAgIH1cclxuICAgIC5wYWxldHRlLWxhYmVsIHtcclxuICAgICAgZm9udC1zaXplOiAxMXB4O1xyXG4gICAgICBmb250LXdlaWdodDogNjAwO1xyXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xyXG4gICAgICBjb2xvcjogIzZjNzU3ZDtcclxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgfVxyXG4gICAgLnBhbGV0dGUtZ3JpZCB7XHJcbiAgICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgICAgIGdhcDogNHB4O1xyXG4gICAgfVxyXG4gICAgLmVsZW1lbnQtYnRuIHtcclxuICAgICAgd2lkdGg6IDQ4cHg7XHJcbiAgICAgIGhlaWdodDogNDhweDtcclxuICAgICAgYm9yZGVyOiAycHggc29saWQgI2RlZTJlNjtcclxuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xyXG4gICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xyXG4gICAgICBmb250LXNpemU6IDE2cHg7XHJcbiAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2U7XHJcbiAgICAgIGNvbG9yOiAjMjEyNTI5O1xyXG4gICAgfVxyXG4gICAgLmVsZW1lbnQtYnRuOmhvdmVyIHtcclxuICAgICAgYm9yZGVyLWNvbG9yOiAjMGQ2ZWZkO1xyXG4gICAgICBiYWNrZ3JvdW5kOiAjZTdmMWZmO1xyXG4gICAgfVxyXG4gICAgLmVsZW1lbnQtYnRuLmFjdGl2ZSB7XHJcbiAgICAgIGJvcmRlci1jb2xvcjogIzBkNmVmZDtcclxuICAgICAgYmFja2dyb3VuZDogIzBkNmVmZDtcclxuICAgICAgY29sb3I6ICNmZmY7XHJcbiAgICB9XHJcbiAgYFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQXRvbVBhbGV0dGVDb21wb25lbnQge1xyXG4gIEBJbnB1dCgpIGVsZW1lbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VydmljZTogTW9sZWN1bGVCdWlsZGVyU2VydmljZSkge31cclxuXHJcbiAgc2VsZWN0RWxlbWVudChlbDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnNlcnZpY2Uuc2V0U2VsZWN0ZWRFbGVtZW50KGVsKTtcclxuICB9XHJcbn1cclxuIl19