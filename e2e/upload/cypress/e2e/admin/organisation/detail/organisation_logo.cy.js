import 'cypress-file-upload'
import { visitOrganisationDetail } from '../../../../../../helpers/admin/admin_visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('organisation_logo.cy', () => {
  let organisation, standardUser

  const navigateToOrg = () => {
    cy.intercept({ method: 'POST', url: '*/organisations/*/logo' }, [], {
      status: 400,
    }) //stub out posts to logo
    cy.intercept({ method: 'GET', url: '*/organisations/*/logo' }, [], {
      status: 400,
    }) //stub out gets to logo

    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    visitOrganisationDetail(organisation.name)
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)

    createOrganisation()
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(associateStandardUserWithOrg)
  })

  before(navigateToOrg)
  describe('when editing an org with no logo', () => {
    it('should show the template logo', () => {
      cy.get('[data-test=organisation-avatar]', { timeout: 60000 })
        .children()
        .get('svg')
        .should('exist')
    })
  })
  describe('when clicking the avatar', () => {
    before(() => {
      cy.get('[data-test=organisation-avatar]').eq(0).click()
    })
    it('should open the image modal', () => {
      cy.get('[data-test=organisationImageModal]').should('be.visible')
    })
    it('should have the confirm button disabled', () => {
      cy.get('[data-test=action-dialog-button]').should('have.attr', 'disabled')
    })
  })
  describe('when selecting an image', () => {
    before(() => {
      cy.get('[data-test=hidden-logo-input]').attachFile('juralio.png')
    })
    it('should display the file', () => {
      cy.get('[data-test=organisation-logo-preview]').should('be.visible')
      cy.get('[data-test=organisationLogoFileName]').should('be.visible')
      cy.get('[data-test=organisationLogoFileName]').should(
        'contain',
        'juralio.png'
      )
    })
  })

  describe('when opening the modal with an existing logo', () => {
    before(() => {
      cy.intercept(
        { method: 'GET', url: '*/organisations/' + organisation.id + '/logo' },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.intercept(
        { method: 'POST', url: '*/organisations/' + organisation.id + '/logo' },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=organisation-avatar]').eq(0).click()
    })
    it('should show the existing logo', () => {
      cy.get('[data-test=organisation-logo-preview]', {
        timeout: 60000,
      }).should('be.visible')
      cy.get('[data-test=delete-logo-button]').should('be.visible')
    })
  })
  describe('when selecting an image', () => {
    before(() => {
      cy.get('[data-test=hidden-logo-input]').attachFile('juralio.png')
    })
    it('should display the file', () => {
      cy.get('[data-test=organisation-logo-preview]').should('be.visible')
      cy.get('[data-test=organisationLogoFileName]').should('be.visible')
      cy.get('[data-test=organisationLogoFileName]').should(
        'contain',
        'juralio.png'
      )
      cy.get('[data-test=delete-logo-button]').should('not.exist')
    })
  })
  describe('when deleting a logo', () => {
    before(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '*/organisations/' + organisation.id + '/logo',
        },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.intercept(
        {
          method: 'POST',
          url: '*/organisations/' + organisation.id + '/logo',
        },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.get('[data-test=action-dialog-button]').click()

      cy.intercept(
        {
          method: 'GET',
          url: '*/organisations/' + organisation.id + '/logo',
        },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.intercept(
        {
          method: 'POST',
          url: '*/organisations/' + organisation.id + '/logo',
        },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.intercept(
        {
          method: 'DELETE',
          url: '*/organisations/' + organisation.id + '/logo',
        },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.get('[data-test=organisation-avatar]').eq(0).click()

      cy.get('[data-test=cancel-dialog-button]').click()
      cy.get('[data-test=organisation-avatar]').click()
      cy.get('[data-test=delete-logo-button]').click()
      cy.intercept(
        { method: 'GET', url: '*/organisations/' + organisation.id + '/logo' },
        [],
        {
          status: 400,
        }
      ) //stub out gets to logo
      cy.get('[data-test=organisation-avatar]', { timeout: 60000 })
        .eq(0)
        .click()
    })
    it('should no longer have a logo', () => {
      cy.get('[data-test=organisation-logo-preview]').should('not.exist')
      cy.get('[data-test=delete-logo-button]').should('not.exist')
    })
  })
  describe('when updating to a new logo', () => {
    before(() => {
      cy.intercept(
        { method: 'GET', url: '*/organisations/' + organisation.id + '/logo' },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.intercept(
        { method: 'POST', url: '*/organisations/' + organisation.id + '/logo' },
        'fixture:juralio.png'
      ) //stub out gets to logo

      cy.get('[data-test=hidden-logo-input]').attachFile('juralio.png')
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(5000)
      cy.get('[data-test=organisation-avatar]').click()
      cy.get('[data-test=hidden-logo-input]').attachFile('juralio_2.png')
      cy.intercept(
        { method: 'GET', url: '*/organisations/' + organisation.id + '/logo' },
        'fixture:juralio.png'
      ) //stub out gets to logo
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=organisation-avatar]').eq(0).click()
    })
    it('should show the new logo', () => {
      cy.get('[data-test=organisation-logo-preview]').should('be.visible')
      cy.get('[data-test=delete-logo-button]').should('be.visible')
    })
  })
  describe('when attempting to upload an invalid image type', () => {
    before(() => {
      cy.get('[data-test=hidden-logo-input]').attachFile('juralio.gif')
    })
    it('should display an error', () => {
      cy.get('[data-test=organisation-logo-error-text]').should('be.visible')
      cy.get('[data-test=organisation-logo-error-text]').should(
        'contain',
        'Invalid file type. Please upload a JPEG or a PNG.'
      )
    })
  })
})
