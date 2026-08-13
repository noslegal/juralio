import { populateLinkDetails } from '../../../../../helpers/links/task_content_links_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { openLinkNote } from '../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_private_note.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreatePrivateNote',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreatePrivateNote',
              tasks: [{ name: 'Task' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When trying to create a note', () => {
    before(() => {
      appPage.visitTaskByName('Task')
      openLinkNote()
      populateLinkDetails('a new private note', 'https://test.url.com', 'excel')
      cy.get('[data-test=status-tour-close-forever]').click()
    })

    it('user should see note private switch set to OFF by default', () => {
      cy.get('[data-test=dialog-actions-switch-off]').should('be.visible')
    })

    describe('and trying to toggle the private switch', () => {
      before(() => {
        cy.get('[data-test=dialog-actions-switch-off]').click()
      })

      it('should update the private switch to ON', () => {
        cy.get('[data-test=dialog-actions-switch-on]').should('be.visible')
      })

      describe('then click CREATE button', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should create a note', () => {
          cy.get('[data-test=note-list-item-selected]').should('be.visible')
        })

        it('which is private', () => {
          cy.get('[data-test=note-listitem-private]').should('be.visible')
        })
      })
    })
  })
})
