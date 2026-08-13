import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('remove_follower.cy', () => {
  let taskFollower, taskTeamMember, nonMatterTeamUser, fixture
  before(() => {
    const createTaskFollowerUser = () =>
      createUser().then(createdUser => (taskFollower = createdUser))

    const createTaskTeamMemberUser = () =>
      createUser().then(createdUser => (taskTeamMember = createdUser))

    const createNonMatterMemberUser = () =>
      createUser().then(createdUser => (nonMatterTeamUser = createdUser))

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
            { name: 'Other Project', tasks: [] },
          ],
        },
      }
      fixture = generateFixture(seed)
    }

    createNonMatterMemberUser()
      .then(createTaskTeamMemberUser)
      .then(createTaskFollowerUser)
      .then(createSeedData)
  })

  const getUrl = (project = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[project].id
    }/task/${fixture.tasks[0].id}/followers/${taskFollower.id}`

  const getNonMatterTeamUserUrl = (project = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[project].id
    }/task/${fixture.tasks[0].id}/followers/${nonMatterTeamUser.id}`

  describe('when user1 attempting to remove user2 from the follower list', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(taskTeamMember.username)
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when attempting to remove themself as a follower', () => {
    it('should return NO_CONTENT status', () => {
      cy.login(taskFollower.username)
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.NO_CONTENT)
      })
    })
  })

  describe('when attempting to remove themself as a follower when not a MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonMatterTeamUser.username)
      cy.apiSpecRequest({
        url: getNonMatterTeamUserUrl(),
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when attempting to remove themself as a follower when not logged in', () => {
    before(() => {
      cy.reload()
    })
    it('should return UNAUTHORIZED status', () => {
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when attempting other Verbs on delete follower endpoint', () => {
    ;['GET', 'POST', 'PUT', 'PATCH'].forEach(method => {
      it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
        cy.login(taskFollower.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: method,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })
  })

  describe('when attempting to access a task from another project', () => {
    it('should return FORBIDDEN', () => {
      cy.login(taskFollower.username)
      cy.apiSpecRequest({
        url: getUrl(1),
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
