import { populateLinkDetails } from '../../../../../helpers/links/task_content_links_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { checkGlobalNotificationCount } from '../../../../../helpers/notifications/global-notification-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('create_link_in_context.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateTaskLinkSpec',
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

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When user click the global fab button and choose create link in a task context', () => {
    before(() => {
      appPage.visitTaskByName('Task For Creating Links')
      cy.get('[data-test=fab-button]').click()
      cy.get('[data-test=create-post-fab-button]').click({ force: true })
      cy.get('[data-test=web-link]').click()
    })

    checkGlobalNotificationCount(0)

    it('the Create button should be disabled', () => {
      cy.get('[data-test=action-dialog-button]').should(
        'have.attr',
        'disabled',
        'disabled'
      )
    })

    it('the tour will appear in the dialog for the first time use', () => {
      cy.get('[data-test=web-link-create-tour-content]').should('exist')
    })

    it('the tour will disappear after being clicked', () => {
      cy.get('[data-test=status-tour-close-forever]').click()
      cy.get('[data-test=web-link-create-tour-content]').should('not.exist')
    })

    describe('entering link details and hit create', () => {
      before(() => {
        populateLinkDetails('New Excel', 'https://test.url.com', 'excel')
        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
          'postNote'
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postNote')
      })

      it('should display a snackbar', () => {
        cy.get('[data-test=snackbar-message]')
          .should('be.visible')
          .should('contain', 'Web Link successfully created')
      })

      it('should create the new link in the list', () => {
        taskdetail_page.get
          .taskNoteListItems()
          .eq(0)
          .should('have.text', 'New Excel')
      })
    })

    describe('entering link details for a previously invalid url with surrounding whitespace', () => {
      const urlContent =
        'https://www.bailii.org/cgi-bin/format.cgi?doc=/ie/cases/IECA/2018/CA26.html&query=(title:(+donoghue+))'
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-post-fab-button]').click({ force: true })
        cy.get('[data-test=web-link]').click()
        cy.wait(3000)
        populateLinkDetails('New Link', `     ${urlContent}     `, 'link')
        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
          'postNote'
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postNote')
      })

      it('should display a snackbar', () => {
        cy.get('[data-test=snackbar-message]')
          .should('be.visible')
          .should('contain', 'Link successfully created')
      })

      it('should create the new link in the list', () => {
        taskdetail_page.get
          .taskNoteListItems()
          .eq(0)
          .should('have.text', 'New Link')
      })

      it('should have stripped the whitespace and prepended https://', () => {
        cy.get('[data-test=read-edit-url-link]').should(
          'have.text',
          `${urlContent}`
        )
      })
    })

    describe('When entering the url field details', () => {
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-post-fab-button]').click({ force: true })
        cy.get('[data-test=web-link]').click()
        populateLinkDetails('New Link', 'www')
      })

      it('the tour should not be present as it was already cleared', () => {
        cy.get('[data-test=web-link-create-tour-content]').should('not.exist')
      })

      it('the error message is not shown', () => {
        cy.get('[data-test=edit-field]').should('not.exist')
      })
    })

    describe('When user reloads the page there should not be any extra notifications', () => {
      before(() => {
        cy.login(user.username)
        cy.reload() // Force notifcation update.
      })

      checkGlobalNotificationCount(0)
    })
  })
})
