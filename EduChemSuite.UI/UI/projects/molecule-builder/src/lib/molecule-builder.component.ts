import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { MoleculeGraph } from './models/molecule-graph.model';
import { MoleculeBuilderService } from './molecule-builder.service';
import { AtomPaletteComponent } from './components/atom-palette/atom-palette.component';
import { BondToolbarComponent } from './components/bond-toolbar/bond-toolbar.component';
import { CanvasComponent } from './components/canvas/canvas.component';

@Component({
    selector: 'molecule-builder',
    imports: [AtomPaletteComponent, BondToolbarComponent, CanvasComponent],
    providers: [MoleculeBuilderService],
    template: `
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
  `,
    styles: `
    .molecule-builder {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--tool-border);
      border-radius: 8px;
      overflow: hidden;
      background: var(--tool-bg);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .builder-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  `
})
export class MoleculeBuilderComponent implements OnChanges {
  @ViewChild('canvas') canvasRef!: CanvasComponent;

  @Input() graph: MoleculeGraph | null = null;
  @Input() readOnly = false;
  @Input() availableElements: string[] = ['C', 'H', 'O', 'N', 'S', 'P', 'Cl', 'Br', 'F', 'I'];
  @Input() width = 800;
  @Input() height = 600;

  @Output() graphChange = new EventEmitter<MoleculeGraph>();
  @Output() imageExport = new EventEmitter<string>();

  private readonly TOOLBAR_HEIGHT = 45;
  private readonly PALETTE_WIDTH = 64;

  constructor(private service: MoleculeBuilderService) {}

  get canvasWidth(): number {
    return this.readOnly ? this.width : this.width - this.PALETTE_WIDTH;
  }

  get canvasHeight(): number {
    return this.readOnly ? this.height : this.height - this.TOOLBAR_HEIGHT;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph']) {
      if (this.graph) {
        this.service.loadGraph(this.graph);
      } else {
        this.service.clear();
      }
    }
  }

  onCanvasChanged(): void {
    this.graphChange.emit(this.service.getGraph());
  }

  exportImage(): string {
    const dataUrl = this.canvasRef.exportImage();
    this.imageExport.emit(dataUrl);
    return dataUrl;
  }
}
