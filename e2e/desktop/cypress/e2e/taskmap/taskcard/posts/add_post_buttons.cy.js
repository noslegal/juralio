import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('add_post_buttons.cy', () => {
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

  describe('When user clicks the zero state button', () => {
    before(() => {
      appPage.visitTaskByName('Task For Creating Links')
      cy.get('[data-test=create-post-button]').click()
    })

    it('there should be 4 options', () => {
      cy.get('[data-test=blank-note]').should('exist')

      cy.get('[data-test=meeting-note]').should('exist')

      cy.get('[data-test=document-link]').should('exist')
      cy.get('[data-test=web-link]').should('exist')
    })

    it('The first option should have text "Note (blank)"', () => {
      cy.get('[data-test=blank-note]').eq(0).should('have.text', 'Note (blank)')
    })

    it('The second option should have text "Meeting Note"', () => {
      cy.get('[data-test=meeting-note]')
        .eq(0)
        .should('have.text', 'Meeting note')
    })
    it('The third option should have text "Document"', () => {
      cy.get('[data-test=document-link]')
        .eq(0)
        .should('have.text', ' Document link')
    })
    it('The second option should have text "Web link"', () => {
      cy.get('[data-test=web-link]').eq(0).should('have.text', 'Web link')
    })

    describe('When user clicks the links button', () => {
      before(() => {
        cy.get('[data-test=web-link]').eq(0).click()
      })

      it('the links popup should appear and have the correct title', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'have.text',
          'Create a new web link'
        )
      })
    })
  })
})
