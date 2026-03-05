import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ViewChild,
} from '@angular/core';
import { AtomicStructureGraph } from './models/atomic-structure.model';
import { AtomBuilderService } from './atom-builder.service';
import { AtomCanvasComponent } from './components/canvas/canvas.component';
import { ElementPickerComponent } from './components/element-picker/element-picker.component';
import { NucleusEditorComponent } from './components/nucleus-editor/nucleus-editor.component';
import { ShellEditorComponent } from './components/shell-editor/shell-editor.component';

@Component({
  selector: 'atom-builder',
  standalone: true,
  imports: [AtomCanvasComponent, ElementPickerComponent, NucleusEditorComponent, ShellEditorComponent],
  providers: [AtomBuilderService],
  template: `
    <div class="atom-builder" [style.width.px]="width" [style.height.px]="height">
      @if (!readOnly) {
        <div class="toolbar">
          <lib-nucleus-editor />
        </div>
      }
      <div class="builder-body">
        <lib-atom-canvas
          #canvas
          [width]="canvasWidth"
          [height]="canvasHeight"
          [readOnly]="readOnly"
          [hideElement]="hideElement"
          (shellClicked)="onShellClicked($event)" />
        @if (!readOnly) {
          <div class="shell-panel">
            <lib-shell-editor />
          </div>
        }
      </div>
      @if (!readOnly && !hideElement) {
        <div class="picker-footer">
          <lib-element-picker (picked)="onElementPicked($event)" />
        </div>
      }
    </div>
  `,
  styles: `
    .atom-builder {
      display: flex; flex-direction: column;
      border: 1px solid var(--tool-border); border-radius: 8px;
      overflow: hidden; background: var(--tool-bg);
    }
    .toolbar {
      display: flex; gap: 16px; padding: 8px 12px;
      border-bottom: 1px solid var(--tool-border-light); background: var(--tool-bg-secondary);
      flex-wrap: wrap;
    }
    .builder-body { display: flex; flex: 1; overflow: hidden; }
    .shell-panel {
      width: 140px; border-left: 1px solid var(--tool-border-light);
      overflow-y: auto; background: var(--tool-bg-secondary);
    }
    .picker-footer {
      border-top: 1px solid var(--tool-border-light);
      background: var(--tool-bg-secondary);
    }
  `,
})
export class AtomBuilderComponent implements OnChanges {
  @ViewChild('canvas') canvasRef!: AtomCanvasComponent;
  @Input() graph: AtomicStructureGraph | null = null;
  @Input() readOnly = false;
  @Input() hideElement = false;
  @Input() width = 600;
  @Input() height = 500;
  @Output() graphChange = new EventEmitter<AtomicStructureGraph>();

  private readonly TOOLBAR_HEIGHT = 50;
  private readonly SHELL_PANEL_WIDTH = 140;
  private readonly PICKER_HEIGHT = 80;

  constructor(private service: AtomBuilderService) {
    this.service.graph.subscribe(g => this.graphChange.emit(g));
  }

  get canvasWidth(): number { return this.readOnly ? this.width : this.width - this.SHELL_PANEL_WIDTH; }
  get canvasHeight(): number {
    if (this.readOnly) return this.height;
    const pickerH = this.hideElement ? 0 : this.PICKER_HEIGHT;
    return this.height - this.TOOLBAR_HEIGHT - pickerH;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph']) {
      this.graph ? this.service.loadGraph(this.graph) : this.service.clear();
    }
  }

  onElementPicked(symbol: string): void {
    this.service.selectElement(symbol);
  }

  onShellClicked(shellIndex: number): void {
    this.service.addElectronToShell(shellIndex);
  }

  exportImage(): string {
    return this.canvasRef.exportImage();
  }
}
