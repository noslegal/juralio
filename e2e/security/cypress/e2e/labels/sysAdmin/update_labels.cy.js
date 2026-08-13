import HttpStatus from 'http-status-codes'
import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('update_labels.cy', () => {
  let teamMember, fixture, matterLabel, orgLabel, organisation, matter
  before(() => {
    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(() => {
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] })
          .then(createdUser => {
            teamMember = createdUser
          })
          .then(() => {
            sysadminAddUserToOrganisation(organisation, teamMember).then(() => {
              cy.login(teamMember)
              createMatter('testMatter').then(m => {
                matter = m
                cy.apiSpecRequest({
                  url: `${Cypress.env('serverBaseUrl')}/matter/${
                    matter.id
                  }/labels`,
                  method: 'POST',
                  body: {
                    name: 'matterLabel',
                    type: 'workflow',
                  },
                }).then(response => {
                  matterLabel = response.body
                })
                cy.apiSpecRequest({
                  url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels`,
                  method: 'POST',
                  body: {
                    name: 'organisationLabel',
                    type: 'workflow',
                  },
                }).then(response => {
                  orgLabel = response.body
                })
              })
            })
          })
      })
  })

  describe('as a sysadmin', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
    })
    it('should not allow me to update the system level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/labels/system/1`,
        method: 'PATCH',
        body: {
          name: 'UpdatedName',
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow me to update org level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/${
          organisation.id
        }/labels/${orgLabel.id}`,
        method: 'PATCH',
        body: { name: 'update org name' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
    it('should not allow me to update matter level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/labels/${
          matterLabel.id
        }`,
        method: 'PATCH',
        body: { name: 'update matter name' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })
})
