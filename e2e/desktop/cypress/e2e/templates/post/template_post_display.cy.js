import { generateFixture, getWrapper } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import templatePostsHelper from '../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate, publishTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser, createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

describe('template_post_display.cy', () => {
  let user,
    regularUser,
    fixture,
    template,
    appPage,
    visitHelpers,
    newTemplateName = 'Test Template For Posts'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser
        createUser().then(ru => {
          regularUser = ru
          const seed = {
            matter: {
              prefix: 'template_map.cy',
              teamMembers: [user, regularUser],
              matterAdmins: [user],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [
                    { name: 'aaaa', tasks: [{ name: 'ccc' }] },
                    { name: 'bbbb' },
                  ],
                },
              ],
            },
          }

          fixture = generateFixture(seed)
          visitHelpers = new VisitHelpers()
          appPage = getWrapper(fixture)
        })
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
          }
        ).then(() => {
          publishTemplate(template.id)
          visitHelpers.visitTemplateTaskDetails(
            template.id,
            template.tasks[0].id
          )
        })
      })
  })

  it('should show the zero state when no posts exist', () => {
    cy.get('[data-test="zero-state-image"]').should('be.visible')
  })

  describe('when a template task note is created from the zero state', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[1].id)
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=blank-note]').click()
      templatePostsHelper.completeNoteNameDialog()
    })

    it('the created post should be auto selected', () => {
      cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
    })

    it('the post details should be shown', () => {
      cy.get('[data-test=note-detail-panel]').should('be.visible')
    })
  })

  describe('when a user clicks on close post button to return to task', () => {
    before(() => {
      taskDetailPage.noteDetails.get.postCloseButton().click()
    })

    it('the task overview should be displayed', () => {
      cy.get('[data-test=note-detail-panel]').should('not.exist')
      cy.get('[data-test=task-name-full-panel]').should('be.visible')
    })
  })

  describe('when a user clicks on the post', () => {
    before(() => {
      cy.get('[data-test=note-list-item]').click()
    })

    it('the post should be displayed', () => {
      cy.get('[data-test=note-detail-panel]').should('be.visible')
    })

    describe('when a user navigates to subtask', () => {
      before(() => {
        taskDetailPage.noteDetails.get.postCloseButton().click()
        cy.get('[data-test=task-cell-test]').eq(0).click()
      })

      it('the post should no longer be displayed', () => {
        cy.get('[data-test=note-detail-panel]').should('not.exist')
      })

      it('should have 0 post', () => {
        cy.get('[data-test=note-list-item]').should('have.length', 0)
      })

      it('should display the subtask details', () => {
        cy.get('[data-test=task-name]').should('contain', 'ccc')
      })

      describe('when a user navigates back to parent task', () => {
        before(() => {
          cy.get('[data-test=task-path-item]').eq(0).click()
        })

        it('the post should no longer be displayed', () => {
          cy.get('[data-test=note-detail-panel]').should('not.exist')
        })

        it('should have 1 post', () => {
          cy.get('[data-test=note-list-item]').should('have.length', 1)
        })
      })
    })
  })
  describe('when visiting a post as a regular user', () => {
    before(() => {
      cy.get('[data-test=note-list-item]').click()
      cy.get('[data-test=finalise-button]').click()
      cy.login(regularUser.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[1].id)
      cy.get('[data-test=note-list-item]').click()
    })
    it('should not show a draft/finalise toggle', () => {
      cy.get('[data-test=note-details-state-selection-dropdown]').should(
        'not.exist'
      )
    })
  })
})
