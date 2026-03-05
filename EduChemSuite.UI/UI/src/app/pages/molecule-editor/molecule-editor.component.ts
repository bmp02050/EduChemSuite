import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {MoleculeBuilderComponent, MoleculeGraph} from 'molecule-builder';
import {ApiService} from '../../_services/api.service';
import {StorageService} from '../../_services/storage.service';
import {MolecularStructureModel} from '../../_models/MolecularStructureModel';

@Component({
    selector: 'app-molecule-editor',
    imports: [
        CommonModule,
        FormsModule,
        NzCardModule,
        NzButtonModule,
        NzInputModule,
        NzTableModule,
        NzSpinModule,
        NzPopconfirmModule,
        NzAlertModule,
        MoleculeBuilderComponent,
    ],
    templateUrl: './molecule-editor.component.html',
    styleUrl: './molecule-editor.component.css'
})
export class MoleculeEditorComponent implements OnInit {
  @ViewChild(MoleculeBuilderComponent) moleculeBuilder?: MoleculeBuilderComponent;

  graph: MoleculeGraph | null = null;
  structureName = '';
  editingId: string | null = null;
  structures: MolecularStructureModel[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.loadStructures();
  }

  onGraphChange(graph: MoleculeGraph): void {
    this.graph = graph;
  }

  loadStructures(): void {
    this.loading = true;
    this.api.listMolecularStructures().subscribe({
      next: (data) => {
        this.structures = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load structures.';
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.graph || !this.structureName.trim()) return;

    this.saving = true;
    this.error = null;
    this.success = null;

    const model = new MolecularStructureModel();
    model.name = this.structureName.trim();
    model.graphData = JSON.stringify(this.graph);
    model.imageData = this.moleculeBuilder?.exportImage() ?? undefined;
    model.userId = this.storage.getUser()?.id;

    if (this.editingId) {
      this.api.updateMolecularStructure(this.editingId, model).subscribe({
        next: () => {
          this.success = 'Structure updated successfully.';
          this.saving = false;
          this.cancelEdit();
          this.loadStructures();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to update structure.';
          this.saving = false;
        }
      });
    } else {
      this.api.createMolecularStructure(model).subscribe({
        next: () => {
          this.success = 'Structure saved successfully.';
          this.saving = false;
          this.clear();
          this.loadStructures();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to save structure.';
          this.saving = false;
        }
      });
    }
  }

  loadStructure(s: MolecularStructureModel): void {
    this.editingId = s.id ?? null;
    this.structureName = s.name ?? '';
    try {
      this.graph = s.graphData ? JSON.parse(s.graphData) : null;
    } catch {
      this.graph = null;
    }
    this.error = null;
    this.success = null;
  }

  deleteStructure(id: string): void {
    this.api.deleteMolecularStructure(id).subscribe({
      next: () => {
        this.success = 'Structure deleted.';
        if (this.editingId === id) this.cancelEdit();
        this.loadStructures();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to delete structure.';
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.structureName = '';
    this.graph = null;
    this.error = null;
    this.success = null;
  }

  clear(): void {
    this.graph = null;
    this.structureName = '';
    this.editingId = null;
  }
}
