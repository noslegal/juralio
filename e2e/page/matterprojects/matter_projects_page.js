const SELECTORS = {
  PORTAL_CONTAINER: '.FT-portal',
  APP: '.app',
  NO_CONTENT_MESSAGE: '.NoContentMessage',
  MATTER: '[data-test=matter]',
  ADD_MATTER_BUTTON: '[data-test=addMatterButton]',
}

export default {
  SELECTORS,
  get: {
    portalContainer() {
      return cy.get(SELECTORS.PORTAL_CONTAINER)
    },

    noContentMessage() {
      return cy.get(SELECTORS.NO_CONTENT_MESSAGE)
    },

    allMatters() {
      return cy.get(SELECTORS.MATTER)
    },

    addMatterButton() {
      return cy.get(SELECTORS.ADD_MATTER_BUTTON)
    },

    matterList() {
      return cy.get('[data-test=matterList]')
    },
  },
}
