import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('external_user_archive_task.cy', () => {
  let externalUser, fixture, orgUsers, otherOrgUsers, template
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
    createUser('', true, false, { isExternal: true }).then(u => {
      externalUser = u
      sysadminAddUserToOrganisation(
        { id: otherOrgUsers.teamMember.organisation.id },
        u
      ).then(() => {
        const seed = {
          matter: {
            prefix: 'Matter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project',
                tasks: [{ name: 'task 1' }, { name: 'task 2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('when trying to archive a task', () => {
    before(() => {
      cy.login(orgUsers.matterAdminAndTeamMember.username)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/teammembers`,
        method: 'POST',
        body: {
          matter: fixture.matter.id,
          users: [externalUser.id],
        },
        failOnStatusCode: false,
      })
    })
    it('should not allow  the archive', () => {
      cy.login(externalUser.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/archive`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when trying to unarchive a task', () => {
    before(() => {
      let url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[1].id
      }/archive`
      console.log(orgUsers.matterAdminAndTeamMember)
      cy.login(orgUsers.matterAdminAndTeamMember.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not allow  the unarchive', () => {
      cy.login(externalUser.username, 'Password2Password2$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/unarchive`,
        method: 'POST',
        body: {
          destinationParentId: fixture.tasks[0].id,
          destinationParentType: 'TASK',
          destinationProjectId: fixture.projects[0].id,
          maintainTaskConsistency: false,
        },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
