import {Component, OnInit, OnDestroy} from '@angular/core';

import {ActivatedRoute, RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {ApiService, SignalRService} from '../../../_services';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {MoleculeCompareComponent} from 'molecule-builder';
import {AtomCompareComponent} from 'atom-builder';
import {EquationCompareComponent} from 'equation-balancer';
import {ElectronConfigCompareComponent} from 'electron-config';
import {PeriodicTableCompareComponent} from 'periodic-table-quiz';
import {StoichiometryCompareComponent} from 'stoichiometry-stepper';

@Component({
    selector: 'app-exam-result',
    imports: [
    RouterLink,
    NzCardModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzStatisticModule,
    NzButtonModule,
    NzAlertModule,
    MoleculeCompareComponent,
    AtomCompareComponent,
    EquationCompareComponent,
    ElectronConfigCompareComponent,
    PeriodicTableCompareComponent,
    StoichiometryCompareComponent,
],
    templateUrl: './result.component.html',
    styleUrl: './result.component.css'
})
export class ExamResultComponent implements OnInit, OnDestroy {
  examId!: string;
  result: any = null;
  loading = true;
  gradingPending = false;
  gradingFailed = false;
  private gradeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private signalRService: SignalRService,
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id')!;
    this.loadResult();

    this.gradeSub = this.signalRService.gradeReady$.subscribe(data => {
      if (data.examId === this.examId) {
        this.gradingPending = false;
        this.loadResult();
      }
    });
  }

  ngOnDestroy(): void {
    this.gradeSub?.unsubscribe();
  }

  loadResult(): void {
    this.apiService.getExamResult(this.examId).subscribe({
      next: (result) => {
        this.result = result;
        this.gradingPending = result.gradingStatus === 'Pending';
        this.gradingFailed = result.gradingStatus === 'Failed';
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getResponseStatus(response: any): string {
    if (!response) return 'No Answer';
    if (!response.isGraded) return 'Pending Review';
    return response.isCorrect ? 'Correct' : 'Incorrect';
  }

  getCorrectAnswerText(response: any): string {
    return response?.correctAnswerText || '';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Correct': return 'green';
      case 'Incorrect': return 'red';
      case 'Pending Review': return 'orange';
      default: return 'default';
    }
  }

  isDiagramQuestion(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('chemical structure') || desc.includes('diagram') || desc.includes('molecule');
  }

  isAtomicStructureQuestion(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('atomic structure') || desc.includes('bohr model');
  }

  isChemicalEquation(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('chemical equation') || desc.includes('equation balancing');
  }

  isElectronConfig(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('electron configuration');
  }

  isPeriodicTable(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('periodic table');
  }

  isLewisStructure(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('lewis structure') || desc.includes('lewis dot');
  }

  isStoichiometry(response: any): boolean {
    const desc = response?.question?.questionType?.description?.toLowerCase() ?? '';
    return desc.includes('stoichiometry');
  }

  isToolQuestion(response: any): boolean {
    return this.isDiagramQuestion(response) || this.isAtomicStructureQuestion(response) ||
      this.isLewisStructure(response) ||
      this.isChemicalEquation(response) || this.isElectronConfig(response) ||
      this.isPeriodicTable(response) || this.isStoichiometry(response);
  }

  getCorrectDiagramJson(response: any): string | null {
    return response?.correctDiagramGraph ?? null;
  }
}
