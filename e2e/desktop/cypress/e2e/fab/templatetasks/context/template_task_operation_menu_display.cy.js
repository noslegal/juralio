import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

describe('template_task_operation_menu_display.cy', () => {
  let user, fixture, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                { name: 'Test Task A' },
                {
                  name: 'Test Task B',
                  tasks: [
                    { name: 'Test Sub Task A' },
                    { name: 'Test Sub Task B' },
                  ],
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

  describe('Opening the operation menu', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()

      createTemplateFromProject(
        'Test Template',
        'testmattertaskcreate',
        'Test Project'
      )
      cy.wait(5000)

      cy.get('[data-test=task-cell-test]').eq(2).click({ timeout: 30000 })

      cy.get('[data-test=template-card-option-menu-button]').click()
    })

    it('Should have the correct menu options', () => {
      cy.get('[data-test=menu-text-rename]').should('be.visible')
      cy.get('[data-test=menu-text-delete]').should('be.visible')
      cy.get('[data-test=menu-text-copy]').should('be.visible')
    })
  })

  describe('Clicking the rename option', () => {
    before(() => {
      cy.get('[data-test=menu-text-rename]').click()
    })

    it('Should focus the name text for renaming', () => {
      cy.get('[data-test=task-name]')
        .find('textarea')
        .not('[aria-hidden="true"]')
        .last()
        .should('have.focus')
    })
  })

  describe('Clicking the copy option', () => {
    before(() => {
      cy.get('[data-test=template-card-option-menu-button]').click()
      cy.get('[data-test=menu-text-copy]').click()
    })

    it('Should open the copy dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain',
        'Copy task:'
      )
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain',
        'Test Sub Task A'
      )
    })
  })

  describe('Clicking the delete option', () => {
    before(() => {
      cy.get('[data-test=cancel-dialog-button]').click()
      cy.get('[data-test=template-card-option-menu-button]').click()
      cy.get('[data-test=menu-text-delete]').click()
    })
    it('Should open the delete dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain',
        'Delete task: Test Sub Task A'
      )
    })
  })
})
