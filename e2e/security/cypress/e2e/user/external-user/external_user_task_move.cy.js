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

describe('external_user_task_move.cy', () => {
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
                u,
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
  describe('when trying to move a task', () => {
    it('should not allow  the move', () => {
      cy.login(externalUser.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'POST',
        body: {
          destinationParentId: fixture.tasks[1].id,
          destinationParentType: 'TASK',
          destinationProjectId: fixture.projects[0].id,
          maintainTaskConsistency: false,
        },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
