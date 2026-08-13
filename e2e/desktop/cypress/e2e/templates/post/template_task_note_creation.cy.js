import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import templatePostsHelper from '../../../../../helpers/templates/posts/template_posts_helper'
import {
  createTemplate,
  createTemplateTaskPost,
} from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_task_note_creation.cy', () => {
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
              template.tasks[0].id
            )
          }
        )
      })
  })

  it('should show the zero state when no posts exist', () => {
    cy.get('[data-test="zero-state-image"]').should('be.visible')
  })

  describe('when a template task note is created from the zero state', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=blank-note]').click()
      templatePostsHelper.completeNoteNameDialog({ waitForCreate: false })
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]', { timeout: 30000 }).should(
        'have.length',
        1
      )
    })
  })

  describe('when a template task note is created through the api', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      createTemplateTaskPost(template.id, template.tasks[0].id, 'new post')
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item]').should('have.length', 2)
    })
  })

  describe('when a template task note is created from the "add post" button', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=blank-note]').click()
      templatePostsHelper.completeNoteNameDialog()
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]', { timeout: 30000 }).should(
        'have.length',
        1
      )
      cy.get('[data-test=note-list-item]').should('have.length', 2)
    })
  })

  describe('when a template task note is created from the FAB button in-context', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=blank-note]').click()

      templatePostsHelper.completeNoteNameDialog()
    })

    it('should have the created post in the list', () => {
      cy.get('[data-test=note-list-item-selected]', { timeout: 30000 }).should(
        'have.length',
        1
      )
      cy.get('[data-test=note-list-item]').should('have.length', 3)
      cy.get('[data-test=notes-content-read-field]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
  })

  describe('when a template task note is created from the FAB button out-of-context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplateTaskMap(template.id)
      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=blank-note]').click()
      templatePostsHelper.completeNoteNameDialog({ waitForCreate: false })
      templatePostsHelper.completeDestinationDialogFromTemplateContext('aaaa')
    })

    it('should have the created post in the list', () => {
      cy.get('[data-test=note-list-item-selected]', { timeout: 30000 }).should(
        'have.length',
        1
      )
      cy.get('[data-test=note-list-item]').should('have.length', 4)
      cy.get('[data-test=notes-content-read-field]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
  })
})
