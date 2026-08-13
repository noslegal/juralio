import { populateLinkDetails } from '../../../../../helpers/links/task_content_links_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('edit_link_validation.cy', () => {
  const urlField = taskdetail_page.noteDetails.get.url
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'EditLinkSpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'EditLinkSpec',
              tasks: [{ name: 'Task For Displaying Links' }],
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
      appPage.visitTaskByName('Task For Displaying Links')
      cy.get('[data-test=fab-button]').click()
      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=web-link]').click()
    })

    describe('entering link details and hit create', () => {
      before(() => {
        populateLinkDetails('Search engine', 'https://bing.com/', 'link')
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should show the relevant icon for the link created', () => {
        cy.get('[data-test=web-icon]', { timeout: 30000 }).should('be.visible')
      })

      it('should show the link', () => {
        taskdetail_page.noteDetails.get.url.link().should('be.visible')
      })

      describe('When the link url is edited to blank', () => {
        before(() => {
          urlField.editButton().click()

          urlField
            .editTextField()
            .find('input')
            .type('{selectall}')
            .type(' {backspace}')
            .type('{enter}')
        })

        it('should show validation message "A valid https:// URL or iManage link is required"', () => {
          cy.get('[data-test=edit-field]').contains(
            'A valid URL or iManage link is required'
          )
        })

        describe('When the field loses focus', () => {
          before(() => {
            cy.get('[data-test=note-listitem-name]').click()
          })

          it('should show the link', () => {
            taskdetail_page.noteDetails.get.url.link().should('be.visible')
          })
        })
      })
    })
  })
})
