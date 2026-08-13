import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import templatePostsHelper from '../../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('template_post_delete.cy', () => {
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
                tasks: [{ name: 'aaaa' }],
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

      it('should show the delete task option', () => {
        cy.get('[data-test=task-post-delete]').should('be.visible')
      })

      describe('when the delete menu item is clicked', () => {
        before(() => {
          cy.get('[data-test=task-post-delete]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should have an empty post list', () => {
          taskdetail_page.get.taskNoteListItems().should('have.length', 0)
        })

        it('should show the task card content', () => {
          taskdetail_page.get.taskCardContent().should('be.visible')
        })

        describe('when the page is reloaded', () => {
          before(() => {
            cy.login(user.username)
            cy.reload()
          })

          it('should have an empty post list', () => {
            taskdetail_page.get.taskNoteListItems().should('have.length', 0)
          })

          it('should show the task card content', () => {
            taskdetail_page.get.taskCardContent().should('be.visible')
          })
        })
      })
    })
  })
})
