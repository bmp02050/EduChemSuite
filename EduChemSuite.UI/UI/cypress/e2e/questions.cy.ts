describe('Questions', () => {
  const mockQuestionTypes = [
    { id: 'qt-1', description: 'Multiple Choice' },
    { id: 'qt-2', description: 'Essay' },
  ];

  const mockTags = [
    { id: 'tag-1', tagText: 'Organic Chemistry' },
    { id: 'tag-2', tagText: 'Inorganic Chemistry' },
  ];

  const mockQuestions = [
    {
      id: 'q-1',
      questionText: 'What is the molecular formula of water?',
      questionType: { id: 'qt-1', description: 'Multiple Choice' },
      questionTags: [{ tag: { tagText: 'Inorganic Chemistry' } }],
      answers: [{ id: 'a-1' }, { id: 'a-2' }],
      version: 1,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-2',
      questionText: 'Describe the process of photosynthesis.',
      questionType: { id: 'qt-2', description: 'Essay' },
      questionTags: [{ tag: { tagText: 'Organic Chemistry' } }],
      answers: [],
      version: 1,
      isActive: true,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    cy.loginAsStaff();

    cy.intercept('GET', '**/api/Question', {
      statusCode: 200,
      body: mockQuestions,
    }).as('getQuestions');

    cy.intercept('GET', '**/api/QuestionType', {
      statusCode: 200,
      body: mockQuestionTypes,
    }).as('getQuestionTypes');

    cy.intercept('GET', '**/api/Tag', {
      statusCode: 200,
      body: mockTags,
    }).as('getTags');

    cy.intercept('POST', '**/api/Question', {
      statusCode: 201,
      body: {
        id: 'q-3',
        questionText: 'New question text',
        isActive: true,
      },
    }).as('createQuestion');

    cy.intercept('DELETE', '**/api/Question/**', {
      statusCode: 200,
      body: {},
    }).as('deleteQuestion');
  });

  it('should display questions list', () => {
    cy.visit('/questions');
    cy.wait('@getQuestions');
    cy.get('nz-card').should('contain.text', 'My Questions');
    cy.get('nz-table tbody tr').should('have.length', 2);
    cy.contains('What is the molecular formula of water?').should('be.visible');
  });

  it('should navigate to add question form', () => {
    cy.visit('/questions');
    cy.wait('@getQuestions');
    cy.contains('button', 'Add Question').click();
    cy.url().should('include', '/questions/add');
    cy.contains('Add Question').should('be.visible');
  });

  it('should fill in the add question form', () => {
    cy.visit('/questions/add');
    cy.get('textarea[formcontrolname="questionText"]').type('What is H2O?');
    // Open the question type select and pick an option
    cy.get('nz-select[formcontrolname="questionTypeId"]').click();
    cy.get('nz-option-item').first().click();
    cy.contains('button', 'Create Question').should('be.visible');
  });

  it('should add answers to a new question', () => {
    cy.visit('/questions/add');
    cy.get('input[placeholder="Answer text"]').type('H2O');
    cy.contains('button', 'Add Answer').click();
    // Verify the answer appears in the pending answers table
    cy.get('nz-table').last().find('tbody tr').should('have.length', 1);
    cy.contains('H2O').should('be.visible');
  });

  it('should delete a question', () => {
    cy.visit('/questions');
    cy.wait('@getQuestions');
    cy.contains('button', 'Delete').first().click();
    cy.get('.ant-popover-buttons').find('button').contains('OK').click();
    cy.wait('@deleteQuestion');
  });
});
