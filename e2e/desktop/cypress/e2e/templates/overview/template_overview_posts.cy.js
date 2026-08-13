import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_overview_posts.cy', () => {
  let testUser,
    fixture,
    postId,
    template,
    template2,
    appPage,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser('ZZZ')
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Overview Spec with Tasks',
                tasks: [{ name: 'Task1', teamMembers: [] }],
              },
              {
                name: 'Overview Spec without Tasks',
                tasks: [{ name: 'Task1', teamMembers: [] }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(testUser.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
          }
        )
        createTemplate(newTemplateName, fixture.projects[1].id).then(
          createdTemplate => {
            template2 = createdTemplate
          }
        )
      })
  })

  describe('When navigating to project overview with no posts', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTemplateOverview(template2.id)
    })

    it('should show the posts header', () => {
      cy.get('[data-test=post-count]').should('have.text', '0 Posts')
    })
  })

  describe('When navigating to project overview with 3 posts', () => {
    before(() => {
      cy.login(testUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/${
          template.id
        }/tasks/${template.tasks[0].id}/posts`,
        method: 'POST',
        body: { name: 'Notey note 1', description: 'A test note.' },
      }).then(() => {
        cy.wait(1000)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/projecttemplates/${
            template.id
          }/tasks/${template.tasks[0].id}/posts`,
          method: 'POST',
          body: { name: 'Notey note 2', description: 'A test note.' },
        }).then(() => {
          cy.wait(1000)

          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/projecttemplates/${
              template.id
            }/tasks/${template.tasks[0].id}/posts`,
            method: 'POST',
            body: { name: 'Notey note 3', description: 'A test note 3.' },
          }).then(response => {
            postId = response.body.id
          })
        })
      })
      appPage.visitTemplateOverview(template.id)
    })

    it('should show the posts header', () => {
      cy.get('[data-test=post-count]').should('have.text', '3 Posts')
    })
  })
  describe('when viewing the posts tab', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTemplateOverview(template.id)
      cy.get('[data-test=post-count]').click()
    })
    it('should display the projects posts', () => {
      cy.get('[data-test=post-tab]').eq(0).click()
      cy.get('[data-test=postColumnHeader]').should('be.visible')
    })
    describe('clicking a row', () => {
      before(() => {
        cy.get('[data-rowindex=1]').click({ force: true })
      })
      it('should redirect to the post details', () => {
        cy.url().should(
          'contain',
          `/#/template/${template.id}/task/${template.tasks[0].id}/post`
        )
      })
    })
    describe('clicking a task chip', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitTemplateOverview(template.id)
        cy.get('[data-test=post-count]').click()
        cy.wait(1000)
        cy.get('[data-test=juralio-chip-task]').eq(0).click()
        cy.wait(1000)
      })
      it('should redirect to the task overview', () => {
        cy.url().should(
          'contain',
          `/#/template/${template.id}/task/${template.tasks[0].id}`
        )
      })
    })
  })
})
