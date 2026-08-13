import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('url_validation_settings_spec', () => {
  let user, fixture, appPage
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'detailed_display',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Alpha Project',
              tasks: [
                {
                  name: 'Moon',
                },
                { name: 'Stars' },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when validation is enabled', () => {
    before(() => {
      const url = `${Cypress.env(
        'serverRootBaseUrl'
      )}/api/admin/instance/settings`
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url,
        method: 'PATCH',
        body: {
          enableUrlValidation: true,
        },
      })
    })
    it('should not be able to add a post with an invalid url', () => {
      cy.login(user.username)
      const url = `${Cypress.env('serverRootBaseUrl')}/api/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}/posts`
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: {
          name: 'resource 1',
          url: 'http://absolutejunk',
        },
        failOnstatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(400)
      })
    })
  })
  describe('when validation is not enabled', () => {
    before(() => {
      const url = `${Cypress.env(
        'serverRootBaseUrl'
      )}/api/admin/instance/settings`
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        url,
        method: 'PATCH',
        body: {
          enableUrlValidation: false,
        },
      })
    })
    it('should  be able to add a resource with an invalid url', () => {
      cy.login(user.username)
      const url = `${Cypress.env('serverRootBaseUrl')}/api/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/resources`
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: {
          image: '',
          name: 'resource 1',
          url: 'http://absolutejunk',
        },
        failOnstatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(200)
      })
    })
    it('should be able to add a post with an invalid url', () => {
      cy.login(user.username)
      const url = `${Cypress.env('serverRootBaseUrl')}/api/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}/posts`
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: {
          name: 'resource 1',
          url: 'http://absolutejunk',
        },
        failOnstatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(201)
      })
    })
  })
})
