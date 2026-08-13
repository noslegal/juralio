import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('prevent_add_ttm_as_follower.cy', () => {
  let teamMember, fixture
  before(() => {
    const createTeamMemberUser = () =>
      createUser().then(createdUser => (teamMember = createdUser))
    const createSeedData = () => {
      const seed = {
        matter: {
          teamMembers: [teamMember],
          matterAdmins: [teamMember],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'Task', teamMembers: [teamMember] }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    }

    createTeamMemberUser().then(createSeedData)
  })

  const getUrl = () =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[0].id}/followers`

  describe('when attempting to follow a task as a TTM', () => {
    it('should return BAD_REQUEST status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
