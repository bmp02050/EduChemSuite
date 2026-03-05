const API_URL = 'http://localhost:5000';
const USER_KEY = 'auth-user';

// Account types matching the Angular AccountType enum
const AccountType = {
  Admin: 0,
  Student: 1,
  Staff: 2,
  AdminStaff: 3,
};

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/Auth/authenticate`,
    body: { email, password },
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(response.body));
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  // Stub the auth API call and set session storage directly
  const adminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@educhem.test',
    accountType: AccountType.Admin,
    accessToken: 'fake-admin-access-token',
    refreshToken: 'fake-admin-refresh-token',
    success: true,
  };
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(adminUser));
});

Cypress.Commands.add('loginAsStaff', () => {
  const staffUser = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'staff@educhem.test',
    accountType: AccountType.Staff,
    accessToken: 'fake-staff-access-token',
    refreshToken: 'fake-staff-refresh-token',
    success: true,
  };
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(staffUser));
});

Cypress.Commands.add('loginAsStudent', () => {
  const studentUser = {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'student@educhem.test',
    accountType: AccountType.Student,
    accessToken: 'fake-student-access-token',
    refreshToken: 'fake-student-refresh-token',
    success: true,
  };
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(studentUser));
});
