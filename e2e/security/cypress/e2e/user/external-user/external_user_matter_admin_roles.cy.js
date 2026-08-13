import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('external_user_matter_admin_role.cy', () => {
  let externalUser, fixture, orgUsers, otherOrgUsers, template
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'Matter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project',
                tasks: [],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        createUser('', true, false, { isExternal: true }).then(u => {
          externalUser = u
          sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, u)
        })
      })
  })

  describe('when trying to create a external matter admin as an matter admin', () => {
    before(() => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/teammembers`,
        method: 'POST',
        body: {
          matter: fixture.matter.id,
          users: [externalUser.id],
        },
        failOnStatusCode: false,
      })
    })
    it('should not allow this action', () => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$').then(() =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }/matters`,
            method: 'POST',
            body: {
              matter: fixture.matter.id,
              user: externalUser.id,
            },
            failOnStatusCode: false,
          })
          .then(response =>
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          )
      )
    })
    it('should not allow this action', () => {
      cy.login('matter.creator@juralio.com', 'Password2Password2$').then(() =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }/matters`,
            method: 'POST',
            body: {
              matter: fixture.matter.id,
              users: [externalUser.id, orgUsers.teamMember.id],
            },
            failOnStatusCode: false,
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
            expect(response.body.length).to.eq(1)
          })
      )
    })
  })
  describe('when trying to make a matter admin an external user', () => {
    it('should not allow this action', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users/${orgUsers.matterAdmin.id}`,
        method: 'PATCH',
        body: {
          isExternal: true,
        },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(372)
      })
    })
  })
})
