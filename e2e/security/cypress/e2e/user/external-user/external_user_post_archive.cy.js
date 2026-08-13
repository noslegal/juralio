import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('external_user_post_archive.cy', () => {
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
                    tasks: [{ name: 'task 1' }, { name: 'task 2' }],
                  },
                ],
              },
            }
            fixture = generateFixture(seed)
          })
        })
      })
  })
  describe('when trying to archive a task', () => {
    before(() => {
      console.log(orgUsers)
      cy.login(orgUsers.matterAdminAndTeamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'post 1', description: 'hello world', finalised: true }
      ).then(p => {
        post = p

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
    })
    it('should not allow  the archive', () => {
      cy.login(externalUser.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/post/${post.id}
        `,
        method: 'PATCH',
        body: { archive: true },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
