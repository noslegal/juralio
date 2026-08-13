import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('archive_task.cy', () => {
  let users = {
    ADMIN_USER: {
      role: 'SYS ADMIN',
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
    STANDARD_USER: {
      role: 'MATTER CREATOR',
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
    NON_MATTER_TEAM_MEMBER: {
      role: 'NON_MATTER_TEAM_MEMBER',
    },
    MATTER_TEAM_MEMBER: {
      role: 'MATTER_TEAM_MEMBER',
    },
    MATTER_TEAM_MEMBER_FROM_OTHER_ORG: {
      role: 'MATTER_TEAM_MEMBER_FROM_OTHER_ORG',
    },
  }

  let testCases = [
    {
      user: users.ADMIN_USER,
      expectedStatus: HttpStatus.FORBIDDEN,
      taskIndex: 0,
    },
    {
      user: users.NON_MATTER_TEAM_MEMBER,
      expectedStatus: HttpStatus.FORBIDDEN,
      taskIndex: 0,
    },
    {
      user: users.STANDARD_USER,
      expectedStatus: HttpStatus.OK,
      taskIndex: 0,
    },
    {
      user: users.MATTER_TEAM_MEMBER,
      expectedStatus: HttpStatus.OK,
      taskIndex: 1, // Since the previous test case archived the task, we need a new task
    },
    {
      user: users.MATTER_TEAM_MEMBER_FROM_OTHER_ORG,
      expectedStatus: HttpStatus.FORBIDDEN,
      taskIndex: 0,
    },
  ]

  let orgUsers, otherOrgUsers, fixture, url
  before(() => {
    createDefaultOrgTestUsers()
      .then(createdUsers => {
        orgUsers = createdUsers
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project 1',
                tasks: [{}, {}, {}, {}, {}, {}, {}, {}],
              },
              {
                name: 'Other Project',
                tasks: [],
              },
            ],
          },
        }
        fixture = generateFixture(seed)

        users.MATTER_TEAM_MEMBER.username = orgUsers.teamMember.username
        users.MATTER_TEAM_MEMBER_FROM_OTHER_ORG.username =
          otherOrgUsers.teamMember.username
        users.NON_MATTER_TEAM_MEMBER.username = orgUsers.nonTeamMember.username
      })
  })

  describe('when archiving a task', () => {
    testCases.forEach(testCase => {
      describe(`when as a ${testCase.user.role}`, () => {
        before(() => {
          url = `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[testCase.taskIndex].id
          }/archive`

          if (testCase.user.password) {
            cy.login(testCase.user.username, testCase.user.password)
          } else {
            cy.login(testCase.user.username)
          }
        })

        it(`should return ${HttpStatus.getStatusText(
          testCase.expectedStatus
        )} status`, () => {
          cy.apiSpecRequest({
            url,
            method: 'POST',
          }).then(response => {
            expect(response.status).to.eq(testCase.expectedStatus)
          })
        })
      })
    })
  })

  describe('when archiving a task as non-MTM', () => {
    before(() => {
      cy.login(orgUsers.nonTeamMember.username)
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[2].id
      }/archive`
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when attempting other Verbs on archive tasks end point', () => {
    beforeEach(() => {
      cy.login(orgUsers.teamMember.username)
    })
    it('should return METHOD_NOT_ALLOWED status for GET', () => {
      cy.apiSpecRequest({
        url,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
      cy.apiSpecRequest({
        url,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
      cy.apiSpecRequest({
        url,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when archiving a task as a MTM', () => {
    it('should return OK status', () => {
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[3].id
      }/archive`
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when archiving a task as a MA and MTM', () => {
    before(() => {
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[4].id
      }/archive`
    })

    it('should return OK status', () => {
      cy.login(orgUsers.matterAdminAndTeamMember.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when archiving a task as a MA', () => {
    before(() => {
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[5].id
      }/archive`
    })
    it('should return FORBIDDEN status', () => {
      cy.login(orgUsers.matterAdmin.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('as users from a DIFFERENT ORGANISATION', () => {
    getDummyOrgUserProperties().forEach(c => {
      it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
        cy.login(otherOrgUsers[c.name].username)
        cy.apiSpecRequest({
          url,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when attempting to access a task from another project', () => {
    before(() => {
      cy.login(orgUsers.nonTeamMember.username)
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[1].id}/task/${
        fixture.tasks[6].id
      }/archive`
    })
    it('should return BAD Request', () => {
      cy.login(orgUsers.matterAdminAndTeamMember.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
