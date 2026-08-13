import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('move_task.cy', () => {
  let teamMember, nonTeamMember, fixture
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser().then(createdUser => {
        teamMember = createdUser
      })
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
                  tasks: [{ name: 'Task' }, {}, {}],
                },
                { name: 'Other Poject', tasks: [] },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })

  describe('when moving a task as non-MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'POST',
        body: { destinationParentType: 'TASK' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when attempting other Verbs on move tasks end point', () => {
    it('should return METHOD_NOT_ALLOWED status for GET', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for PATCH', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
    it('should return METHOD_NOT_ALLOWED status for DELETE', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'DELETE',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })

  describe('when moving a task as a MTM', () => {
    it('should return OK status', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'POST',
        body: { destinationParentType: 'PROJECT' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when moving a task as a MATTER ADMIN', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(orgUsers.matterAdmin.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/move`,
        method: 'POST',
        body: { destinationParentType: 'PROJECT' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when moving a task as a MTM and a MATTER ADMIN', () => {
    it('should return OK status', () => {
      cy.login(orgUsers.matterAdminAndTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[2].id
        }/move`,
        method: 'POST',
        body: { destinationParentType: 'PROJECT' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when attempting to access a task from another project', () => {
    it('should return FORBIDDEN Request', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[1].id}/task/${
          fixture.tasks[0].id
        }/move`,
        method: 'POST',
        body: { destinationParentType: 'PROJECT' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
