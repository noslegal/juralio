import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import navigationPage from '../../../../../page/navigation/navigation_page'

const visitHelpers = new VisitHelpers()

describe('organisation_users_navigation.cy', () => {
  let organisation, orgAdminUser, user

  describe('when logged in as an Organisation Admin', () => {
    before(() => {
      createOrganisation('test', false)
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(() => createUser('', true, false))
        .then(createdUser => {
          user = createdUser
        })

        .then(() =>
          createUser('', true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
            createdUser => {
              orgAdminUser = createdUser
              sysadminAddUserToOrganisation(organisation, orgAdminUser).then(
                () => {
                  updateFTUE(orgAdminUser, {
                    hasSeenTaskmap: true,
                    hasSeenTimeline: true,
                    hasSeenInbox: true,
                  })
                }
              )
              cy.login(orgAdminUser.username)
              visitHelpers.visitHome()
              cy.get('body').type('{esc}')
              cy.get('[data-test=ftueSkipButton]').click()
            }
          )
        )
        .then(() => sysadminAddUserToOrganisation(organisation, user))
    })

    it('should have the standard navigation options', () => {
      navigationPage.get.homeOption().should('exist')
    })

    it('should render an option for "Organisation Users"', () => {
      cy.get('[data-test=header-org-menu-button]').should('exist')
    })

    describe('when  "Organisation Users" icon is clicked', () => {
      before(() => {
        cy.login(orgAdminUser.username)
        cy.get('[data-test=header-org-menu-button]').click()
        cy.wait(1000)
        cy.get('[data-test=header-org-accounts-button]').click()
      })

      it('should set the correct document title', () => {
        cy.title().should('eq', `Organisation | ${organisation.name} | Juralio`)
      })
    })
  })

  describe('when logged in as a standard User and visiting /organisation', () => {
    before(() => {
      cy.reload()
      cy.login(user.username, 'Password2Password2$')
      visitHelpers.visitOrganisation()
    })

    it('should display restricted message', () => {
      cy.get('[data-test=zero-state-text]')
        .should('be.visible')
        .should(
          'contain',
          'To manage your organisation, please contact an organisation admin'
        )
    })
  })
})
