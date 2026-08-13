import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('external_user_template_api.cy', () => {
  let externalUser, fixture, orgUsers, otherOrgUsers, template
  before(() => {
    createUser('', true, true)
    createUser('', true, true).then(u => {
      externalUser = u
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/users/${u.id}`,
        method: 'PATCH',
        body: {
          isExternal: true,
          forceUpdate: true,
        },
        failOnStatusCode: false,
      }).then(u => {
        // externalUser = u
        createDefaultOrgTestUsers()
          .then(users => {
            orgUsers = users
          })
          .then(() => createPopulatedDummyOrg('otherOrg'))
          .then(users => {
            otherOrgUsers = users
          })
          .then(() => {
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
                    tasks: [],
                  },
                ],
              },
            }
            fixture = generateFixture(seed)
          })
      })
    })
  })

  describe('when trying to list templates', () => {
    before(() => {
      cy.login(externalUser.username)
    })
    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'GET',
      }).then(response => expect(response.status).to.eq(HttpStatus.FORBIDDEN))
    })
  })
  describe('when trying to view a template', () => {
    let url
    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('Template', fixture.projects[0].id).then(body => {
        template = body
        url = `${Cypress.env('serverBaseUrl')}/projecttemplates/${template.id}`
      })
      cy.login(externalUser.username)
    })
    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: url,
        method: 'GET',
      }).then(response => expect(response.status).to.eq(HttpStatus.FORBIDDEN))
    })
  })
})
