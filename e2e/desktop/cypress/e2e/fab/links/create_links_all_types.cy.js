import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import { enterLinkUrl } from '../../../../../helpers/links/task_content_links_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { openMeetingNote } from '../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('create_links_all_types.cy', () => {
  let user, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateTaskLinkAllTypesSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateLinkNote',
              tasks: [{ name: 'Task For Creating Links' }],
            },
          ],
        },
      }

      const fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  const createLink = linkType => {
    describe('When user click the global fab button and choose create link in a task context', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
        cy.get('[data-test=fab-button]').click()
        cy.wait(1000)
        cy.get('[data-test=create-post-fab-button]', { timeout: 30000 }).click()
        cy.get('[data-test=web-link]').click()
        cy.wait(1000) // To deal with DOM Detachment.
      })

      it('enter link name', () => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('New ' + linkType)
      })

      it('enter button should be disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })

      it('enter link url', () => {
        enterLinkUrl('https://test.url.com')
      })

      it('Submit form', () => {
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('Enter destination dialog input', () => {
        destinationHelper.selectFirstMatter()
        destinationHelper.selectFirstTask()
        cy.get('[data-test=action-dialog-button]').click()
      })
    })
  }

  describe('When user click the global fab button and choose create note outside of a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
    })

    createLink('link-type-excel')
    createLink('link-type-word')
    createLink('link-type-powerpoint')
    createLink('link-type-pdf')
    createLink('link-type-email')
    createLink('link-type-link')

    describe('When visiting the task that has the links', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Task For Creating Links')
      })

      it('should show the created links in the list', () => {
        taskdetail_page.get
          .taskNoteListItems()
          .eq(0)
          .should('have.text', 'New link-type-link')
        taskdetail_page.get
          .taskNoteListItems()
          .eq(1)
          .should('have.text', 'New link-type-email')
        taskdetail_page.get
          .taskNoteListItems()
          .eq(2)
          .should('have.text', 'New link-type-pdf')
        taskdetail_page.get
          .taskNoteListItems()
          .eq(3)
          .should('have.text', 'New link-type-powerpoint')
        taskdetail_page.get
          .taskNoteListItems()
          .eq(4)
          .should('have.text', 'New link-type-word')
        taskdetail_page.get
          .taskNoteListItems()
          .eq(5)
          .should('have.text', 'New link-type-excel')
      })

      it('should show the relevant icon for the link created', () => {
        cy.get('[data-test=web-icon]').should('be.visible')
      })

      describe('When trying to create a note', () => {
        before(() => {
          openMeetingNote()
        })

        it('should create a note', () => {
          cy.get('[data-test=note-list-item-selected]', {
            timeout: 5000,
          }).should('be.visible')
        })

        it('which is a meeting', () => {
          cy.get('[data-test=meeting-icon]').should('be.visible')
        })
      })
    })
  })
})
