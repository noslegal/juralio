import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createTemplateResource,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'

describe('favourite_template_spec', () => {
  let orgUsers, otherOrgUsers, fixture, url, templateExport
  let templateID

  const USER = {
    SYSADMIN_USER: {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    },
  }

  before(() => {
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
            prefix: 'importantMatter',
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
                name: 'Project 1',
                tasks: [
                  {
                    name: 'task a',
                    tasks: [
                      { name: 'task 1' },
                      { name: 'task 2', isMilestone: true },
                    ],
                  },
                  { name: 'task b' },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to export template', () => {
    before(() => {
      cy.login(orgUsers.knowledgeManager.username)

      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template',
          projectId: fixture.projects[0].id,
        },
      }).then(response => {
        templateID = response.body.id
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/projecttemplates/${templateID}/tasks/${
            response.body.tasks[0].id
          }/posts`,
          method: 'POST',
          body: { name: 'private post', privatePost: true },
        }).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/projecttemplates/${templateID}/tasks/${
              response.body.tasks[0].id
            }/posts`,
            method: 'POST',
            body: {
              name: 'web link',
              type: 'Document link',
              url: 'https://www.google.com',
            },
          }).then(() => {
            cy.apiSpecRequest({
              url: `${Cypress.env(
                'serverBaseUrl'
              )}/projecttemplates/${templateID}/tasks/${
                response.body.tasks[0].id
              }/posts`,
              method: 'POST',
              body: {
                name: 'regular post',
                privatePost: false,
                description: 'desc',
              },
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.CREATED)
              createTemplateResource(
                templateID,
                'resource 1',
                'https://google.com'
              ).then(() => {
                publishTemplate(templateID).then(() => {
                  cy.login('sysadmin@juralio.com', 'Password1Password1$')
                  cy.request({
                    url: `http://localhost:8080/api/projecttemplates/${templateID}/export`,
                    method: 'GET',
                    failOnStatusCode: false,
                  }).then(res => {
                    templateExport = res.body
                  })
                })
              })
            })
          })
        })
      })
    })
    it('should export the data template data correctly', () => {
      expect(templateExport.name).to.eq('new template')
      expect(templateExport.companyImageBackground).to.eq(true)
      expect(templateExport.published).to.eq(true)
      expect(templateExport.archived).to.eq(false)
    })
    it('should export the task data correctly', () => {
      expect(templateExport.tasks.length).to.eq(2)
      expect(templateExport.tasks[0].name).to.eq('task a')
      expect(templateExport.tasks[0].tasks.length).to.eq(2)
      expect(templateExport.tasks[0].tasks[0].name).to.eq('task 1')
      expect(templateExport.tasks[0].tasks[1].name).to.eq('task 2')
      expect(templateExport.tasks[0].tasks[1].isMilestone).to.eq(true)
      expect(templateExport.tasks[1].name).to.eq('task b')
    })
    it('should export the post data correctly', () => {
      expect(templateExport.tasks[0].tasks[0].posts.length).to.eq(3)
    })
    it('should export the resource data correctly', () => {
      expect(templateExport.resources.length).to.eq(1)
      expect(templateExport.resources[0].name).to.eq('resource 1')
      expect(templateExport.resources[0].url).to.eq('https://google.com')
    })
    it('should export the metadata correctly', () => {
      expect(templateExport.metadata.instance).to.eq('${DOMAIN}')
      expect(templateExport.metadata.submittedTemplateId).to.eq(templateID)
    })
  })
  describe('when no a sys admin', () => {
    it('doesnot allow me to export', () => {
      cy.login(orgUsers.teamMember.username)
      cy.request({
        url: `http://localhost:8080/api/projecttemplates/${templateID}/export`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('sysadmin can only export published template', () => {
    before(() => {
      cy.login(orgUsers.knowledgeManager.username)

      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates`,
        method: 'POST',
        body: {
          name: 'new template',
          projectId: fixture.projects[0].id,
        },
      }).then(res => (templateID = res.body.id))
    })
    it('should not allow the export', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: `http://localhost:8080/api/projecttemplates/${templateID}/export`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
