describe('Sidebar Navigation', () => {
  it('should show only Account menu items when not logged in', () => {
    cy.visit('/account/login');
    // The sidebar should show Login link
    cy.get('nz-sider').within(() => {
      cy.contains('Login').should('be.visible');
      // Should not show items requiring authentication
      cy.contains('Districts').should('not.exist');
      cy.contains('User List').should('not.exist');
    });
  });

  it('should show full menu for Admin users', () => {
    cy.loginAsAdmin();

    // Intercept API calls that pages might make
    cy.intercept('GET', '**/api/**', { body: [] }).as('apiCalls');

    cy.visit('/welcome');

    cy.get('nz-sider').within(() => {
      cy.contains('Welcome').should('be.visible');
      cy.contains('Districts').should('be.visible');
      cy.contains('Schools').should('be.visible');
      cy.contains('Exams').should('be.visible');
      cy.contains('Grades').should('be.visible');
      cy.contains('Questions').should('be.visible');
      cy.contains('Users').should('be.visible');
      cy.contains('Logout').should('be.visible');
    });
  });

  it('should show limited menu for Staff users', () => {
    cy.loginAsStaff();

    cy.intercept('GET', '**/api/**', { body: [] }).as('apiCalls');

    cy.visit('/welcome');

    cy.get('nz-sider').within(() => {
      cy.contains('Welcome').should('be.visible');
      cy.contains('Schools').should('be.visible');
      cy.contains('Exams').should('be.visible');
      cy.contains('Questions').should('be.visible');
      // Staff cannot see Districts submenu (requires elevated user)
      cy.contains('My Districts').should('not.exist');
      cy.contains('Add District').should('not.exist');
    });
  });

  it('should show minimal menu for Student users', () => {
    cy.loginAsStudent();

    cy.intercept('GET', '**/api/**', { body: [] }).as('apiCalls');

    cy.visit('/welcome');

    cy.get('nz-sider').within(() => {
      cy.contains('Welcome').should('be.visible');
      cy.contains('Exams').should('be.visible');
      cy.contains('Grades').should('be.visible');
      cy.contains('Logout').should('be.visible');
      // Students should not see management items
      cy.contains('Districts').should('not.exist');
      cy.contains('Schools').should('not.exist');
      cy.contains('Questions').should('not.exist');
      cy.contains('Users').should('not.exist');
    });
  });
});
