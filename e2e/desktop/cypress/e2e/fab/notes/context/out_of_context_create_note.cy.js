import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openCreateNote } from '../../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('out_of_context_create_note.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateTaskNoteSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateTaskNote',
              tasks: [{ name: 'Task For Creating Notes' }],
            },
          ],
        },
      }

      const seed2 = {
        matter: {
          prefix: 'TaskNoteSpec2',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateNoteWithNoTasks',
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)

      fixture2 = generateFixture(seed2)
      appPage2 = getWrapper(fixture2)
    })
  })

  describe('When user click the global fab button and choose create note outside of a task', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
    })

    // describe('When entering the new note name and destination details then confirming.', () => {
    //   before(() => {
    //     openCreateNote()

    //     destinationHelper.selectFirstMatter()

    //     destinationHelper.selectFirstTask()

    //     cy.get('[data-test=auto-complete-search-term]')
    //       .find('input')
    //       .eq(2)
    //       .type('{enter}')
    //   })

    //   it('should redirect to task details with created note display in the list', () => {
    //     taskdetail_page.get
    //       .taskNoteListItems()
    //       .eq(0)
    //       .should('have.text', `${new Date().toLocaleDateString('en-CA')} Note`)
    //   })

    //   it('note details are displayed', () => {
    //     cy.get('[data-test=note-detail-panel]').should('be.visible')
    //   })
    // })

    describe('When creating a note on the task map', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap()
        openCreateNote()
        destinationHelper.selectFirstTask()
        cy.get('[data-test=auto-complete-search-term]')
          .find('input')
          .eq(1)
          .type('{enter}')
      })

      it('note details are displayed', () => {
        cy.get('[data-test=note-detail-panel]', { timeout: 30000 }).should(
          'be.visible'
        )
      })
    })
  })
  describe('When creating a note in a matter with no tasks', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      openCreateNote()

      cy.backendRoute('/matter/*/workstreams*').as('projectsFetch')
      cy.get('[data-test=search-results-list]')
      cy.get('[data-test=matter-select-menu-item]').last().click()
      cy.wait('@projectsFetch')

      cy.get('[data-test=task-select]').find('input').click()
    })

    it('should display an error and disable the Create button', () => {
      cy.get('[data-test=juralio-dialog]').should(
        'contain',
        'At least one task is required to create a post'
      )
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })
  })
})
