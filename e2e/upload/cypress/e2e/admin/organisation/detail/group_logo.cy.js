import 'cypress-file-upload'
import { visitOrganisationDetail } from '../../../../../../helpers/admin/admin_visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../../helpers/organisation/organisation_api_helper'
import { createUser, updateFTUE } from '../../../../../../helpers/users/user_api_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'

const visitHelpers = new VisitHelpers()

describe('group_logo.cy', () => {
  let organisation, orgAdmin, newGroupId

  const navigateToGroupsTab = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenOrgAdmin: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitOrgUsers()
    cy.wait(2000)
    cy.get('[data-test=accounts]').click()
    cy.contains('[role=tab]', 'Groups').click()
  }

  before(() => {
    const createOrgAdmin = () =>
      createUser(undefined, true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_ORG_OWNER'],
      }).then(user => (orgAdmin = user))
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('group_logo_', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createOrgAdmin)
      .then(associateOrgAdminWithOrg)
  })

  describe('when viewing the group table', () => {
    before(navigateToGroupsTab)

    describe('when creating a new group', () => {
      before(() => {
        cy.get('[data-test=new-group]').click()
        cy.get('[data-test=name-field]').find('input').type('Logo Test Group')
        cy.get('[data-test="action-dialog-button"]').click()
        cy.wait(1000)
      })

      it('should show the new group in the table', () => {
        cy.get('[dataTest=groupName]').should('contain.text', 'Logo Test Group')
      })
    })

    describe('when clicking the group avatar to open the logo dialog', () => {
      before(() => {
        cy.get('[data-test=group-avatar]').last().click()
      })

      it('should open the image modal', () => {
        cy.get('[data-test=groupImageModal]').should('be.visible')
      })

      it('should show the upload helper text', () => {
        cy.get('[data-test=groupImageModal]')
          .closest('[role=dialog]')
          .should('contain.text', 'JPEG or PNG only. Maximum file size 200KB.')
      })

      it('should have the confirm button disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('have.attr', 'disabled')
      })
    })

    describe('when selecting a valid image', () => {
      before(() => {
        cy.get('[data-test=hidden-group-logo-input]').attachFile('juralio.png')
      })

      it('should display the image preview', () => {
        cy.get('[data-test=group-logo-preview]').should('be.visible')
      })

      it('should enable the confirm button', () => {
        cy.get('[data-test=action-dialog-button]').should('not.have.attr', 'disabled')
      })
    })

    describe('when confirming the logo upload', () => {
      before(() => {
        cy.intercept(
          { method: 'POST', url: '*/organisations/*/group/*/logo' },
          { statusCode: 200 }
        ).as('uploadGroupLogo')
        cy.intercept(
          { method: 'GET', url: '*/organisations/*/group/*/logo' },
          'fixture:juralio.png'
        ).as('getGroupLogo')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@uploadGroupLogo')
      })

      it('should close the dialog', () => {
        cy.get('[data-test=groupImageModal]').should('not.exist')
      })
    })

    describe('when reopening the logo dialog for a group with a logo', () => {
      before(() => {
        cy.intercept(
          { method: 'GET', url: '*/organisations/*/group/*/logo' },
          'fixture:juralio.png'
        ).as('getGroupLogo')
        cy.get('[data-test=group-avatar]').last().click()
        cy.wait('@getGroupLogo')
      })

      it('should show the existing logo', () => {
        cy.get('[data-test=group-logo-preview]').should('be.visible')
      })

      it('should show the delete logo button', () => {
        cy.get('[data-test=delete-group-logo-button]').should('be.visible')
      })
    })

    describe('when deleting the logo', () => {
      before(() => {
        cy.intercept(
          { method: 'DELETE', url: '*/organisations/*/group/*/logo' },
          { statusCode: 200 }
        ).as('deleteGroupLogo')
        cy.intercept(
          { method: 'GET', url: '*/organisations/*/group/*/logo' },
          { statusCode: 404 }
        )
        cy.get('[data-test=delete-group-logo-button]').click()
        cy.wait('@deleteGroupLogo')
      })

      it('should close the dialog', () => {
        cy.get('[data-test=groupImageModal]').should('not.exist')
      })

      describe('when reopening the logo dialog', () => {
        before(() => {
          cy.get('[data-test=group-avatar]').last().click()
        })

        it('should no longer show the existing logo', () => {
          cy.get('[data-test=group-logo-preview]').should('not.exist')
          cy.get('[data-test=delete-group-logo-button]').should('not.exist')
        })

        after(() => {
          cy.get('[data-test=cancel-dialog-button]').click()
        })
      })
    })

    describe('when attempting to upload an invalid file type', () => {
      before(() => {
        cy.get('[data-test=group-avatar]').last().click()
        cy.get('[data-test=hidden-group-logo-input]').attachFile('juralio.gif')
      })

      it('should display a file type error', () => {
        cy.get('[data-test=group-logo-error-text]').should('be.visible')
        cy.get('[data-test=group-logo-error-text]').should(
          'contain',
          'Invalid file type. Please upload a JPEG or a PNG.'
        )
      })

      it('should keep the confirm button disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('have.attr', 'disabled')
      })

      after(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
      })
    })
  })
})
