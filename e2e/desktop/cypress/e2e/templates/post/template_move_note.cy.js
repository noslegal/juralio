import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTemplateTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('template_move_note.cy', () => {
  let user, fixture, appPage, template, template2
  let visitHelpers = new VisitHelpers()

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'CreateNote',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'CreatePrivateNote',
                tasks: [{ name: 'Task' }, { name: 'Task 2' }],
              },
              {
                name: 'Other Project',
                tasks: [{ name: 'Task 3' }, { name: 'Task 4' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate('template1', fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
          }
        )
      })
      .then(() => {
        cy.login(user.username)
        createTemplate('template2', fixture.projects[1].id).then(
          createdTemplate => {
            template2 = createdTemplate
          }
        )
      })
  })

  describe('When moving a note between projects', () => {
    before(() => {
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      addNoteToTemplateTask(template.id, template.tasks[0].id, {
        name: 'This is a note.',
      })
      cy.reload()
      taskdetail_page.get.taskNoteListItems().eq(0).click()

      cy.get('[data-test=task-content-header-menu-button]').click()
    })

    it('should have a move menu option', () => {
      cy.get('[data-test=task-note-move]').should('be.visible')
    })
    describe('when using the move dialog', () => {
      before(() => {
        cy.get('[data-test=task-note-move]').click()
        cy.get('[data-test=project-selector-dropdown]', {
          timeout: 60000,
        }).should('be.visible')
        cy.wait(2000)
      })
      it('should show note name in title', () => {
        cy.get('[data-test=move-post-title]').should(
          'contain',
          'This is a note.'
        )
      })
      it('should auto populate the current project and task', () => {
        cy.get('[data-test=project-selector-dropdown]')
          .children()
          .eq(0)
          .should('have.text', 'template1')
        cy.get('[data-test=task-selector-dropdown]')
          .children()
          .eq(0)
          .should('have.text', 'A. Task1')
      })
      it('should have the move button disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })
      describe('when selecting a different task', () => {
        before(() => {
          cy.get('[data-test=task-selector-dropdown]').click()
        })
        it('should list all tasks in current project', () => {
          cy.get('[role=option]').eq(0).should('have.text', 'A. Task1')
        })

        describe('clicking an option', () => {
          before(() => {
            cy.get('[role=option]').eq(1).click()
          })
          it('should update the selected item', () => {
            cy.get('[data-test=task-selector-dropdown]')
              .children()
              .eq(0)
              .should('have.text', 'A. Task 22')
            cy.get('[data-test=project-selector-dropdown]')
              .children()
              .eq(0)
              .should('have.text', 'template1')
          })
          it('should enable the the move button', () => {
            cy.get('[data-test=action-dialog-button]').should('be.enabled')
          })
        })
      })
      describe('when selecting a different template', () => {
        before(() => {
          cy.get('[data-test=project-selector-dropdown]').click()
        })
        it('should list all templates', () => {
          cy.get('[role=option]').eq(0).should('have.text', 'template1')
          cy.get('[role=option]').eq(1).should('have.text', 'template2')
        })

        describe('clicking an option', () => {
          before(() => {
            cy.get('[role=option]').eq(1).click()
          })
          it('should update the selected item', () => {
            cy.get('[data-test=project-selector-dropdown]')
              .children()
              .eq(0)
              .should('have.text', 'template2')
          })
          it('should not have a selected task', () => {
            cy.get('[data-test=task-selector-dropdown]')
              .children()
              .eq(1)
              .should('have.value', '')
          })
          it('should disable the the move button', () => {
            cy.get('[data-test=action-dialog-button]').should('be.disabled')
          })
          describe('clicking the tasks dropdown', () => {
            before(() => {
              cy.get('[data-test=task-selector-dropdown]').click()
            })
            it('should display the tasks for that project', () => {
              cy.get('[role=option]').should('have.length', 2)
              cy.get('[role=option]').eq(0).should('have.text', 'A. Task 31')
            })
          })
        })
      })
      describe('clicking the move', () => {
        before(() => {
          cy.get('[role=option]').eq(0).click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should update the posts list', () => {
          cy.get('[data-test=note-list-item]').should('have.length', 0)
        })
        describe('should have move the task to a different project', () => {
          before(() => {
            cy.login(user.username)
            visitHelpers.visitTemplateTaskDetails(
              template2.id,
              template2.tasks[0].id
            )
          })
          it('should have the next post', () => {
            cy.get('[data-test=note-list-item]').should('have.length', 1)
            cy.get('[data-test=note-listitem-name]')
              .eq(0)
              .should('have.text', 'This is a note.')
          })
        })
      })
    })
  })
})
