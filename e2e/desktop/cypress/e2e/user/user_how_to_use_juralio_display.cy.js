import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
    createOrganisation,
    sysadminAddUserToOrganisation
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let user
let standardUser
const visitHelpers = new VisitHelpers()

describe('user_how_to_use_juralio.cy', () => {
  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))

    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(associateStandardUserWithOrg)
  })

  describe('when visiting the user settings', () => {
    before(() => {
      cy.login(standardUser)
      visitHelpers.visitHowToUseJuralio()
    })

    it('should show the two tabs and display the tip cards', () => {
      cy.get('[data-test=tipCards]').should('be.visible')
      cy.get('[data-test=supportAndFeedback]').should('be.visible')

      cy.get('[data-test=panel-title]').should('have.text', 'Tip Cards')
      cy.get('[data-test=panel-caption]').should(
        'have.text',
        'Quick tips on what you can do in Juralio'
      )
      cy.get('[data-test=tip-card]').should('be.visible')
    })

    describe('when visiting the support tab', () => {
      before(() => {
        cy.get('[data-test=supportAndFeedback]').click()
      })
      it('should have the correct text and an image', () => {
        cy.get('[data-test=panel-title]').should(
          'have.text',
          'Support and feedback'
        )
        cy.get('[data-test=panel-caption]').should(
          'have.text',
          'Get in touch with any problems or suggestions'
        )
        cy.get('[data-test=support-and-feedback-text]').should(
          'have.text',
          "Problems or suggestions? We'd love to hear from you. Email us at support@example.com. We aim to respond in the same or next business day."
        )
        cy.get('[data-test=support-and-feedback-email]').should('exist')
        cy.get('[data-test=support-and-feedback-image]').should('exist')
      })
    })
  })
})
