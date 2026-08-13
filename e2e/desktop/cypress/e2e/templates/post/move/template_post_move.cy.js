import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import templatePostsHelper from '../../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

describe('template_post_move.cy', () => {
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
                tasks: [{ name: 'Alpha' }, { name: 'Beta' }],
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
    cy.get('[data-test=zero-state-image]').should('be.visible')
  })

  describe('when a template task link is created from the zero state', () => {
    const getPostMenuButton = () =>
      cy.get('[data-test=task-content-header-menu-button]')

    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog()
    })

    it('should return the created post', () => {
      cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
    })

    it('should show the menu button', () => {
      getPostMenuButton().should('be.visible')
    })

    describe('when the menu button is clicked', () => {
      before(() => {
        getPostMenuButton().click()
      })

      it('should show the move task option', () => {
        cy.get('[data-test=task-note-move]').should('be.visible')
      })

      describe('when the move menu item is clicked', () => {
        before(() => {
          cy.get('[data-test=task-note-move]').click()
          cy.wait(2000)
          cy.get('[data-test=task-selector-dropdown]').click()
          cy.wait(2000)
          cy.get('[data-test=task-item-name-' + template.tasks[1].id + ']').click()
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should have an empty post list', () => {
          cy.get('[data-test=zero-state-title]').should('be.visible')
        })
      })
      describe('The post should be in the new task', () => {
        before(() => {
          cy.login(user.username)
          visitHelpers.visitTemplateTaskDetails(
            template.id,
            template.tasks[1].id
          )
        })

        it('should have the post in the list', () => {
          cy.get('[data-test=note-list-item]').should('be.visible')
        })
      })
    })
  })
})
