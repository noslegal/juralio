import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import { enterLinkUrl } from '../../../../../helpers/links/task_content_links_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { checkGlobalNotificationCount } from '../../../../../helpers/notifications/global-notification-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_link_out_context.cy', () => {
  let user, appPage

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
              tasks: [{ name: 'Task For Creating Notes', teamMembers: [user] }],
            },
          ],
        },
      }

      const fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When user click the global fab button and choose create note outside of a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
    })

    checkGlobalNotificationCount(0)

    describe('When user click the global fab button and choose create link in a task context', () => {
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-post-fab-button]').click()
        cy.get('[data-test=document-link]').click()
      })

      it('enter link name', () => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('New Excel')
      })

      it('enter button should be disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })

      it('the tour will appear in the dialog for the first time use', () => {
        cy.get('[data-test=web-link-create-tour-content]').should('exist')
      })

      it('the tour will disappear after being clicked', () => {
        cy.get('[data-test=status-tour-close-forever]').click()
        cy.get('[data-test=web-link-create-tour-content]').should('not.exist')
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

    describe('When user reloads the page, there should not be any extra notifications', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()
      })

      checkGlobalNotificationCount(0)
    })
  })
})
