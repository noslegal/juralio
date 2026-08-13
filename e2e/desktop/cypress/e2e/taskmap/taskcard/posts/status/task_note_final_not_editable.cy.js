import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_final_not_editable.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskNoteFinalReadOnlyTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Status',
              tasks: [{ name: 'Task' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task, selecting a Note (with no content) and marking it as Final', () => {
    before(() => {
      cy.login(user.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
      cy.wait(3000)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
      cy.wait(3000)
      appPage.visitTaskByName('Task')
      taskdetail_page.get.taskNoteListItems().eq(0).click()

      cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
        'markFinal'
      )
      taskdetail_page.noteDetails.get.finaliseButton().click()
      cy.wait('@markFinal')
    })

    describe('when the note body is clicked', () => {
      before(() => {
        // cy.get('body').click()
        cy.wait(1000)
        taskdetail_page.noteDetails.get.content().click()
      })

      it('does not open edit state for the note body', () => {
        // cy.get('[data-test=notes-content-edit-field]').should('not.exist')
        cy.get('[data-test=notes-content-read-field]').should('exist')
      })
    })

    describe('when the note title is clicked', () => {
      before(() => {
        taskdetail_page.get.noteDetailName().click()
      })

      it('does not open edit state for the note name', () => {
        cy.get('[data-test=notes-content-read-field]').should('exist')
      })

      it('shows read state for the note name', () => {
        cy.get('[data-test=read-field]').should('exist')
      })

      it('should display the no content placeholder', () => {
        cy.get('[data-test=notes-content-placeholder]').should(
          'have.text',
          'This note has no content.'
        )
      })

      describe('when the note has content, is saved and marked as final', () => {
        before(() => {
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'markDraft'
          )
          taskdetail_page.noteDetails.get.finaliseButton().click()
          cy.wait('@markDraft')
          // cy.get('body').click()
          cy.wait(1000)
          cy.get('[data-test=note-listitem-name]').eq(1).click({ force: true })
          cy.get('[data-test=note-listitem-name]').eq(0).click({ force: true })
          taskdetail_page.noteDetails.get.content().click()
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'autoSave'
          )
          taskdetail_page.noteDetails.get
            .noteEditor()
            .type('Hello world', { delay: 50 })
            .blur()
          cy.wait('@autoSave')
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'markFinal'
          )
          cy.wait(3000)
          taskdetail_page.noteDetails.get.finaliseButton().click()
          cy.wait('@markFinal')
          cy.wait(3000)
        })

        // it('should show a select value of finalised', () => {
        //   taskdetail_page.noteDetails.get.finaliseButton().contains('Edit')
        // })

        it('should set the note editor to read only', () => {
          // cy.get('[data-test=notes-content-edit-field]').should('not.exist')
          cy.get('[data-test=note-listitem-name]').eq(1).click({ force: true })
          cy.get('[data-test=note-listitem-name]').eq(0).click({ force: true })
          cy.get('[data-test=notes-content-read-field]').should('exist')
        })

        it('should have the correct content', () => {
          taskdetail_page.noteDetails.get
            .content()
            .should('have.text', 'Hello world')
        })
        it('should be represented correctly in the Post list', () => {
          cy.get('[data-test=note-list-item-selected]')
            .click()
            .contains('Finalised')
        })
      })

      describe('when the note has content, skip save and marked as final', () => {
        before(() => {
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'markDraft'
          )
          taskdetail_page.noteDetails.get.finaliseButton().click()
          //   taskdetail_page.noteDetails.get.markAsDraft().click()
          cy.wait('@markDraft')
          cy.wait(1000)
          cy.get('[data-test=note-listitem-name]').eq(1).click({ force: true })
          cy.get('[data-test=note-listitem-name]').eq(0).click({ force: true })
          taskdetail_page.noteDetails.get.content().click()
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'autoSave'
          )
          taskdetail_page.noteDetails.get
            .noteEditor()
            .type('{selectall}{backspace}')
            .type('Hello world', { delay: 50 })
            .blur()
          cy.wait('@autoSave')
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'markFinal'
          )
          cy.wait(3000)
          taskdetail_page.noteDetails.get.finaliseButton().click()
          cy.wait('@markFinal')
        })

        it('should set the note editor to read only', () => {
          cy.get('[data-test=notes-content-read-field]').should('exist')
        })

        // it('should have the correct content', () => {
        //   taskdetail_page.noteDetails.get
        //     .content()
        //     .should('have.text', 'Hello world')
        // })
      })
    })
  })
})
