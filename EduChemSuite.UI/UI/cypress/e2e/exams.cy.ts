describe('Exams', () => {
  const mockExams = [
    {
      id: 'exam-1',
      name: 'Midterm Exam',
      description: 'Covers chapters 1-5 on organic chemistry',
      examQuestions: [{ id: 'eq-1' }, { id: 'eq-2' }],
      grades: [{ id: 'g-1' }],
      isActive: true,
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    },
    {
      id: 'exam-2',
      name: 'Final Exam',
      description: 'Comprehensive final covering all topics',
      examQuestions: [],
      grades: [],
      isActive: true,
      createdAt: '2025-05-01T00:00:00Z',
      updatedAt: '2025-05-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    cy.loginAsStaff();

    cy.intercept('GET', '**/api/Exam', {
      statusCode: 200,
      body: mockExams,
    }).as('getExams');

    cy.intercept('POST', '**/api/Exam', {
      statusCode: 201,
      body: {
        id: 'exam-3',
        name: 'Quiz 1',
        description: 'Short quiz',
        isActive: true,
      },
    }).as('createExam');

    cy.intercept('DELETE', '**/api/Exam/**', {
      statusCode: 200,
      body: {},
    }).as('deleteExam');
  });

  it('should display exams list', () => {
    cy.visit('/exams');
    cy.wait('@getExams');
    cy.contains('Exams').should('be.visible');
    cy.get('nz-table tbody tr').should('have.length', 2);
    cy.contains('Midterm Exam').should('be.visible');
    cy.contains('Final Exam').should('be.visible');
  });

  it('should navigate to create exam form', () => {
    cy.visit('/exams');
    cy.wait('@getExams');
    cy.contains('button', 'Create Exam').click();
    cy.url().should('include', '/exams/add');
    cy.contains('Create Exam').should('be.visible');
  });

  it('should create a new exam', () => {
    cy.visit('/exams/add');
    cy.get('input[formcontrolname="name"]').type('Quiz 1');
    cy.get('textarea[formcontrolname="description"]').type('Short quiz on chemical bonds');
    cy.contains('button', 'Create Exam').click();
    cy.wait('@createExam');
    cy.url().should('include', '/exams');
  });

  it('should delete an exam', () => {
    cy.visit('/exams');
    cy.wait('@getExams');
    cy.contains('button', 'Delete').first().click();
    cy.get('.ant-popover-buttons').find('button').contains('OK').click();
    cy.wait('@deleteExam');
  });
});
