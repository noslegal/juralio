import { populateLinkDetails } from '../../../../../../helpers/links/task_content_links_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../helpers/notes/notes-helper'
import { openLinkNote } from '../../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'
import textWithDestinationDialog from '../../../../../../page/textwithdestinationdialog/textwithdestinationdialog_page'

describe('context_change_note_destination.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'AddNoteDestSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'AddNoteDest',
              tasks: [
                { name: 'Task For Creating Notes' },
                { name: 'Destination Task' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When user click the global fab button and choose create note in a task context', () => {
    before(() => {
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Existing note.' }
      )
      appPage.visitTaskByName('Task For Creating Notes')

      openLinkNote()
      populateLinkDetails('A new note', 'https://test.url.com', 'excel')
      cy.get('[data-test=status-tour-close-forever]').click()
    })

    it('The field is shown correctly', () => {
      textWithDestinationDialog.get
        .destinationDescriptionField()
        .should('have.text', 'As a post of Task For Creating Notes #1')
    })

    describe('when the destination task is changed ', () => {
      before(() => {
        textWithDestinationDialog.get.editLink().click()
      })

      describe('When a new task is selected and create button clicked', () => {
        before(() => {
          destinationPage.get.taskSelectorInput().click()

          cy.backendRoute('/matter/*/workstreams/*/tasks*').as('getTask')
          destinationPage.get
            .taskSelectorInput()
            .type('some temporary text{selectall}Destination')
          cy.wait('@getTask')
          cy.get('[data-test=task-search-item]', { timeout: 30000 })
            .eq(0)
            .click()

          cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
            'postNote'
          )
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@postNote')

          cy.wait(2000)
          cy.get('[data-test=note-list-item-selected]', {}).click()
        })

        it('should have one items in the content list', () => {
          cy.get('[data-test=note-list-item-selected]').should('have.length', 1)
        })

        noteDetailsHelper.checkNoteDetails('A new note', 'Last updated: Today')
      })
      describe('The authors panel should be visible', () => {
        noteDetailsHelper.checkAuthorDetails()
      })
    })
  })
})
