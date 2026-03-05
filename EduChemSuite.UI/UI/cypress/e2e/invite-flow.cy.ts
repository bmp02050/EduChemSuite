describe('Invite and Registration Flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/District', {
      statusCode: 200,
      body: [{ id: 'district-1', districtName: 'Test District' }],
    }).as('getDistricts');

    cy.intercept('GET', '**/api/School', {
      statusCode: 200,
      body: [{ id: 'school-1', name: 'Test School' }],
    }).as('getSchools');

    cy.intercept('POST', '**/api/User/register', {
      statusCode: 201,
      body: {
        id: 'new-user-id',
        email: 'newuser@educhem.test',
        firstName: 'New',
        lastName: 'User',
      },
    }).as('registerUser');
  });

  it('should allow staff to access the registration form', () => {
    cy.loginAsStaff();
    cy.visit('/account/register');
    cy.get('nz-card').should('contain.text', 'Register New User');
    cy.get('input[formcontrolname="firstName"]').should('be.visible');
    cy.get('input[formcontrolname="lastName"]').should('be.visible');
    cy.get('input[formcontrolname="email"]').should('be.visible');
    cy.get('input[formcontrolname="password"]').should('be.visible');
  });

  it('should display role and assignment fields on the registration form', () => {
    cy.loginAsAdmin();
    cy.visit('/account/register');
    // The form should have account type, district, and school selectors
    cy.get('nz-select[formcontrolname="accountType"]').should('be.visible');
    cy.get('nz-select[formcontrolname="districtId"]').should('be.visible');
    cy.get('nz-select[formcontrolname="schoolId"]').should('be.visible');
    cy.get('label').contains('Is Admin').should('be.visible');
  });

  it('should fill and submit the registration form', () => {
    cy.loginAsAdmin();
    cy.visit('/account/register');

    cy.get('input[formcontrolname="firstName"]').type('New');
    cy.get('input[formcontrolname="lastName"]').type('User');
    cy.get('input[formcontrolname="email"]').type('newuser@educhem.test');
    cy.get('input[formcontrolname="password"]').type('Password123');
    cy.get('input[formcontrolname="confirmPassword"]').type('Password123');

    // Select account type
    cy.get('nz-select[formcontrolname="accountType"]').click();
    cy.get('nz-option-item').first().click();

    // Fill address fields
    cy.get('input[formcontrolname="address1"]').type('123 Main St');
    cy.get('input[formcontrolname="city"]').type('Springfield');
    cy.get('input[formcontrolname="state"]').type('IL');
    cy.get('input[formcontrolname="country"]').type('US');
    cy.get('input[formcontrolname="zip"]').type('62701');
    cy.get('input[formcontrolname="phone"]').type('555-0100');

    cy.contains('button', 'Register').click();
    cy.wait('@registerUser');
  });
});
