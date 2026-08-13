import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
  clickHoverButton,
  triggerHoverButtons,
} from '../../../../../helpers/taskmap/task-map-helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('create_task_from_template.cy', () => {
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
              name: 'Task Create From FAB Spec',
              tasks: [{ name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('create a template', () => {
    before(() => {
      cy.login(user.username)
      createTemplate('test', fixture.projects[0].id).then(res => {
        publishTemplate(res.id)
      })
    })

    describe('When creating Task from whole template', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Here Goes')
        cy.get('[data-test=fab-button]').click()
        cy.wait(5000)
        cy.get('[data-test=create-task-from-template-button]', {
          timeout: 30000,
        }).click({
          force: true,
        })
      })
      it('should show the dialog with continue disabled', () => {
        cy.get('[data-test="dialog-header-title-text"]').should('exist')
        cy.get('[data-test="dialog-header-title-text"]').should(
          'contain.text',
          'Choose a template'
        )
        cy.get('[data-test="action-dialog-button"]').should('be.disabled')
      })
      describe('When selecting a template', () => {
        before(() => {
          cy.get('[data-test="template"]', { timeout: 10000 }).eq(0).click()
          cy.get('[data-test="action-dialog-button"]').should('be.enabled')
        })
        it('should let the user continue and show next screen', () => {
          cy.get('[data-test="action-dialog-button"]').click()
          cy.wait(5000)
          cy.get('[data-test="dialog-header-title-text"]').should(
            'contain.text',
            'Whole or part of template'
          )
        })
        describe('when confirming choice of whole template', () => {
          before(() => {
            cy.get('[data-test="action-dialog-button"]').click()
            cy.get('[data-test="loading-text"]').should('exist')
          })
          it(
            'should redirect to the taskmap with new tasks created',
            { retries: { runMode: 3, openMode: 3 } },
            () => {
              cy.url().should('contains', '/taskmap')
              cy.get('[data-test="task-cell-test"]').eq(1).should('exist')
            }
          )
        })
      })
    })
    describe('when creating a task from selected part of template', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Here Goes')
        cy.get('[data-test=fab-button]').click()
        cy.wait(5000)
        cy.get('[data-test=create-task-from-template-button]', {
          timeout: 30000,
        }).click({
          force: true,
        })
      })
      it('should show the dialog with continue disabled', () => {
        cy.get('[data-test="dialog-header-title-text"]').should('exist')
        cy.get('[data-test="dialog-header-title-text"]').should(
          'contain.text',
          'Choose a template'
        )
        cy.get('[data-test="action-dialog-button"]').should('be.disabled')
      })
      describe('When selecting a template', () => {
        before(() => {
          cy.wait(5000)
          cy.get('[data-test="template"]', { timeout: 10000 }).eq(0).click()
          cy.get('[data-test="action-dialog-button"]').should('be.enabled')
        })
        it('should let the user continue and show next screen', () => {
          cy.get('[data-test="action-dialog-button"]').click()
          cy.wait(5000)
          cy.get('[data-test="dialog-header-title-text"]').should(
            'contain.text',
            'Whole or part of template'
          )
        })
        describe('when selecting part of template', () => {
          before(() => {
            cy.get('[data-test=use-partial-template-radio]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(5000)
            cy.url().should('contains', '/template')
            cy.get('[data-test="task-selection-panel-text"]').should(
              'contain.text',
              'Select the task you want to use'
            )
            cy.get('[data-test=task-cell-test]').eq(0).click()
            cy.get('[data-test=confirm-selection-button]').click({
              force: true,
            })
          })
          it(
            'should redirect the user back to the taskmap',
            { retries: { runMode: 3, openMode: 3 } },
            () => {
              cy.url().should('contains', '/taskmap')
            }
          )
          describe('When selecteing a drop zone for the task', () => {
            before(() => {
              cy.wait(5000)
              triggerHoverButtons('Here Goes')
              clickHoverButton('[data-test=hover-button-right]')
            })
            it('should have created the tasks at the right position', () => {
              cy.wait(5000)
              cy.get('[data-test="task-cell-test"]').eq(1).should('exist')
            })
          })
        })
      })
    })
  })
})
