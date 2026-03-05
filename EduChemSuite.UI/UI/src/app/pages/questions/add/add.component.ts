import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {isDiagramQuestion, isAtomicStructureQuestion, isChemicalEquationQuestion, isElectronConfigQuestion, isLewisStructureQuestion, isPeriodicTableQuestion, isStoichiometryQuestion, isInteractiveToolQuestion} from "../../../_helpers";
import {StorageService} from "../../../_services/storage.service";
import {QuestionTypeModel} from "../../../_models/QuestionTypeModel";
import {TagModel} from "../../../_models/TagModel";
import {AnswerModel} from "../../../_models/AnswerModel";
import {QuestionModel} from "../../../_models/QuestionModel";
import {QuestionTagModel} from "../../../_models/QuestionTagModel";
import {MolecularStructureModel} from "../../../_models/MolecularStructureModel";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {FormsModule} from "@angular/forms";
import {first} from "rxjs";
import {MoleculeBuilderComponent, MoleculeGraph} from 'molecule-builder';
import {AtomBuilderComponent, AtomicStructureGraph} from 'atom-builder';
import {EquationBalancerComponent, ChemicalEquation} from 'equation-balancer';
import {ElectronConfigComponent, ElectronConfiguration} from 'electron-config';
import {PeriodicTableQuizComponent, PeriodicTableQuiz} from 'periodic-table-quiz';
import {StoichiometryStepperComponent, StoichiometryProblem} from 'stoichiometry-stepper';

@Component({
    selector: 'app-add-question',
    imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzTableModule,
    NzCheckboxModule,
    NzCardModule,
    NzDividerModule,
    MoleculeBuilderComponent,
    AtomBuilderComponent,
    EquationBalancerComponent,
    ElectronConfigComponent,
    PeriodicTableQuizComponent,
    StoichiometryStepperComponent,
],
    templateUrl: './add.component.html',
    styleUrl: './add.component.css'
})
export class AddQuestionComponent implements OnInit {
  questionForm!: FormGroup;
  questionTypes: QuestionTypeModel[] = [];
  tags: TagModel[] = [];
  pendingAnswers: {answerText: string; isCorrect: boolean}[] = [];
  newAnswerText = '';
  newAnswerIsCorrect = false;
  pendingMoleculeGraph: MoleculeGraph | null = null;
  pendingAtomGraph: AtomicStructureGraph | null = null;
  pendingEquationGraph: ChemicalEquation | null = null;
  pendingElectronConfigGraph: ElectronConfiguration | null = null;
  pendingPeriodicTableGraph: PeriodicTableQuiz | null = null;
  pendingStoichiometryGraph: StoichiometryProblem | null = null;
  savedStructures: MolecularStructureModel[] = [];
  selectedStructureId: string | null = null;

  get questionTypeOptions() {
    return this.questionTypes.map(qt => ({label: qt.description || '', value: qt.id}));
  }

  get tagOptions() {
    return this.tags.map(t => ({label: t.tagText || '', value: t.id}));
  }

  get structureOptions() {
    return this.savedStructures.map(s => ({label: s.name || 'Unnamed', value: s.id}));
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.questionForm = this.fb.group({
      questionText: ['', Validators.required],
      questionTypeId: ['', Validators.required],
      tagIds: [[]],
    });

    this.apiService.listQuestionTypes().subscribe({
      next: (types) => this.questionTypes = types,
    });
    this.apiService.listTags().subscribe({
      next: (tags) => this.tags = tags,
    });
    this.apiService.listMolecularStructures().subscribe({
      next: (structures) => this.savedStructures = structures,
    });
  }

  loadFromLibrary(): void {
    if (!this.selectedStructureId) return;
    const structure = this.savedStructures.find(s => s.id === this.selectedStructureId);
    if (structure?.graphData) {
      try {
        this.pendingMoleculeGraph = JSON.parse(structure.graphData);
      } catch { /* invalid JSON, ignore */ }
    }
  }

  addAnswer() {
    if (!this.newAnswerText.trim()) return;
    this.pendingAnswers.push({answerText: this.newAnswerText, isCorrect: this.newAnswerIsCorrect});
    this.newAnswerText = '';
    this.newAnswerIsCorrect = false;
  }

  removeAnswer(index: number) {
    this.pendingAnswers.splice(index, 1);
  }

  isChemicalStructure(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isDiagramQuestion(type?.description);
  }

  isAtomicStructure(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isAtomicStructureQuestion(type?.description);
  }

  isChemicalEquation(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isChemicalEquationQuestion(type?.description);
  }

  isElectronConfig(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isElectronConfigQuestion(type?.description);
  }

  isPeriodicTable(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isPeriodicTableQuestion(type?.description);
  }

  isLewisStructure(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isLewisStructureQuestion(type?.description);
  }

  isStoichiometry(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isStoichiometryQuestion(type?.description);
  }

  isToolQuestion(): boolean {
    const typeId = this.questionForm.get('questionTypeId')?.value;
    if (!typeId) return false;
    const type = this.questionTypes.find(t => t.id === typeId);
    return isInteractiveToolQuestion(type?.description);
  }

  onMoleculeGraphChange(graph: MoleculeGraph): void {
    this.pendingMoleculeGraph = graph;
  }

  onAtomGraphChange(graph: AtomicStructureGraph): void {
    this.pendingAtomGraph = graph;
  }

  onEquationGraphChange(graph: ChemicalEquation): void {
    this.pendingEquationGraph = graph;
  }

  onElectronConfigGraphChange(graph: ElectronConfiguration): void {
    this.pendingElectronConfigGraph = graph;
  }

  onPeriodicTableGraphChange(graph: PeriodicTableQuiz): void {
    this.pendingPeriodicTableGraph = graph;
  }

  onStoichiometryGraphChange(graph: StoichiometryProblem): void {
    this.pendingStoichiometryGraph = graph;
  }

  onSubmit(): void {
    if (!this.questionForm.valid) return;

    const user = this.storageService.getUser();
    const formValue = this.questionForm.value;

    const question: QuestionModel = {
      questionText: formValue.questionText,
      questionTypeId: formValue.questionTypeId,
      userId: user.id,
    } as QuestionModel;

    this.apiService.createQuestion(question)
      .pipe(first())
      .subscribe({
        next: (created) => {
          let answerPromises: Promise<any>[] = [];

          const toolGraph = this.isChemicalStructure() ? this.pendingMoleculeGraph
            : this.isLewisStructure() ? this.pendingMoleculeGraph
            : this.isAtomicStructure() ? this.pendingAtomGraph
            : this.isChemicalEquation() ? this.pendingEquationGraph
            : this.isElectronConfig() ? this.pendingElectronConfigGraph
            : this.isPeriodicTable() ? this.pendingPeriodicTableGraph
            : this.isStoichiometry() ? this.pendingStoichiometryGraph
            : null;

          if (toolGraph) {
            answerPromises = [this.apiService.createAnswer(created.id!, {
              answerText: JSON.stringify(toolGraph),
              isCorrect: true,
              questionId: created.id,
            } as AnswerModel).pipe(first()).toPromise()];
          } else if (!this.isToolQuestion()) {
            answerPromises = this.pendingAnswers.map(a =>
              this.apiService.createAnswer(created.id!, {
                answerText: a.answerText,
                isCorrect: a.isCorrect,
                questionId: created.id,
              } as AnswerModel).pipe(first()).toPromise()
            );
          }

          const tagPromises = (formValue.tagIds || []).map((tagId: string) =>
            this.apiService.addTagToQuestion(created.id!, {
              questionId: created.id,
              tagId: tagId,
            } as QuestionTagModel).pipe(first()).toPromise()
          );

          const allPromises = [...answerPromises, ...tagPromises];

          if (allPromises.length > 0) {
            Promise.all(allPromises).then(() => {
              this.alertService.success('Question created successfully', true);
              this.router.navigate(['/questions']);
            });
          } else {
            this.alertService.success('Question created successfully', true);
            this.router.navigate(['/questions']);
          }
        },
        error: (err) => {
          this.alertService.error(err.error?.message || err.message || 'Failed to create question');
        }
      });
  }
}
