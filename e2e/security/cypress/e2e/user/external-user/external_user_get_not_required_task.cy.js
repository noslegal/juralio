import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('external_user_get_not_required_taske.cy', () => {
  let externalUser, fixture, orgUsers, otherOrgUsers, template, post
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
        createUser('', true, true).then(u => {
          externalUser = u
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/users/${u.id}`,
            method: 'PATCH',
            body: {
              isExternal: true,
              forceUpdate: true,
            },
            failOnStatusCode: false,
          }).then(res => {
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
                    tasks: [
                      {
                        name: 'task 1',
                        properties: { status: 'task-not-required' },
                      },
                      { name: 'task 2' },
                    ],
                  },
                ],
              },
            }
            fixture = generateFixture(seed)
          })
        })
      })
  })
  describe('when trying to get a task', () => {
    before(() => {
      cy.login(orgUsers.matterAdminAndTeamMember.username)

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
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not allow  the archive', () => {
      cy.login(externalUser.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}/
        `,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        console.log(response)
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
