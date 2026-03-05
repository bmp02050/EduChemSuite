describe('Districts', () => {
  const mockDistricts = [
    {
      id: 'district-1',
      districtName: 'Test District One',
      isActive: true,
      schools: [{ id: 'school-1' }],
      administrators: [{ id: 'admin-1' }],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'district-2',
      districtName: 'Test District Two',
      isActive: false,
      schools: [],
      administrators: [],
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    cy.loginAsAdmin();

    cy.intercept('GET', '**/api/District', {
      statusCode: 200,
      body: mockDistricts,
    }).as('getDistricts');

    cy.intercept('POST', '**/api/District', {
      statusCode: 201,
      body: {
        id: 'district-3',
        districtName: 'New District',
        isActive: true,
        schools: [],
        administrators: [],
      },
    }).as('createDistrict');

    cy.intercept('GET', '**/api/District/district-1', {
      statusCode: 200,
      body: mockDistricts[0],
    }).as('getDistrict');

    cy.intercept('PUT', '**/api/District/**', {
      statusCode: 200,
      body: { ...mockDistricts[0], districtName: 'Updated District' },
    }).as('updateDistrict');

    cy.intercept('DELETE', '**/api/District/**', {
      statusCode: 200,
      body: {},
    }).as('deleteDistrict');
  });

  it('should display districts list', () => {
    cy.visit('/districts');
    cy.wait('@getDistricts');
    cy.get('nz-card').should('contain.text', 'Districts');
    cy.get('nz-table tbody tr').should('have.length', 2);
    cy.contains('Test District One').should('be.visible');
    cy.contains('Test District Two').should('be.visible');
  });

  it('should navigate to add district', () => {
    cy.visit('/districts');
    cy.wait('@getDistricts');
    cy.contains('button', 'Add District').click();
    cy.url().should('include', '/districts/add');
    cy.get('nz-card').should('contain.text', 'Add District');
  });

  it('should create a new district', () => {
    cy.visit('/districts/add');
    cy.get('input[formcontrolname="districtName"]').type('New District');
    cy.contains('button', 'Create District').click();
    cy.wait('@createDistrict');
    cy.url().should('include', '/districts');
  });

  it('should edit a district', () => {
    cy.visit('/districts');
    cy.wait('@getDistricts');
    cy.contains('a', 'Edit').first().click();
    cy.url().should('include', '/districts/edit/');
  });

  it('should delete a district', () => {
    cy.visit('/districts');
    cy.wait('@getDistricts');
    // Click the Delete button to trigger the popconfirm
    cy.contains('button', 'Delete').first().click();
    // Confirm the popconfirm dialog
    cy.get('.ant-popover-buttons').find('button').contains('OK').click();
    cy.wait('@deleteDistrict');
  });
});
