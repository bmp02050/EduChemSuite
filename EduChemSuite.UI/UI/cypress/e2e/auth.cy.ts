describe('Authentication', () => {
  beforeEach(() => {
    // Intercept auth API calls
    cy.intercept('POST', '**/api/Auth/authenticate', (req) => {
      if (req.body.email === 'admin@educhem.test' && req.body.password === 'Password123') {
        req.reply({
          statusCode: 200,
          body: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@educhem.test',
            accountType: 0,
            accessToken: 'fake-admin-access-token',
            refreshToken: 'fake-admin-refresh-token',
            success: true,
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { message: 'Invalid email or password' },
        });
      }
    }).as('authRequest');
  });

  it('should display the login form', () => {
    cy.visit('/account/login');
    cy.get('nz-card').should('contain.text', 'EduChem Suite');
    cy.get('input[formcontrolname="email"]').should('be.visible');
    cy.get('input[formcontrolname="password"]').should('be.visible');
    cy.get('button[nztype="primary"]').should('contain.text', 'Login');
  });

  it('should login with valid credentials', () => {
    cy.visit('/account/login');
    cy.get('input[formcontrolname="email"]').type('admin@educhem.test');
    cy.get('input[formcontrolname="password"]').type('Password123');
    cy.get('button[nztype="primary"]').click();
    cy.wait('@authRequest');
    cy.url().should('include', '/welcome');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/account/login');
    cy.get('input[formcontrolname="email"]').type('bad@email.com');
    cy.get('input[formcontrolname="password"]').type('wrongpassword');
    cy.get('button[nztype="primary"]').click();
    cy.wait('@authRequest');
    // The app should display an alert component with an error message
    cy.get('alert').should('be.visible');
  });

  it('should logout and redirect to login', () => {
    cy.loginAsAdmin();
    cy.visit('/welcome');
    // Intercept any API calls for the welcome page
    cy.intercept('GET', '**/api/**', { body: [] }).as('apiCalls');
    cy.visit('/account/logout');
    cy.url().should('include', '/account/login');
  });

  it('should navigate to forgot password', () => {
    cy.visit('/account/login');
    cy.contains('Forgot your password?').click();
    cy.url().should('include', '/account/forgot-password');
    cy.get('nz-card').should('contain.text', 'Forgot Password');
    cy.get('input[formcontrolname="email"]').should('be.visible');
    cy.contains('Send Reset Link').should('be.visible');
  });
});
