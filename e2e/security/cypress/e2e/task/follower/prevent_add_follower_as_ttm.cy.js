import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('prevent_add_follower_as_ttm.cy', () => {
  let taskFollower, taskTeamMember, fixture
  before(() => {
    const createTaskFollowerUser = () =>
      createUser().then(createdUser => (taskFollower = createdUser))
    const createTaskTeamMemberUser = () =>
      createUser().then(createdUser => (taskTeamMember = createdUser))
    const createSeedData = () => {
      const seed = {
        matter: {
          teamMembers: [taskTeamMember, taskFollower],
          matterAdmins: [taskTeamMember, taskFollower],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'Task', followers: [taskFollower] }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    }

    createTaskFollowerUser().then(createTaskTeamMemberUser).then(createSeedData)
  })

  const getUrl = () =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[0].id
    }/task/${fixture.tasks[0].id}/teammembers`

  describe('when attempting to add follower as a TTM', () => {
    it('should return BAD_REQUEST status', () => {
      cy.login(taskFollower.username)
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'POST',
        body: { user: taskFollower },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
