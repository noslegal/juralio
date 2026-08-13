import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('delete_team_members.cy', () => {
  let teamMember, nonTeamMember, fixture
  before(() => {
    const createNonMTMUser = () =>
      createUser().then(createdUser => (nonTeamMember = createdUser))
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
            {
              name: 'Other Project',
              tasks: [],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    }

    createNonMTMUser().then(createTeamMemberUser).then(createSeedData)
  })

  const getUrl = (userId, project = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[project].id
    }/task/${fixture.tasks[0].id}/teammembers/${userId}`

  describe('when attempting to delete an existing TTM', () => {
    describe('whilst logged in as a non-MTM', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(teamMember.id),
          method: 'DELETE',
          body: {
            userId: teamMember.id,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('whilst logged in as an MTM', () => {
      it('should be successful and return NO_CONTENT status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(teamMember.id),
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NO_CONTENT)
        })
      })
    })
  })

  describe('when attempting to delete a TTM that doesnt exist', () => {
    describe('whilst logged in as a non-MTM', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(nonTeamMember.id),
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('whilst logged in as an MTM', () => {
      it('should return NOT_FOUND status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(nonTeamMember.id),
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.NOT_FOUND)
        })
      })
    })
  })

  describe('when attempting other Verbs on team members endpoint', () => {
    ;['GET', 'PUT', 'POST', 'PATCH'].forEach(method => {
      it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(123),
          method: method,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    })
  })

  describe('when attempting to access a task from another project', () => {
    it('should return FORBIDDEN', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: getUrl(teamMember.id, 1),
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when attempting to delete a real team member when you dont have permission', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: getUrl(teamMember.id),
        method: 'DELETE',
        body: {
          userId: teamMember.id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when attempting to delete a team member that does not exist when you dont have permission', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: getUrl(99999),
        method: 'DELETE',
        body: {
          userId: teamMember.id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
