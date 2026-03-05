declare namespace Cypress {
  interface Chainable {
    /**
     * Authenticate via the API and store the user in sessionStorage.
     * @param email - User email
     * @param password - User password
     */
    login(email: string, password: string): Chainable<void>;

    /**
     * Set sessionStorage with a mock Admin user (accountType 0).
     */
    loginAsAdmin(): Chainable<void>;

    /**
     * Set sessionStorage with a mock Staff user (accountType 2).
     */
    loginAsStaff(): Chainable<void>;

    /**
     * Set sessionStorage with a mock Student user (accountType 1).
     */
    loginAsStudent(): Chainable<void>;
  }
}
