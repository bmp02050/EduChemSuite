import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {isDiagramQuestion, isAtomicStructureQuestion, isChemicalEquationQuestion, isElectronConfigQuestion, isLewisStructureQuestion, isPeriodicTableQuestion, isStoichiometryQuestion, isInteractiveToolQuestion} from "../../../_helpers";
import {QuestionModel} from "../../../_models/QuestionModel";
import {QuestionTypeModel} from "../../../_models/QuestionTypeModel";
import {TagModel} from "../../../_models/TagModel";
import {AnswerModel} from "../../../_models/AnswerModel";
import {QuestionTagModel} from "../../../_models/QuestionTagModel";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {AlertComponent} from "../../../_components";
import {first} from "rxjs";
import {MoleculeBuilderComponent, MoleculeGraph} from 'molecule-builder';
import {AtomBuilderComponent, AtomicStructureGraph} from 'atom-builder';
import {EquationBalancerComponent, ChemicalEquation} from 'equation-balancer';
import {ElectronConfigComponent, ElectronConfiguration} from 'electron-config';
import {PeriodicTableQuizComponent, PeriodicTableQuiz} from 'periodic-table-quiz';
import {StoichiometryStepperComponent, StoichiometryProblem} from 'stoichiometry-stepper';
import {MolecularStructureModel} from "../../../_models/MolecularStructureModel";

@Component({
    selector: 'app-edit-question',
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
    NzSpinModule,
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule,
    AlertComponent,
    MoleculeBuilderComponent,
    AtomBuilderComponent,
    EquationBalancerComponent,
    ElectronConfigComponent,
    PeriodicTableQuizComponent,
    StoichiometryStepperComponent,
],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.css'
})
export class EditQuestionComponent implements OnInit {
  questionForm!: FormGroup;
  question: QuestionModel | null = null;
  questionId!: string;
  loading = true;
  questionTypes: QuestionTypeModel[] = [];
  tags: TagModel[] = [];
  answers: AnswerModel[] = [];
  questionTags: QuestionTagModel[] = [];
  newAnswerText = '';
  newAnswerIsCorrect = false;
  selectedTagId: string | null = null;
  suggestedAnswers: AnswerModel[] = [];
  moleculeGraph: MoleculeGraph | null = null;
  atomGraph: AtomicStructureGraph | null = null;
  equationGraph: ChemicalEquation | null = null;
  electronConfigGraph: ElectronConfiguration | null = null;
  periodicTableGraph: PeriodicTableQuiz | null = null;
  stoichiometryGraph: StoichiometryProblem | null = null;
  savingStructure = false;
  savedStructures: MolecularStructureModel[] = [];
  selectedStructureId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.questionId = this.route.snapshot.paramMap.get('id')!;
    this.questionForm = this.fb.group({
      questionText: ['', Validators.required],
      questionTypeId: ['', Validators.required],
    });

    this.loadQuestion();
    this.apiService.listQuestionTypes().subscribe({
      next: (types) => this.questionTypes = types,
    });
    this.apiService.listTags().subscribe({
      next: (tags) => this.tags = tags,
    });
  }

  loadQuestion(): void {
    this.apiService.getQuestion(this.questionId).subscribe({
      next: (question) => {
        this.question = question;
        this.answers = question.answers || [];
        this.questionTags = question.questionTags || [];
        this.loadSuggestedAnswers();
        this.questionForm.patchValue({
          questionText: question.questionText,
          questionTypeId: question.questionTypeId,
        });
        // Load molecule graph from correct answer if chemical structure type
        if (this.isChemicalStructure()) {
          const correctAnswer = this.answers.find(a => a.isCorrect);
          if (correctAnswer?.answerText) {
            try {
              this.moleculeGraph = JSON.parse(correctAnswer.answerText);
            } catch { /* not valid JSON, ignore */ }
          }
          this.apiService.listMolecularStructures().subscribe({
            next: (structures) => this.savedStructures = structures,
          });
        }
        // Load molecule graph from correct answer if Lewis structure type
        if (this.isLewisStructure()) {
          const correctAnswer = this.answers.find(a => a.isCorrect);
          if (correctAnswer?.answerText) {
            try {
              this.moleculeGraph = JSON.parse(correctAnswer.answerText);
            } catch { /* not valid JSON, ignore */ }
          }
        }
        // Load atom graph from correct answer if atomic structure type
        if (this.isAtomicStructure()) {
          const correctAnswer = this.answers.find(a => a.isCorrect);
          if (correctAnswer?.answerText) {
            try {
              this.atomGraph = JSON.parse(correctAnswer.answerText);
            } catch { /* not valid JSON, ignore */ }
          }
        }
        // Load graphs for other tool types
        if (this.isChemicalEquation() || this.isElectronConfig() || this.isPeriodicTable() || this.isStoichiometry()) {
          const correctAnswer = this.answers.find(a => a.isCorrect);
          if (correctAnswer?.answerText) {
            try {
              const parsed = JSON.parse(correctAnswer.answerText);
              if (this.isChemicalEquation()) this.equationGraph = parsed;
              else if (this.isElectronConfig()) this.electronConfigGraph = parsed;
              else if (this.isPeriodicTable()) this.periodicTableGraph = parsed;
              else if (this.isStoichiometry()) this.stoichiometryGraph = parsed;
            } catch { /* not valid JSON, ignore */ }
          }
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get availableTags(): TagModel[] {
    const assignedTagIds = new Set(this.questionTags.map(qt => qt.tagId));
    return this.tags.filter(t => !assignedTagIds.has(t.id));
  }

  get questionTypeOptions() {
    return this.questionTypes.map(qt => ({label: qt.description || '', value: qt.id}));
  }

  get tagOptionsList() {
    return this.availableTags.map(t => ({label: t.tagText || '', value: t.id}));
  }

  get structureOptions() {
    return this.savedStructures.map(s => ({label: s.name || 'Unnamed', value: s.id}));
  }

  loadSuggestedAnswers(): void {
    this.apiService.getSuggestedAnswers(this.questionId).subscribe({
      next: (answers) => this.suggestedAnswers = answers,
      error: () => this.suggestedAnswers = [],
    });
  }

  copyAnswer(answer: AnswerModel): void {
    this.apiService.createAnswer(this.questionId, {
      answerText: answer.answerText,
      isCorrect: answer.isCorrect,
      questionId: this.questionId,
    } as AnswerModel).pipe(first()).subscribe({
      next: (newAnswer) => {
        this.answers = [...this.answers, newAnswer];
        this.alertService.success('Answer copied');
      },
      error: () => this.alertService.error('Failed to copy answer')
    });
  }

  addTag() {
    if (!this.selectedTagId) return;
    this.apiService.addTagToQuestion(this.questionId, {
      questionId: this.questionId,
      tagId: this.selectedTagId,
    } as QuestionTagModel).pipe(first()).subscribe({
      next: (qt) => {
        this.questionTags = [...this.questionTags, qt];
        this.selectedTagId = null;
        this.loadSuggestedAnswers();
        this.alertService.success('Tag added');
      },
      error: () => this.alertService.error('Failed to add tag')
    });
  }

  removeTag(questionTagId: string) {
    this.apiService.removeTagFromQuestion(this.questionId, questionTagId).subscribe({
      next: () => {
        this.questionTags = this.questionTags.filter(qt => qt.id !== questionTagId);
        this.loadSuggestedAnswers();
        this.alertService.success('Tag removed');
      },
      error: () => this.alertService.error('Failed to remove tag')
    });
  }

  addAnswer() {
    if (!this.newAnswerText.trim()) return;
    this.apiService.createAnswer(this.questionId, {
      answerText: this.newAnswerText,
      isCorrect: this.newAnswerIsCorrect,
      questionId: this.questionId,
    } as AnswerModel).pipe(first()).subscribe({
      next: (answer) => {
        this.answers = [...this.answers, answer];
        this.newAnswerText = '';
        this.newAnswerIsCorrect = false;
        this.alertService.success('Answer added');
      },
      error: () => this.alertService.error('Failed to add answer')
    });
  }

  deleteAnswer(answerId: string) {
    this.apiService.deleteAnswer(this.questionId, answerId).subscribe({
      next: () => {
        this.answers = this.answers.filter(a => a.id !== answerId);
        this.alertService.success('Answer removed');
      },
      error: () => this.alertService.error('Failed to remove answer')
    });
  }

  loadFromLibrary(): void {
    if (!this.selectedStructureId) return;
    const structure = this.savedStructures.find(s => s.id === this.selectedStructureId);
    if (structure?.graphData) {
      try {
        this.moleculeGraph = JSON.parse(structure.graphData);
      } catch { /* invalid JSON, ignore */ }
    }
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
    this.moleculeGraph = graph;
  }

  onAtomGraphChange(graph: AtomicStructureGraph): void {
    this.atomGraph = graph;
  }

  onEquationGraphChange(graph: ChemicalEquation): void {
    this.equationGraph = graph;
  }

  onElectronConfigGraphChange(graph: ElectronConfiguration): void {
    this.electronConfigGraph = graph;
  }

  onPeriodicTableGraphChange(graph: PeriodicTableQuiz): void {
    this.periodicTableGraph = graph;
  }

  onStoichiometryGraphChange(graph: StoichiometryProblem): void {
    this.stoichiometryGraph = graph;
  }

  saveGraph(): void {
    const graphJson = this.isChemicalStructure() && this.moleculeGraph
      ? JSON.stringify(this.moleculeGraph)
      : this.isLewisStructure() && this.moleculeGraph
      ? JSON.stringify(this.moleculeGraph)
      : this.isAtomicStructure() && this.atomGraph
      ? JSON.stringify(this.atomGraph)
      : this.isChemicalEquation() && this.equationGraph
      ? JSON.stringify(this.equationGraph)
      : this.isElectronConfig() && this.electronConfigGraph
      ? JSON.stringify(this.electronConfigGraph)
      : this.isPeriodicTable() && this.periodicTableGraph
      ? JSON.stringify(this.periodicTableGraph)
      : this.isStoichiometry() && this.stoichiometryGraph
      ? JSON.stringify(this.stoichiometryGraph)
      : null;

    if (!graphJson) return;
    this.savingStructure = true;
    const existingCorrect = this.answers.find(a => a.isCorrect);

    if (existingCorrect) {
      this.apiService.updateAnswer(this.questionId, existingCorrect.id!, {
        ...existingCorrect,
        answerText: graphJson,
      } as AnswerModel).pipe(first()).subscribe({
        next: (updated) => {
          this.answers = this.answers.map(a => a.id === updated.id ? updated : a);
          this.savingStructure = false;
          this.alertService.success('Structure saved');
        },
        error: () => {
          this.savingStructure = false;
          this.alertService.error('Failed to save structure');
        }
      });
    } else {
      this.apiService.createAnswer(this.questionId, {
        answerText: graphJson,
        isCorrect: true,
        questionId: this.questionId,
      } as AnswerModel).pipe(first()).subscribe({
        next: (answer) => {
          this.answers = [...this.answers, answer];
          this.savingStructure = false;
          this.alertService.success('Structure saved');
        },
        error: () => {
          this.savingStructure = false;
          this.alertService.error('Failed to save structure');
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.questionForm.valid || !this.question) return;

    const updated: QuestionModel = {
      id: this.question.id,
      isActive: this.question.isActive,
      userId: this.question.userId,
      questionText: this.questionForm.value.questionText,
      questionTypeId: this.questionForm.value.questionTypeId,
      version: this.question.version,
    } as QuestionModel;

    this.apiService.updateQuestion(this.questionId, updated)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Question updated successfully');
        },
        error: (err) => {
          this.alertService.error(err.error?.message || err.message || 'Failed to update question');
        }
      });
  }
}
