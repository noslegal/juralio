import {
    checkLinkUrl,
    getLinkInputField,
    populateLinkDetails
} from '../../../../../helpers/links/task_content_links_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

const urlErrorMessage = 'A valid URL or iManage link is required'

describe('create_update_link.cy', () => {
  const urlField = taskdetail_page.noteDetails.get.url
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'LinkDisplaySpec',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'LinkDisplay',
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

    describe('entering link details', () => {
      before(() => {
        populateLinkDetails(
          'My favourite search engine',
          'https://www.bing.com/',
          'link'
        )
      })

      it('the url should have "https://" automatically prepended', () => {
        getLinkInputField().should('have.value', 'https://www.bing.com/')
      })

      describe('and clicking "Create"', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })

        it('should show the relevant icon for the link created', () => {
          cy.get('[data-test=web-icon]').should('be.visible')
        })

        it('should show the link', () => {
          taskdetail_page.noteDetails.get.url.link().should('be.visible')
        })

        checkLinkUrl('https://www.bing.com/')

        it('should be set to open in a new tab', () => {
          taskdetail_page.noteDetails.get.url
            .link()
            .should('have.attr', 'target', '_blank')
        })

        it('should link to resource securely', () => {
          taskdetail_page.noteDetails.get.url
            .link()
            .should('have.attr', 'rel', 'noopener noreferrer')
        })

        it('should show the edit button', () => {
          taskdetail_page.noteDetails.get.url.editButton().should('be.visible')
        })

        describe('When the link url is edited (without entering protocol)', () => {
          before(() => {
            urlField.editButton().click()

            urlField
              .editTextField()
              .find('input')
              .type('{selectall}')
              .type('https://www.duckduckgo.com/')
              .type('{enter}')
          })

          checkLinkUrl('https://www.duckduckgo.com/')
        })

        describe('When the link url is edited to a unc link', () => {
          before(() => {
            urlField.editButton().click()

            urlField
              .editTextField()
              .find('input')
              .type('{selectall}')
              .type('\\\\test.url\\Matters')
              .type('{enter}')
          })

          checkLinkUrl('\\\\test.url\\Matters')
        })

        describe('When the link url is partially entered', () => {
          before(() => {
            urlField.editButton().click()

            urlField
              .editTextField()
              .find('input')
              .type('{selectall}')
              .type('www.')
          })

          it('the error message is not shown', () => {
            cy.get('[data-test=edit-field]').should(
              'not.contain',
              urlErrorMessage
            )
          })

          describe('When the link url entry is completed', () => {
            before(() => {
              urlField
                .editTextField()
                .find('input')
                .clear()
                .type('https://www.bing.com')
                .type('{enter}')
            })

            it('the error message is not shown', () => {
              cy.get('[data-test=edit-field]').should('not.exist')
            })

            checkLinkUrl('https://www.bing.com')
          })
        })

        describe('When the link url is invalid', () => {
          before(() => {
            urlField.editButton().click()

            urlField
              .editTextField()
              .find('input')
              .type('{selectall}')
              .type('ttp://www.bing.com{enter}')
          })

          it('the error message is shown', () => {
            cy.get('[data-test=edit-field]').should('contain', urlErrorMessage)
          })
        })

        describe('When the link url is set as final', () => {
          before(() => {
            // cy.get('body').click()
            cy.get('[data-test=finalise-button]').click()
          })

          it('Should not show edit button', () => {
            urlField.editButton().should('not.exist')
          })
        })
      })
    })
    describe('when entering a unc link when creating a new link', () => {
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-post-fab-button]').click()
        cy.get('[data-test=web-link]').click()
        populateLinkDetails(
          'My favourite unc file',
          '\\\\test.url\\Matters',
          'link'
        )
      })

      it('the url should show the valid unc link', () => {
        getLinkInputField().should('have.value', '\\\\test.url\\Matters')
      })
      describe('when saving the unc link should be preserved', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should show the relevant icon for the link created', () => {
          cy.get('[data-test=web-icon]').should('be.visible')
        })

        it('should show the link', () => {
          taskdetail_page.noteDetails.get.url.link().should('exist')
        })

        checkLinkUrl('\\\\test.url\\Matters')
      })
    })
  })
})
