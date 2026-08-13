import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../../page/taskdetail/taskdetail_page'

let now
let creationDate = new Date()

describe('task_note_edit_content.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskNoteEditContent',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Edit Content Spec',
              tasks: [{ name: 'Task With Notes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task with Notes', () => {
    before(() => {
      cy.login(user.username)

      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        {
          name: 'This is a note.',
        }
      )

      appPage.visitTaskByName('Task With Notes')
    })

    describe('selecting a note with no content', () => {
      before(() => {
        taskdetail_page.get.taskNoteListItems().eq(0).click()
      })

      it('the note opens in the read state', () => {
        cy.get('[data-test="notes-content-read-field"]').should('be.visible')
      })

      it('the edit state is not visible', () => {
        cy.get('[data-test="notes-content-edit-field"]').should('not.exist')
      })

      it('the placeholder text reads "Add note content"', () => {
        cy.get('[data-test="notes-content-placeholder"]').should(
          'contain',
          'Add note content'
        )
      })

      describe('clicking on the content field placeholder', () => {
        before(() => {
          cy.get('[data-test="notes-content-placeholder"]').click()
        })

        checkRichEditorShown()

        describe('pasting some content and clicking the save button then refresh page', () => {
          before(() => {
            taskdetail_page.noteDetails.get
              .noteEditor()
              .type('{selectall}{backspace}')
              .type('copy-pasted text')
            cy.wait(5000)
            cy.get('[data-test=overview-button]').click()
            cy.login(user.username)
            appPage.visitTaskByName('Task With Notes')
            taskdetail_page.get.taskNoteListItems().eq(0).click()
          })

          it('the component returns to the read state', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'be.visible'
            )
          })

          it('the edit state is not visible', () => {
            cy.get('[data-test="notes-content-edit-field"]').should('not.exist')
          })

          it('causes the content to be saved', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'copy-pasted text'
            )
          })

          it('the content field still reads "copy-pasted text"', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'copy-pasted text'
            )
          })

          describe('clicking on the area below content field placeholder', () => {
            before(() => {
              cy.get('[data-test=notes-content-read-field]').click('bottom')
            })

            checkRichEditorShown()
          })
        })

        describe('typing some content and clicking the save button then refresh page', () => {
          before(() => {
            taskdetail_page.noteDetails.get
              .noteEditor()
              .type('{selectall}{backspace}')
            cy.focused().type('some content')
            cy.wait(3000)
            cy.get('[data-test=overview-button]').click()
            cy.login(user.username)
            appPage.visitTaskByName('Task With Notes')
            taskdetail_page.get.taskNoteListItems().eq(0).click()
          })

          it('the component returns to the read state', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'be.visible'
            )
          })

          it('the edit state is not visible', () => {
            cy.get('[data-test="notes-content-edit-field"]').should('not.exist')
          })

          it('causes the content to be saved', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'some content'
            )
          })

          it('the content field still reads "some content"', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'some content'
            )
          })

          describe('clicking on the area below content field placeholder', () => {
            before(() => {
              cy.get('[data-test=notes-content-read-field]').click('bottom')
            })

            checkRichEditorShown()
          })
        })

        describe('typing some content and waiting for auto save then losing focus', () => {
          before(() => {
            taskdetail_page.noteDetails.get
              .noteEditor()
              .type('{selectall}{backspace}')
              .type('autosaved')
            cy.wait(5 * 1000)

            cy.login(user.username)
            appPage.visitTaskByName('Task With Notes')
            taskdetail_page.get.taskNoteListItems().eq(0).click()
          })

          it('the component returns to the read state', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'be.visible'
            )
          })

          it('the edit state is not visible', () => {
            cy.get('[data-test="notes-content-edit-field"]').should('not.exist')
          })

          it('causes the content to be saved', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'autosaved'
            )
          })

          it('the content field still reads "autosaved"', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'autosaved'
            )
          })

          describe('clicking on the area below content field placeholder', () => {
            before(() => {
              cy.get('[data-test=notes-content-read-field]').click('bottom')
            })

            checkRichEditorShown()
          })
        })
      })

      describe('typing some content and saving and then navigating away', () => {
        before(() => {
          taskdetail_page.noteDetails.get
            .noteEditor()
            .type('{selectall}{backspace}')
            .type('navigated away ')
          cy.wait(5000)
          cy.login(user.username)
          appPage.visitHomeViaNavigation()
          appPage.visitTaskByName('Task With Notes')
          taskdetail_page.get.taskNoteListItems().eq(0).click()
        })

        it('the component returns to the read state', () => {
          cy.get('[data-test="notes-content-read-field"]').should('be.visible')
        })

        it('the edit state is not visible', () => {
          cy.get('[data-test="notes-content-edit-field"]').should('not.exist')
        })

        it('causes the content to be saved', () => {
          cy.get('[data-test="notes-content-read-field"]').should(
            'contain',
            'navigated away'
          )
        })

        describe('refreshing the page confirms the content persisted', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskByName('Task With Notes')
            taskdetail_page.get.taskNoteListItems().eq(0).click()
          })

          it('the content field still reads "navigated away"', () => {
            cy.get('[data-test="notes-content-read-field"]').should(
              'contain',
              'navigated away'
            )
          })

          describe('clicking on the area below content field placeholder', () => {
            before(() => {
              cy.get('[data-test=notes-content-read-field]').click('bottom')
            })

            checkRichEditorShown()
          })
        })
      })

      describe('saving a draft note', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskByName('Task With Notes')
          taskdetail_page.get.taskNoteListItems().eq(0).click()
          cy.get('[data-test="notes-content-read-field"]').click()
          checkRichEditorShown()
          taskdetail_page.noteDetails.get.noteEditor().type('Hello world')
        })
        it('should refocus on the content', () => {
          cy.focused().should('have.class', 'ProseMirror')
        })
      })
      describe('saving a post and staying on the page', () => {
        before(() => {
          cy.login(user.username)
          addNoteToTask(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            {
              name: 'This is also a note.',
            }
          )
          appPage.visitTaskByName('Task With Notes')

          taskdetail_page.get.taskNoteListItems().eq(0).click()
          cy.get('[data-test="notes-content-read-field"]').click()
          checkRichEditorShown()
        })

        describe('typing and saving some text', () => {
          before(() => {
            checkRichEditorShown()
            taskdetail_page.noteDetails.get.noteEditor().type('Hello world')
            cy.get('[data-test=overview-button]').click()
            cy.wait(3000)
            cy.login(user.username)
            appPage.visitTaskByName('Task With Notes')
            taskdetail_page.get.taskNoteListItems().eq(0).click()
          })

          it('save button should say saved', () => {
            cy.wait(10 * 1000) //wait for the auto update
          })
        })
      })
    })
  })
})
function checkRichEditorShown() {
  it('opens edit state', () => {
    cy.get('[data-test="notes-content-edit-field"]').should('be.visible')
  })
  it('the read state is not visible', () => {
    cy.get('[data-test="notes-content-read-field"]').should('not.exist')
  })
  it('there is a bold option in the toolbar', () => {
    cy.get('[aria-label="Bold"]').should('be.visible')
  })
  it('there is an italic option in the toolbar', () => {
    cy.get('[aria-label="Italic"]').should('be.visible')
  })
  it('there is an underline option in the toolbar', () => {
    cy.get('[aria-label="Underline"]').should('be.visible')
  })
  it('there is a bullet list option in the toolbar', () => {
    cy.get('[aria-label="Bullet List"]').should('be.visible')
  })
  it('there is a fullscreen option in the toolbar', () => {
    cy.get('[aria-label="Fullscreen"]').should('be.visible')
  })
}
