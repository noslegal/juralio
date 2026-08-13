import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  getDescriptionField,
  getEditField,
  getZeroStatePlaceholder,
} from '../../../../../../helpers/tasks/task-description-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_description_toolbar.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'tdToolbar',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Toolbar Test Project',
              tasks: [
                { name: 'Empty Task' },
                {
                  name: 'Task With Description',
                  properties: { description: 'Existing content' },
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('toolbar visibility', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
    })

    it('shows the style dropdown button', () => {
      cy.get('[data-test=toolbar-style-menu]').should('be.visible')
    })

    it('shows the format dropdown button', () => {
      cy.get('[data-test=toolbar-format-menu]').should('be.visible')
    })

    it('shows the insert dropdown button', () => {
      cy.get('[data-test=toolbar-insert-menu]').should('be.visible')
    })

    it('shows the undo button disabled with no history', () => {
      cy.get('[data-test=toolbar-undo]').should('be.disabled')
    })

    it('shows the redo button disabled with no history', () => {
      cy.get('[data-test=toolbar-redo]').should('be.disabled')
    })
  })

  describe('bold formatting', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      getEditField().type('Hello world{selectAll}')
      cy.get('[data-test=toolbar-style-menu]').click()
      cy.get('[data-test=toolbar-bold]').click()
    })

    it('wraps the selected text in a bold tag', () => {
      getDescriptionField().find('[contenteditable] strong').should('exist')
    })
  })

  describe('italic formatting', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      getEditField().type('Hello world{selectAll}')
      cy.get('[data-test=toolbar-style-menu]').click()
      cy.get('[data-test=toolbar-italic]').click()
    })

    it('wraps the selected text in an italic tag', () => {
      getDescriptionField().find('[contenteditable] em').should('exist')
    })
  })

  describe('underline formatting', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      getEditField().type('Hello world{selectAll}')
      cy.get('[data-test=toolbar-style-menu]').click()
      cy.get('[data-test=toolbar-underline]').click()
    })

    it('wraps the selected text in an underline tag', () => {
      getDescriptionField().find('[contenteditable] u').should('exist')
    })
  })

  describe('heading format', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      getEditField().type('My heading')
      cy.get('[data-test=toolbar-format-menu]').click()
      cy.get('[data-test=toolbar-heading-1]').click()
    })

    it('converts the paragraph to a heading', () => {
      getDescriptionField().find('[contenteditable] h1').should('exist')
    })

    describe('switching back to normal paragraph format', () => {
      before(() => {
        cy.get('[data-test=toolbar-format-menu]').click()
        cy.get('[data-test=toolbar-normal]').click()
      })

      it('removes the heading and restores a paragraph', () => {
        getDescriptionField().find('[contenteditable] h1').should('not.exist')
        getDescriptionField().find('[contenteditable] p').should('exist')
      })
    })
  })

  describe('bullet list', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      cy.get('[data-test=toolbar-insert-menu]').click()
      cy.get('[data-test=toolbar-bullet-list]').click()
      getEditField().type('First item')
    })

    it('creates a bullet list in the editor', () => {
      getDescriptionField().find('[contenteditable] ul').should('exist')
      getDescriptionField()
        .find('[contenteditable] li')
        .should('contain', 'First item')
    })
  })

  describe('numbered list', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      cy.get('[data-test=toolbar-insert-menu]').click()
      cy.get('[data-test=toolbar-numbered-list]').click()
      getEditField().type('First item')
    })

    it('creates a numbered list in the editor', () => {
      getDescriptionField().find('[contenteditable] ol').should('exist')
      getDescriptionField()
        .find('[contenteditable] li')
        .should('contain', 'First item')
    })
  })

  describe('undo and redo', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Empty Task')
      getZeroStatePlaceholder().click()
      getEditField().type('Hello world{selectAll}')
      cy.get('[data-test=toolbar-style-menu]').click()
      cy.get('[data-test=toolbar-bold]').click()
    })

    it('the undo button is enabled after applying formatting', () => {
      cy.get('[data-test=toolbar-undo]').should('not.be.disabled')
    })

    describe('after clicking undo', () => {
      before(() => {
        cy.get('[data-test=toolbar-undo]').click({ force: true })
      })

      it('removes the bold formatting', () => {
        getDescriptionField()
          .find('[contenteditable] strong')
          .should('not.exist')
      })

      it('enables the redo button', () => {
        cy.get('[data-test=toolbar-redo]').should('not.be.disabled')
      })
    })

    describe('after clicking redo', () => {
      before(() => {
        cy.get('[data-test=toolbar-redo]').click({ force: true })
      })

      it('restores the bold formatting', () => {
        getDescriptionField().find('[contenteditable] strong').should('exist')
      })
    })
  })

  describe('content saves after editing', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Task With Description')
      cy.get('[data-test=raw-text-line0]').click()
      getEditField().type('{End} updated')
      cy.get('body').click(0, 0)
    })

    it('shows the updated content in read mode', () => {
      getDescriptionField().should('contain', 'Existing content updated')
    })
  })
})
