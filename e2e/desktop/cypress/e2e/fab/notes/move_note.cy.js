import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('move_note.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateNote',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreatePrivateNote',
              tasks: [{ name: 'Task 1' }, { name: 'Task 2' }],
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
  })

  describe('When moving a note between projects', () => {
    before(() => {
      appPage.visitTaskByName('Task 1')
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
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
        cy.wait(2000) // DOM detach issue
      })
      it('should show note name in title', () => {
        cy.get('[data-test=move-post-title]').should(
          'contain',
          'This is a note.'
        )
      })
      describe('when selecting a different task', () => {
        before(() => {
          cy.get('[data-test=task-selector-dropdown]').click()
        })
        it('should list all tasks in current project', () => {
          cy.get('[role=option]').should('have.length', 1)
          cy.get('[role=option]').eq(0).should('have.text', 'A. Task 22')
        })

        describe('clicking an option', () => {
          before(() => {
            cy.get('[role=option]').eq(0).click()
          })
          it('should update the selected item', () => {
            cy.get('[data-test=task-selector-dropdown]')
              .children()
              .eq(0)
              .should('have.text', 'A. Task 22')
            cy.get('[data-test=project-selector-dropdown]')
              .children()
              .eq(0)
              .should('have.text', 'CreatePrivateNote')
          })
          it('should enable the the move button', () => {
            cy.get('[data-test=action-dialog-button]').should('be.enabled')
          })
        })
      })
      describe('when selecting a different project', () => {
        before(() => {
          cy.get('[data-test=project-selector-dropdown]').click()
        })
        it('should list all projects in the matter', () => {
          cy.get('[role=option]').should('have.length', 2)
          cy.get('[role=option]').eq(1).should('have.text', 'Other Project')
        })

        describe('clicking an option', () => {
          before(() => {
            cy.get('[role=option]').eq(1).click()
          })
          it('should update the selected item', () => {
            cy.get('[data-test=project-selector-dropdown]')
              .children()
              .eq(0)
              .should('have.text', 'Other Project')
          })
          it('should not have a selected task', () => {
            cy.get('[data-test=task-selector-dropdown]')
              .children()
              .eq(0)
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
              cy.get('[role=option]').eq(0).should('have.text', 'A. Task 33')
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
            appPage.visitTaskByName('Task 3')
          })
          it('should have the next post', () => {
            cy.get('[data-test=note-list-item]').should('have.length', 1)
            cy.get('[data-test=note-listitem-name]', { timeout: 30000 })
              .eq(0)
              .should('have.text', 'This is a note.')
          })
        })
      })
    })
  })
})
