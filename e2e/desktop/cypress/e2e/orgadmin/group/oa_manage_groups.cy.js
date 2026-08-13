import HttpStatus from 'http-status-codes'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'

const visitHelpers = new VisitHelpers()

describe('oa_manage_groups.cy', () => {
  let organisation, standardUser, orgAdmin

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))
    const createOrgAdmin = () =>
      createUser(undefined, true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
      }).then(user => (orgAdmin = user))
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    cy.apiSpecRequest({
      url: `${Cypress.env('serverRootBaseUrl')}/api/admin/instance/settings`,
      method: 'PATCH',
      body: {
        enableUserConfirmation: false,
        enablePaymentPlatformIntegration: false,
      },
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
      createOrganisation('', false)
        .then(_organisation => {
          organisation = _organisation.body
        })
        .then(createStandardUser)
        .then(createOrgAdmin)
        .then(associateStandardUserWithOrg)
        .then(associateOrgAdminWithOrg)
    })
  })

  describe('the table of users', () => {
    before(navigateToOrgDetail)
    before(() => {
      cy.wait(2000)
      cy.get('[data-test=accounts]').click()
    })

    it('should have a group column in the users table', () => {
      cy.get('[role="columnheader"][data-field="groupName"]').should(
        'contain',
        'Group'
      )
    })

    describe('when viewing the group table', () => {
      before(() => {
        cy.contains('[role=tab]', 'Groups').click()
      })
      it('should display the group table', () => {
        cy.get('[datatest=group-table]').should('exist')
      })
      it('should have an accurate title', () => {
        cy.get('[data-test=table-subtitle]').should(
          'contain.text',
          'This organisation has 1 group'
        )
      })
      it('should have the correct group details', () => {
        cy.get('[dataTest=groupName]').should('contain.text', organisation.name)
        cy.get('[data-field="numUsers"]').eq(1).should('contain.text', '2')
      })

      describe('when creating a new group', () => {
        before(() => {
          cy.get('[data-test=new-group]').click()
        })

        it('should show the logo upload section', () => {
          cy.get('[data-test=name-field]').find('input').type('New Group')
          cy.contains('button', 'Upload Image').should('be.visible')
        })

        it('should show the upload helper text', () => {
          cy.contains('JPEG or PNG only. Maximum file size 200KB.').should(
            'be.visible'
          )
        })

        it('should allow you to confirm the group creation', () => {
          cy.get('[data-test="action-dialog-button"]').click()
        })

        it('should exist in the table', () => {
          cy.get('[dataTest=groupName]').should('contain.text', 'New Group')
        })

        describe('When trying to delete a group that isnt used', () => {
          before(() => {
            cy.get('[data-test=delete-group]').click()
          })
          it('should let you confirm the delete', () => {
            cy.get('[data-test="action-dialog-button"]').click()
          })
          it('should not be in the table', () => {
            cy.get('[dataTest=groupName]').should('not.contain.text', 'New Group')
          })
        })
      })

      describe('when clicking the group avatar to manage the logo', () => {
        before(() => {
          cy.get('[data-test=group-avatar]').first().click()
        })

        it('should open the group logo dialog', () => {
          cy.get('[data-test=groupImageModal]').should('be.visible')
        })

        it('should show the upload helper text', () => {
          cy.get('[role=dialog]').should(
            'contain.text',
            'JPEG or PNG only. Maximum file size 200KB.'
          )
        })

        it('should have the confirm button disabled when no image is selected', () => {
          cy.get('[data-test=action-dialog-button]').should('have.attr', 'disabled')
        })

        after(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })
      })
    })
  })
})
