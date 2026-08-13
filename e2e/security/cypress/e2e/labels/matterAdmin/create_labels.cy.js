import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { addMatterAdmin } from '../../../../../helpers/matterprojects/matter_api_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_labels.cy', () => {
  let organisation, matteradmin
  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels.body
      orgAdminUser = result.orgAdminUser
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
      createUser('', true, false).then(user => {
        matteradmin = user
        cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
          sysadminAddUserToOrganisation(organisation, matteradmin).then(() => {
            addMatterAdmin(fixture.matter.id, matteradmin.id, orgMC.username)
          })
        })
      })
    })
  })

  describe('as a matter admin', () => {
    it('should allow me to create matter level labels', () => {
      cy.login(matteradmin).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/labels`,
          method: 'POST',
          body: {
            name: 'created',
            type: 'risk',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
    it('should not allow me to create organisation and system level labels', () => {
      cy.login(matteradmin).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
          method: 'POST',
          body: {
            name: 'created',
            type: 'risk',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
  describe('when not a matter editor', () => {
    it('should not let me create a user_defined label', () => {
      cy.login(matteradmin).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/labels`,
          method: 'POST',
          body: {
            name: 'created',
            type: 'user_defined',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
  describe('when  a matter editor', () => {
    it('should  let me create a user_defined label', () => {
      cy.login(orgAdminUser).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/labels`,
          method: 'POST',
          body: {
            name: 'AAA',
            type: 'user_defined',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
    it('should not let me create duplicate user_defined label', () => {
      cy.login(orgAdminUser).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/labels`,
          method: 'POST',
          body: {
            name: 'AAA',
            type: 'user_defined',
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
})
