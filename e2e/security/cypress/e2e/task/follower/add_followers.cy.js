import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('add_followers.cy', () => {
  let taskTeamMember, matterTeamMember, nonMatterTeamMember, fixture
  before(() => {
    const createNonMTMUser = () =>
      createUser().then(createdUser => (nonMatterTeamMember = createdUser))
    const createTaskTeamMemberUser = () =>
      createUser().then(createdUser => (taskTeamMember = createdUser))
    const createMatterTeamMemberUser = () =>
      createUser().then(createdUser => (matterTeamMember = createdUser))
    const createSeedData = () => {
      const seed = {
        matter: {
          teamMembers: [taskTeamMember, matterTeamMember],
          matterAdmins: [taskTeamMember, matterTeamMember],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'Task' }],
            },
            { project: 'Other Project', tasks: [] },
          ],
        },
      }
      fixture = generateFixture(seed)
    }

    createNonMTMUser()
      .then(createMatterTeamMemberUser)
      .then(createTaskTeamMemberUser)
      .then(createSeedData)
  })

  const getUrl = (project = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[project].id
    }/task/${fixture.tasks[0].id}/followers`

  describe('when attempting to follow a task', () => {
    describe('whilst logged in as a non-MTM', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonMatterTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('whilst logged in as an MTM', () => {
      it('should return OK status', () => {
        cy.login(matterTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
      it('should return BAD_REQUEST status on second attempt to follow', () => {
        cy.login(matterTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })

  describe('when attempting to become a follower when not logged in', () => {
    before(() => {
      cy.reload()
    })
    it('should return UNAUTHORIZED status', () => {
      cy.apiSpecRequest({
        url: getUrl(),
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })

  describe('when attempting other Verbs on followers endpoint', () => {
    ;['GET', 'PUT', 'PATCH'].forEach(method => {
      it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
        cy.login(matterTeamMember.username)
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
      cy.login(matterTeamMember.username)
      cy.apiSpecRequest({
        url: getUrl(1),
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
