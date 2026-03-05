describe('Schools', () => {
  const mockSchools = [
    {
      id: 'school-1',
      name: 'Westfield High School',
      isActive: true,
      staff: [{ id: 'staff-1' }],
      students: [{ id: 'student-1' }, { id: 'student-2' }],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'school-2',
      name: 'Eastside Academy',
      isActive: true,
      staff: [],
      students: [],
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  ];

  const mockDistricts = [
    { id: 'district-1', districtName: 'Test District One' },
  ];

  beforeEach(() => {
    cy.loginAsAdmin();

    cy.intercept('GET', '**/api/School', {
      statusCode: 200,
      body: mockSchools,
    }).as('getSchools');

    cy.intercept('GET', '**/api/District', {
      statusCode: 200,
      body: mockDistricts,
    }).as('getDistricts');

    cy.intercept('POST', '**/api/School', {
      statusCode: 201,
      body: {
        id: 'school-3',
        name: 'New School',
        isActive: true,
        staff: [],
        students: [],
      },
    }).as('createSchool');

    cy.intercept('DELETE', '**/api/School/**', {
      statusCode: 200,
      body: {},
    }).as('deleteSchool');
  });

  it('should display schools list', () => {
    cy.visit('/schools');
    cy.wait('@getSchools');
    cy.contains('Schools').should('be.visible');
    cy.get('nz-table tbody tr').should('have.length', 2);
    cy.contains('Westfield High School').should('be.visible');
    cy.contains('Eastside Academy').should('be.visible');
  });

  it('should navigate to add school form', () => {
    cy.visit('/schools');
    cy.wait('@getSchools');
    cy.contains('button', 'Add School').click();
    cy.url().should('include', '/schools/add');
    cy.contains('Add School').should('be.visible');
  });

  it('should create a new school', () => {
    cy.visit('/schools/add');
    cy.get('input[formcontrolname="name"]').type('New School');
    cy.contains('button', 'Create School').click();
    cy.wait('@createSchool');
    cy.url().should('include', '/schools');
  });

  it('should delete a school', () => {
    cy.visit('/schools');
    cy.wait('@getSchools');
    cy.contains('button', 'Delete').first().click();
    cy.get('.ant-popover-buttons').find('button').contains('OK').click();
    cy.wait('@deleteSchool');
  });
});
