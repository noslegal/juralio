import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('external_user_post_move.cy', () => {
  let externalUser, fixture, orgUsers, otherOrgUsers, template, post
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
    createUser('', true, false, { isExternal: true }).then(u => {
      externalUser = u
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, u).then(
        () => {
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
        }
      )
    })
  })
  describe('when trying to move a post', () => {
    before(() => {
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'post 1', description: 'hello world', finalised: false }
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
        })
      })
    })
    it('should not allow  the move', () => {
      cy.login(externalUser.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/post/${post.id}/move`,
        method: 'POST',
        body: {
          newTaskId: fixture.tasks[1].id,
        },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
