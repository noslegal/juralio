import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import templatePostsHelper from '../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_task_link_creation.cy', () => {
  let user,
    fixture,
    template,
    appPage,
    visitHelpers,
    newTemplateName = 'Test Template For Posts'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_map.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'aaaa' }, { name: 'bbbb' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        visitHelpers = new VisitHelpers()
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            visitHelpers.visitTemplateTaskDetails(
              template.id,
              template.tasks[1].id
            )
          }
        )
      })
  })

  it('should show the zero state when no posts exist', () => {
    cy.get('[data-test="zero-state-image"]').should('be.visible')
  })

  describe('when a template task link is created from the zero state', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[1].id)

      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog()
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
    })
  })

  describe('when a template task link is created from the the"add post" button', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[1].id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog()
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
      cy.get('[data-test=note-list-item]').should('have.length', 1)
    })
  })

  describe('when a template task link is created from the the FAB button in-context', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[1].id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog()
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
      cy.get('[data-test=note-list-item]').should('have.length', 2)
    })
  })

  describe('when a template task link is created from the the FAB button out-of-context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplateTaskMap(template.id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog({ waitForCreate: false })
      templatePostsHelper.completeDestinationDialogFromTemplateContext('b')
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
      cy.get('[data-test=note-list-item]').should('have.length', 3)
    })
  })

  describe('when a template task link is created from the the FAB button in-context', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[1].id)
      cy.get('[data-test=fab-button]').click()
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog({ waitForCreate: false })
    })

    it('should display link successfully created snackbar', () => {
      cy.get('[data-test=global-snackbar]').should(
        'have.contain',
        'Link successfully created'
      )
    })
  })
})
