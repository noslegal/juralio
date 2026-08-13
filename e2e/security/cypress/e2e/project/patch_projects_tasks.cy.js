// "/api/matter/$matter_id/workstreams/$project_id/tasks/$task_id/seen"
import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'

describe('patch_projects_tasks.cy', () => {
  let orgUsers, fixture, otherOrgUsers

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
            prefix: 'importantMatter',
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
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to get new tasks for a project', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a user who is NOT logged in', () => {
      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })

    describe('as a MATTER ADMIN who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN and a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`,
          method: 'PATCH',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/tasks/${
              fixture.tasks[0].id
            }/seen`,
            method: 'PATCH',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })

    describe('when attempting other verbs on the endpoint NOT logged in', () => {
      const verbs = ['POST', 'PUT', 'GET', 'DELETE']
      verbs.forEach(verb => {
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          const url = `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
        })
      })
    })

    describe('when attempting Verbs  on the endpoint logged in as MTM', () => {
      const verbs = ['GET', 'DELETE', 'PUT', 'POST']
      beforeEach(() => {
        cy.login(orgUsers.teamMember.username)
      })
      verbs.forEach(verb => {
        it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
          const url = `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/tasks/${
            fixture.tasks[0].id
          }/seen`
          cy.apiSpecRequest({
            url,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
        })
      })
    })
  })
})
