const SELECTORS = {
  NAVIGATION_MENU: '[data-test=navigation-menu]',
  HOME_OPTION: '[data-test=home-navigation]',
  TEMPLATES_OPTION: '[data-test=templates-navigation]',
  ORGANISATIONS_OPTION: '[data-test=organisations]',
  HELP_OPTION: '[data-test=help-navigation]',
  ORGANISATIONS_USERS: '[data-test=organisation-navigation]',
  GLOBAL_USERS_OPTION: '[data-test=accounts]',
}

export default {
  get: {
    allNavigationRoutes() {
      return cy.get(SELECTORS.NAVIGATION_MENU).find('a')
    },

    homeOption() {
      return cy.get(SELECTORS.HOME_OPTION)
    },

    templatesOption() {
      return cy.get(SELECTORS.TEMPLATES_OPTION)
    },

    organisationsOption() {
      return cy.get(SELECTORS.ORGANISATIONS_OPTION)
    },

    globalUsersOption() {
      return cy.get(SELECTORS.GLOBAL_USERS_OPTION)
    },

    helpOption() {
      return cy.get(SELECTORS.HELP_OPTION)
    },

    organisationsUsers() {
      return cy.get(SELECTORS.ORGANISATIONS_USERS)
    },
  },
}
