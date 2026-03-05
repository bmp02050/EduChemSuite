import { TestBed } from '@angular/core/testing';

import { MoleculeBuilderService } from './molecule-builder.service';

describe('MoleculeBuilderService', () => {
  let service: MoleculeBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoleculeBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
