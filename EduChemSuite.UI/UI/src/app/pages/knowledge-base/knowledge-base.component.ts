import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { StorageService } from '../../_services/storage.service';

// Chemistry tool components
import { MoleculeBuilderComponent } from 'molecule-builder';
import { AtomBuilderComponent } from 'atom-builder';
import { ElectronConfigComponent } from 'electron-config';
import { EquationBalancerComponent } from 'equation-balancer';
import { StoichiometryStepperComponent } from 'stoichiometry-stepper';
import { PeriodicTableQuizComponent } from 'periodic-table-quiz';

// Model types
import { MoleculeGraph } from 'molecule-builder';
import { AtomicStructureGraph } from 'atom-builder';
import { ElectronConfiguration } from 'electron-config';
import { ChemicalEquation } from 'equation-balancer';
import { StoichiometryProblem } from 'stoichiometry-stepper';
import { PeriodicTableQuiz } from 'periodic-table-quiz';

export interface KbPage {
  key: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzMenuModule,
    NzLayoutModule,
    NzIconModule,
    NzTableModule,
    NzAlertModule,
    NzTypographyModule,
    NzCardModule,
    NzTagModule,
    NzDividerModule,
    MoleculeBuilderComponent,
    AtomBuilderComponent,
    ElectronConfigComponent,
    EquationBalancerComponent,
    StoichiometryStepperComponent,
    PeriodicTableQuizComponent,
  ],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.css',
})
export class KnowledgeBaseComponent implements OnInit {
  pages: KbPage[] = [
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'getting-started', title: 'Getting Started', icon: 'rocket' },
    { key: 'for-teachers', title: 'For Teachers', icon: 'solution' },
    { key: 'chemistry-tools', title: 'Chemistry Tools', icon: 'experiment' },
    { key: 'for-students', title: 'For Students', icon: 'user' },
    { key: 'for-administrators', title: 'For Administrators', icon: 'setting' },
    { key: 'data-management', title: 'Data Management', icon: 'database' },
    { key: 'messaging', title: 'Messaging', icon: 'message' },
    { key: 'faq', title: 'FAQ', icon: 'question-circle' },
  ];

  activePage = 'home';

  // Showcase data for Chemistry Tools page
  showcaseMolecule: MoleculeGraph = {
    atoms: [
      { id: 'a1', element: 'C', x: 220, y: 145 },
      { id: 'a2', element: 'C', x: 279, y: 179 },
      { id: 'a3', element: 'C', x: 279, y: 244 },
      { id: 'a4', element: 'C', x: 220, y: 278 },
      { id: 'a5', element: 'C', x: 161, y: 244 },
      { id: 'a6', element: 'C', x: 161, y: 179 },
      { id: 'a7', element: 'C', x: 220, y: 78 },
      { id: 'a8', element: 'O', x: 268, y: 45 },
      { id: 'a9', element: 'O', x: 165, y: 45 },
      { id: 'a10', element: 'O', x: 325, y: 148 },
      { id: 'a11', element: 'C', x: 375, y: 115 },
      { id: 'a12', element: 'O', x: 420, y: 78 },
      { id: 'a13', element: 'C', x: 415, y: 158 },
    ],
    bonds: [
      { id: 'b1', fromAtomId: 'a1', toAtomId: 'a2', type: 'double' },
      { id: 'b2', fromAtomId: 'a2', toAtomId: 'a3', type: 'single' },
      { id: 'b3', fromAtomId: 'a3', toAtomId: 'a4', type: 'double' },
      { id: 'b4', fromAtomId: 'a4', toAtomId: 'a5', type: 'single' },
      { id: 'b5', fromAtomId: 'a5', toAtomId: 'a6', type: 'double' },
      { id: 'b6', fromAtomId: 'a6', toAtomId: 'a1', type: 'single' },
      { id: 'b7', fromAtomId: 'a1', toAtomId: 'a7', type: 'single' },
      { id: 'b8', fromAtomId: 'a7', toAtomId: 'a8', type: 'double' },
      { id: 'b9', fromAtomId: 'a7', toAtomId: 'a9', type: 'single' },
      { id: 'b10', fromAtomId: 'a2', toAtomId: 'a10', type: 'single' },
      { id: 'b11', fromAtomId: 'a10', toAtomId: 'a11', type: 'single' },
      { id: 'b12', fromAtomId: 'a11', toAtomId: 'a12', type: 'double' },
      { id: 'b13', fromAtomId: 'a11', toAtomId: 'a13', type: 'single' },
    ],
  };

  showcaseAtom: AtomicStructureGraph = {
    nucleus: { protons: 29, neutrons: 35 },
    element: 'Cu',
    atomicNumber: 29,
    massNumber: 64,
    shells: [
      { n: 1, electrons: 2, maxElectrons: 2 },
      { n: 2, electrons: 8, maxElectrons: 8 },
      { n: 3, electrons: 18, maxElectrons: 18 },
      { n: 4, electrons: 1, maxElectrons: 32 },
    ],
  };

  showcaseElectronConfig: ElectronConfiguration = {
    element: 'Fe',
    atomicNumber: 26,
    orbitals: [
      {
        name: '1s',
        subshell: 's',
        n: 1,
        maxElectrons: 2,
        boxCount: 1,
        boxes: [{ electrons: [{ spin: 'up' }, { spin: 'down' }] }],
      },
      {
        name: '2s',
        subshell: 's',
        n: 2,
        maxElectrons: 2,
        boxCount: 1,
        boxes: [{ electrons: [{ spin: 'up' }, { spin: 'down' }] }],
      },
      {
        name: '2p',
        subshell: 'p',
        n: 2,
        maxElectrons: 6,
        boxCount: 3,
        boxes: [
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
        ],
      },
      {
        name: '3s',
        subshell: 's',
        n: 3,
        maxElectrons: 2,
        boxCount: 1,
        boxes: [{ electrons: [{ spin: 'up' }, { spin: 'down' }] }],
      },
      {
        name: '3p',
        subshell: 'p',
        n: 3,
        maxElectrons: 6,
        boxCount: 3,
        boxes: [
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
        ],
      },
      {
        name: '4s',
        subshell: 's',
        n: 4,
        maxElectrons: 2,
        boxCount: 1,
        boxes: [{ electrons: [{ spin: 'up' }, { spin: 'down' }] }],
      },
      {
        name: '3d',
        subshell: 'd',
        n: 3,
        maxElectrons: 10,
        boxCount: 5,
        boxes: [
          { electrons: [{ spin: 'up' }, { spin: 'down' }] },
          { electrons: [{ spin: 'up' }] },
          { electrons: [{ spin: 'up' }] },
          { electrons: [{ spin: 'up' }] },
          { electrons: [{ spin: 'up' }] },
        ],
      },
    ],
  };

  showcaseEquation: ChemicalEquation = {
    reactants: [
      { formula: 'C₆H₁₂O₆', coefficient: 1 },
      { formula: 'O₂', coefficient: 6 },
    ],
    products: [
      { formula: 'CO₂', coefficient: 6 },
      { formula: 'H₂O', coefficient: 6 },
    ],
  };

  showcaseStoichiometry: StoichiometryProblem = {
    problemText:
      'How many grams of H₂O are produced when 90 g of glucose (C₆H₁₂O₆) undergoes complete combustion? Balanced: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
    givenValue: 90,
    givenUnit: 'g C₆H₁₂O₆',
    steps: [
      { numerator: '1 mol C₆H₁₂O₆', denominator: '180.16 g C₆H₁₂O₆' },
      { numerator: '6 mol H₂O', denominator: '1 mol C₆H₁₂O₆' },
      { numerator: '18.02 g H₂O', denominator: '1 mol H₂O' },
    ],
    finalAnswer: { value: 54.06, unit: 'g H₂O', tolerance: 0.5 },
  };

  showcasePeriodicQuiz: PeriodicTableQuiz = {
    mode: 'trend',
    config: {
      property: 'electronegativity',
      elements: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'],
      correctOrder: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'],
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) {}

  get isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  get visiblePages(): KbPage[] {
    return this.isLoggedIn
      ? this.pages
      : this.pages.filter(p => p.key !== 'chemistry-tools');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['page'] && this.visiblePages.some(p => p.key === params['page'])) {
        this.activePage = params['page'];
      }
    });
  }

  selectPage(key: string): void {
    this.activePage = key;
    this.router.navigate([], { queryParams: { page: key }, queryParamsHandling: 'merge' });
  }
}
