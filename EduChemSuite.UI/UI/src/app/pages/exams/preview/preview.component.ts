import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AlertService, ApiService} from '../../../_services';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzTableModule} from 'ng-zorro-antd/table';
import {AlertComponent} from '../../../_components';
import {isDiagramQuestion, isAtomicStructureQuestion, isChemicalEquationQuestion, isElectronConfigQuestion, isLewisStructureQuestion, isPeriodicTableQuestion, isStoichiometryQuestion} from '../../../_helpers';
import {MoleculeBuilderComponent, MoleculeGraph} from 'molecule-builder';
import {AtomBuilderComponent, AtomicStructureGraph} from 'atom-builder';
import {EquationBalancerComponent, ChemicalEquation} from 'equation-balancer';
import {ElectronConfigComponent, ElectronConfiguration} from 'electron-config';
import {PeriodicTableQuizComponent, PeriodicTableQuiz, PeriodicTableResponse} from 'periodic-table-quiz';
import {StoichiometryStepperComponent, StoichiometryProblem} from 'stoichiometry-stepper';

interface PreviewAnswer {
  id: string;
  answerText: string;
  isCorrect: boolean;
}

interface PreviewQuestion {
  id: string;
  questionText: string;
  questionTypeId: string;
  questionType: { id: string; description: string } | null;
  answers: PreviewAnswer[];
}

interface QuestionResponse {
  questionId: string;
  answerId?: string;
  responseText?: string;
}

interface QuestionResult {
  questionText: string;
  questionType: string;
  yourAnswer: string;
  correctAnswer: string;
  status: 'correct' | 'incorrect' | 'pending';
}

@Component({
    selector: 'app-preview-exam',
    imports: [
    FormsModule,
    RouterLink,
    NzCardModule,
    NzButtonModule,
    NzSpinModule,
    NzRadioModule,
    NzInputModule,
    NzProgressModule,
    NzPopconfirmModule,
    NzAlertModule,
    NzTagModule,
    NzResultModule,
    NzTableModule,
    AlertComponent,
    MoleculeBuilderComponent,
    AtomBuilderComponent,
    EquationBalancerComponent,
    ElectronConfigComponent,
    PeriodicTableQuizComponent,
    StoichiometryStepperComponent,
],
    templateUrl: './preview.component.html'
})
export class PreviewExamComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('moleculeContainer') moleculeContainer?: ElementRef<HTMLDivElement>;

  examId!: string;
  exam: any = null;
  questions: PreviewQuestion[] = [];
  responses: Map<string, QuestionResponse> = new Map();
  currentQuestionIndex = 0;
  loading = true;
  submitted = false;

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

  // Results
  results: QuestionResult[] = [];
  correctCount = 0;
  pendingCount = 0;
  totalQuestions = 0;
  scorePercent = 0;

  // Timer (informational)
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
    this.apiService.previewExam(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.questions = exam.questions || [];
        this.timeLimitMinutes = exam.timeLimitMinutes;
        this.totalQuestions = this.questions.length;

        for (const q of this.questions) {
          this.responses.set(q.id, {questionId: q.id});
        }

        if (this.timeLimitMinutes) {
          this.timeRemainingSeconds = this.timeLimitMinutes * 60;
          this.startTimer();
        }

        this.loading = false;
        this.updateBuilderGraphs();
      },
      error: (err) => {
        this.loading = false;
        this.alertService.error(err?.error?.message || 'Failed to load exam preview');
      }
    });
  }

  get currentQuestion(): PreviewQuestion | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get currentResponse(): QuestionResponse | null {
    if (!this.currentQuestion) return null;
    return this.responses.get(this.currentQuestion.id) ?? null;
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
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.answerId = answerId;
  }

  updateResponseText(text: string): void {
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.responseText = text;
  }

  onMoleculeGraphChange(graph: MoleculeGraph): void {
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.responseText = JSON.stringify(graph);
    this.moleculeGraph = graph;
  }

  onAtomGraphChange(graph: AtomicStructureGraph): void {
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.responseText = JSON.stringify(graph);
    this.atomGraph = graph;
  }

  onEquationGraphChange(graph: ChemicalEquation): void {
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.responseText = JSON.stringify(graph);
    this.equationGraph = graph;
  }

  onElectronConfigGraphChange(graph: ElectronConfiguration): void {
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.responseText = JSON.stringify(graph);
    this.electronConfigGraph = graph;
  }

  onPeriodicTableResponseChange(response: PeriodicTableResponse): void {
    if (!this.currentQuestion) return;
    const r = this.responses.get(this.currentQuestion.id)!;
    r.responseText = JSON.stringify(response);
    this.periodicTableResponse = response;
  }

  onStoichiometryGraphChange(graph: StoichiometryProblem): void {
    if (!this.currentQuestion) return;
    const response = this.responses.get(this.currentQuestion.id)!;
    response.responseText = JSON.stringify(graph);
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

    // Load quiz config for periodic table from question's correct answer
    if (this.isPeriodicTableType() && this.currentQuestion) {
      const correctAnswer = this.currentQuestion.answers?.find((a: any) => a.isCorrect);
      if (correctAnswer?.answerText) {
        try { this.periodicTableQuiz = JSON.parse(correctAnswer.answerText); } catch { /* ignore */ }
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
    this.moleculeHeight = Math.max(Math.round(this.moleculeWidth * 0.56), 300);
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
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
    const r = this.responses.get(q.id);
    return !!(r?.answerId || r?.responseText);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemainingSeconds > 0) {
        this.timeRemainingSeconds--;
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  finishPractice(): void {
    this.stopTimer();
    this.results = [];
    this.correctCount = 0;
    this.pendingCount = 0;

    for (const q of this.questions) {
      const response = this.responses.get(q.id);
      const qType = q.questionType?.description?.toLowerCase() || '';

      if (qType === 'multiple choice') {
        const correctAnswer = q.answers.find(a => a.isCorrect);
        const selectedAnswer = q.answers.find(a => a.id === response?.answerId);
        const isCorrect = correctAnswer?.id === response?.answerId && !!response?.answerId;

        if (isCorrect) this.correctCount++;

        this.results.push({
          questionText: q.questionText,
          questionType: q.questionType?.description || '',
          yourAnswer: selectedAnswer?.answerText || '(No answer)',
          correctAnswer: correctAnswer?.answerText || '(None)',
          status: !response?.answerId ? 'incorrect' : isCorrect ? 'correct' : 'incorrect',
        });
      } else {
        this.pendingCount++;
        this.results.push({
          questionText: q.questionText,
          questionType: q.questionType?.description || '',
          yourAnswer: response?.responseText ? '(Response provided)' : '(No answer)',
          correctAnswer: 'Requires manual review',
          status: 'pending',
        });
      }
    }

    const gradable = this.totalQuestions - this.pendingCount;
    this.scorePercent = gradable > 0 ? Math.round((this.correctCount / gradable) * 100) : 0;
    this.submitted = true;
  }

  retake(): void {
    this.submitted = false;
    this.results = [];
    this.currentQuestionIndex = 0;
    for (const q of this.questions) {
      this.responses.set(q.id, {questionId: q.id});
    }
    this.updateBuilderGraphs();
    if (this.timeLimitMinutes) {
      this.timeRemainingSeconds = this.timeLimitMinutes * 60;
      this.startTimer();
    }
  }
}
