import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('unarchive_task.cy', () => {
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
                tasks: [{ name: 'Task' }],
              },
              { name: 'Other Project', tasks: [] },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        // Archive a task to use to unarchive
        url = `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/archive`
        cy.login(orgUsers.matterAdminAndTeamMember.username)
        cy.apiSpecRequest({
          url,
          method: 'POST',
        })
      })
      .then(() => {
        url = `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/unarchive`
      })
  })

  describe('when unarchiving a task as non-MTM', () => {
    before(() => {
      cy.login(orgUsers.nonTeamMember.username)
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

  describe('when attempting other Verbs on unarchive tasks end point', () => {
    beforeEach(() => {
      cy.login(orgUsers.teamMember.username)
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

  describe('when unarchiving a task as a MTM', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when unarchiving a task as a MA', () => {
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
    it('should return FORBIDDEN', () => {
      cy.login(orgUsers.teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[1].id}/task/${
          fixture.tasks[0].id
        }/unarchive`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
