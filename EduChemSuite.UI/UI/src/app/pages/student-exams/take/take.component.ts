import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService, ApiService} from '../../../_services';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {AlertComponent} from '../../../_components';
import {isDiagramQuestion, isAtomicStructureQuestion, isChemicalEquationQuestion, isElectronConfigQuestion, isLewisStructureQuestion, isPeriodicTableQuestion, isStoichiometryQuestion} from '../../../_helpers';
import {MoleculeBuilderComponent, MoleculeGraph} from 'molecule-builder';
import {AtomBuilderComponent, AtomicStructureGraph} from 'atom-builder';
import {EquationBalancerComponent, ChemicalEquation} from 'equation-balancer';
import {ElectronConfigComponent, ElectronConfiguration} from 'electron-config';
import {PeriodicTableQuizComponent, PeriodicTableQuiz, PeriodicTableResponse} from 'periodic-table-quiz';
import {StoichiometryStepperComponent, StoichiometryProblem} from 'stoichiometry-stepper';

interface ExamQuestion {
  examQuestionId: string;
  id: string;
  questionText: string;
  questionTypeId: string;
  questionType: { id: string; description: string } | null;
  options: { id: string; text: string }[] | null;
}

interface QuestionResponse {
  questionId: string;
  examQuestionId: string;
  answerId?: string;
  responseText?: string;
  responseImage?: string;
}

@Component({
    selector: 'app-take-exam',
    imports: [
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzSpinModule,
    NzRadioModule,
    NzInputModule,
    NzProgressModule,
    NzPopconfirmModule,
    NzAlertModule,
    NzStepsModule,
    AlertComponent,
    MoleculeBuilderComponent,
    AtomBuilderComponent,
    EquationBalancerComponent,
    ElectronConfigComponent,
    PeriodicTableQuizComponent,
    StoichiometryStepperComponent,
],
    templateUrl: './take.component.html',
    styleUrl: './take.component.css'
})
export class TakeExamComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MoleculeBuilderComponent) moleculeBuilder?: MoleculeBuilderComponent;
  @ViewChild(AtomBuilderComponent) atomBuilder?: AtomBuilderComponent;
  @ViewChild('moleculeContainer') moleculeContainer?: ElementRef<HTMLDivElement>;

  examId!: string;
  exam: any = null;
  questions: ExamQuestion[] = [];
  responses: Map<string, QuestionResponse> = new Map();
  currentQuestionIndex = 0;
  loading = true;
  submitting = false;

  // Molecule builder
  moleculeReady = true;
  moleculeGraph: MoleculeGraph | null = null;
  moleculeWidth = 550;
  moleculeHeight = 310;

  // Atom builder
  atomGraph: AtomicStructureGraph | null = null;

  // New tool builders
  equationGraph: ChemicalEquation | null = null;
  electronConfigGraph: ElectronConfiguration | null = null;
  periodicTableQuiz: PeriodicTableQuiz | null = null;
  periodicTableResponse: PeriodicTableResponse | null = null;
  stoichiometryGraph: StoichiometryProblem | null = null;

  // Timer
  timeLimitMinutes: number | null = null;
  timeRemainingSeconds = 0;
  timerInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id')!;
    this.loadExam();
  }

  ngAfterViewInit(): void {
    this.updateMoleculeSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMoleculeSize();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadExam(): void {
    this.apiService.getStudentExam(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.questions = exam.questions || [];
        this.timeLimitMinutes = exam.timeLimitMinutes;

        for (const q of this.questions) {
          this.responses.set(q.examQuestionId, { questionId: q.id, examQuestionId: q.examQuestionId });
        }

        this.apiService.getMyExamResponses(this.examId).subscribe({
          next: (drafts) => {
            for (const draft of drafts) {
              const key = draft.examQuestionId ?? draft.questionId;
              const existing = this.responses.get(key);
              if (existing) {
                existing.answerId = draft.answerId ?? undefined;
                existing.responseText = draft.responseText ?? undefined;
                existing.responseImage = draft.responseImage ?? undefined;
              }
            }
            this.updateBuilderGraphs();
          },
          error: () => {
            this.updateBuilderGraphs();
          }
        });

        if (this.timeLimitMinutes) {
          this.timeRemainingSeconds = this.timeLimitMinutes * 60;
          this.startTimer();
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.error(err?.error?.message || 'Failed to load exam');
      }
    });
  }

  get currentQuestion(): ExamQuestion | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get currentResponse(): QuestionResponse | null {
    if (!this.currentQuestion) return null;
    return this.responses.get(this.currentQuestion.examQuestionId) ?? null;
  }

  get answeredCount(): number {
    let count = 0;
    for (const [, r] of this.responses) {
      if (r.answerId || r.responseText) count++;
    }
    return count;
  }

  get progressPercent(): number {
    return this.questions.length > 0
      ? Math.round((this.answeredCount / this.questions.length) * 100)
      : 0;
  }

  get formattedTimeRemaining(): string {
    const mins = Math.floor(this.timeRemainingSeconds / 60);
    const secs = this.timeRemainingSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  isQuestionType(type: string): boolean {
    return this.currentQuestion?.questionType?.description?.toLowerCase() === type.toLowerCase();
  }

  isMoleculeType(): boolean {
    return isDiagramQuestion(this.currentQuestion?.questionType?.description);
  }

  isAtomicStructureType(): boolean {
    return isAtomicStructureQuestion(this.currentQuestion?.questionType?.description);
  }

  isChemicalEquationType(): boolean {
    return isChemicalEquationQuestion(this.currentQuestion?.questionType?.description);
  }

  isElectronConfigType(): boolean {
    return isElectronConfigQuestion(this.currentQuestion?.questionType?.description);
  }

  isPeriodicTableType(): boolean {
    return isPeriodicTableQuestion(this.currentQuestion?.questionType?.description);
  }

  isLewisStructureType(): boolean {
    return isLewisStructureQuestion(this.currentQuestion?.questionType?.description);
  }

  isStoichiometryType(): boolean {
    return isStoichiometryQuestion(this.currentQuestion?.questionType?.description);
  }

  selectAnswer(answerId: string): void {
    if (!this.currentResponse) return;
    this.currentResponse.answerId = answerId;
  }

  updateResponseText(text: string): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = text;
  }

  onMoleculeGraphChange(graph: MoleculeGraph): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = JSON.stringify(graph);
    this.moleculeGraph = graph;
  }

  onAtomGraphChange(graph: AtomicStructureGraph): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = JSON.stringify(graph);
    this.atomGraph = graph;
  }

  onEquationGraphChange(graph: ChemicalEquation): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = JSON.stringify(graph);
    this.equationGraph = graph;
  }

  onElectronConfigGraphChange(graph: ElectronConfiguration): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = JSON.stringify(graph);
    this.electronConfigGraph = graph;
  }

  onPeriodicTableResponseChange(response: PeriodicTableResponse): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = JSON.stringify(response);
    this.periodicTableResponse = response;
  }

  onStoichiometryGraphChange(graph: StoichiometryProblem): void {
    if (!this.currentResponse) return;
    this.currentResponse.responseText = JSON.stringify(graph);
    this.stoichiometryGraph = graph;
  }

  updateBuilderGraphs(): void {
    const responseText = this.currentResponse?.responseText;
    this.moleculeGraph = null;
    this.atomGraph = null;
    this.equationGraph = null;
    this.electronConfigGraph = null;
    this.periodicTableQuiz = null;
    this.periodicTableResponse = null;
    this.stoichiometryGraph = null;

    // Load quiz graph for periodic table from question's correct answer
    if (this.isPeriodicTableType() && this.currentQuestion) {
      const correctAnswer = (this.currentQuestion as any).correctAnswerText;
      if (correctAnswer) {
        try { this.periodicTableQuiz = JSON.parse(correctAnswer); } catch { /* ignore */ }
      }
    }

    if (!responseText) return;
    try {
      const parsed = JSON.parse(responseText);
      if (this.isMoleculeType() || this.isLewisStructureType()) {
        this.moleculeGraph = parsed;
      } else if (this.isAtomicStructureType()) {
        this.atomGraph = parsed;
      } else if (this.isChemicalEquationType()) {
        this.equationGraph = parsed;
      } else if (this.isElectronConfigType()) {
        this.electronConfigGraph = parsed;
      } else if (this.isPeriodicTableType()) {
        this.periodicTableResponse = parsed;
      } else if (this.isStoichiometryType()) {
        this.stoichiometryGraph = parsed;
      }
    } catch { /* ignore */ }
  }

  updateMoleculeSize(): void {
    const el = this.moleculeContainer?.nativeElement;
    const w = el ? el.offsetWidth : 550;
    this.moleculeWidth = Math.max(w, 300);
    const ratio = this.isAtomicStructureType() ? 0.75 : 0.56;
    this.moleculeHeight = Math.max(Math.round(this.moleculeWidth * ratio), 300);
  }

  saveCurrentResponse(): void {
    const response = this.currentResponse;
    if (!response) return;

    if (this.moleculeBuilder && (this.isMoleculeType() || this.isLewisStructureType())) {
      const image = this.moleculeBuilder.exportImage();
      if (image) response.responseImage = image;
    }
    if (this.atomBuilder && this.isAtomicStructureType()) {
      const image = this.atomBuilder.exportImage();
      if (image) response.responseImage = image;
    }

    if (!response.answerId && !response.responseText && !response.responseImage) return;

    this.apiService.saveExamResponse(this.examId, response).subscribe({
      error: () => {}
    });
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.saveCurrentResponse();
      this.moleculeReady = false;
      this.currentQuestionIndex = index;
      this.updateBuilderGraphs();
      setTimeout(() => this.moleculeReady = true);
    }
  }

  nextQuestion(): void {
    this.goToQuestion(this.currentQuestionIndex + 1);
  }

  prevQuestion(): void {
    this.goToQuestion(this.currentQuestionIndex - 1);
  }

  isQuestionAnswered(index: number): boolean {
    const q = this.questions[index];
    if (!q) return false;
    const r = this.responses.get(q.examQuestionId);
    return !!(r?.answerId || r?.responseText);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemainingSeconds--;
      if (this.timeRemainingSeconds <= 0) {
        this.stopTimer();
        this.submitExam();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  submitExam(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.stopTimer();
    this.saveCurrentResponse();

    this.apiService.submitExam(this.examId).subscribe({
      next: () => {
        this.router.navigate(['/student-exams/result', this.examId]);
      },
      error: (err) => {
        this.submitting = false;
        this.alertService.error(err?.error?.message || 'Failed to submit exam');
      }
    });
  }
}
