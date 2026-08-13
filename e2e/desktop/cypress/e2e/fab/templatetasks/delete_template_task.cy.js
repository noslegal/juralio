import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('delete_template_task.cy', () => {
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

  describe('Delete a task-cell-test (Non A-Level)', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()

      createTemplateFromProject(
        'Test Template',
        'testmattertaskcreate',
        'Test Project'
      )

      cy.wait(500)

      cy.get('[data-test=task-cell-test]').eq(2).click()

      cy.get('[data-test=template-card-option-menu-button]').click()
      cy.get('[data-test=menu-text-delete]').click()
      cy.backendRoute('DELETE', '/projecttemplates/*/tasks/*').as('deleteTask')
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait('@deleteTask')
    })

    it('Should have the correct number of tasks', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 3)
    })
  })

  describe('Delete a task-cell-test (Non A-Level)', () => {
    before(() => {
      cy.backendRoute('GET', '/projecttemplates/*/tasks/*').as('getTask')
      cy.get('[data-test=task-cell-test]').eq(1).click()
      cy.wait('@getTask')

      cy.get('[data-test=template-card-option-menu-button]').click()
      cy.get('[data-test=menu-text-delete]').click()
      cy.backendRoute('DELETE', '/projecttemplates/*/tasks/*').as('deleteTask')
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait('@deleteTask')
    })

    it('Should have the correct number of tasks', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 1)
    })
  })
})
