import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('add_team_members.cy', () => {
  let disabledUser, teamMember, otherTeamMember, nonTeamMember, fixture
  before(() => {
    const createNonMTMUser = () =>
      createUser().then(createdUser => (nonTeamMember = createdUser))
    const createTeamMemberUser = () =>
      createUser().then(createdUser => (teamMember = createdUser))
    const createOtherTeamMemberUser = () =>
      createUser().then(createdUser => (otherTeamMember = createdUser))
    const createSeedData = () => {
      const seed = {
        matter: {
          teamMembers: [teamMember, otherTeamMember],
          matterAdmins: [teamMember],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'Task' }],
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
    const createDisabledUser = () => {
      createUser(undefined, false, false, { enabled: false }).then(
        createdUser => {
          disabledUser = createdUser
        }
      )
    }

    createNonMTMUser()
      .then(createTeamMemberUser)
      .then(createOtherTeamMemberUser)
      .then(createSeedData)
      .then(createDisabledUser)
  })

  const getUrl = (project = 0) =>
    `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/workstreams/${
      fixture.projects[project].id
    }/task/${fixture.tasks[0].id}/teammembers`

  describe('when attempting to add a valid MTM as a TTM', () => {
    describe('whilst logged in as a non-MTM', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: teamMember,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('whilst logged in as an MTM', () => {
      it('should return OK status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: otherTeamMember,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when logged in as an MTM and try to add an existing user', () => {
      it('should return OK status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: otherTeamMember,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when attempting to add a non-MTM as a TTM', () => {
    describe('whilst logged in as a non-MTM', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: nonTeamMember,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('whilst logged in as an MTM', () => {
      it('should return BAD_REQUEST status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: nonTeamMember,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })

  describe('when attempting to add an inactive user account as a TTM', () => {
    describe('whilst logged in as a non-MTM', () => {
      it('should return FORBIDDEN status', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: disabledUser,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('whilst logged in as an MTM', () => {
      it('should return BAD_REQUEST status', () => {
        cy.login(teamMember.username)
        cy.apiSpecRequest({
          url: getUrl(),
          method: 'POST',
          body: {
            user: disabledUser,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })

  describe('when attempting other Verbs on team members endpoint', () => {
    ;['GET', 'PUT', 'PATCH', 'DELETE'].forEach(method => {
      it(`should return METHOD_NOT_ALLOWED status for ${method}`, () => {
        cy.login(teamMember.username)
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
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: getUrl(1),
        method: 'POST',
        body: {
          user: otherTeamMember,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
