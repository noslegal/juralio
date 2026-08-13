import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  clickHoverButton,
  hideHoverButtons,
  triggerHoverButtons,
} from '../../../../../helpers/taskmap/task-map-helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_map_create_child.cy', () => {
  let user, fixture, newTemplate

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_create_child.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'task1A' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when navigating to template map', () => {
    const newTemplateName = nameGenerator.generate().spaced

    before(() => {
      cy.login(user.username)

      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        cy.visit('/#/templates')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
      })
    })

    it('should open template map', () => {
      cy.url().should('contains', `template/${newTemplate.id}/taskmap`)
    })

    it('should display the expected number of task cells', () => {
      cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
        'have.length',
        1
      )
    })

    describe('when the mouse enters a task with no children and no siblings', () => {
      before(() => {
        triggerHoverButtons('task1A')
      })

      describe('and the create child button is clicked', () => {
        before(() => {
          clickHoverButton('[data-test=hover-button-right]')
        })

        it('should display a new task cell containing an input field', () => {
          cy.get('[data-test=hover-button-right]').should('not.exist')
          cy.get('[data-test=task-cell-test]').should('have.length', 2)
          cy.get('[data-test=edit-name-field]').should('be.visible')
        })

        describe('and escape is pressed', () => {
          before(() => {
            cy.get('[data-test=edit-name-field] input').type('{ESC}')
          })

          it('should hide the new task cell containing an input field', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 1)
            cy.get('[data-test=edit-name-field]').should('not.exist')
          })
        })
      })

      after(() => {
        hideHoverButtons('task1A')
      })
    })

    describe('when the mouse enters a task with no children and no siblings again', () => {
      before(() => {
        triggerHoverButtons('task1A')
      })

      describe('and the create child button is clicked, a task name is typed and enter is pressed', () => {
        before(() => {
          clickHoverButton('[data-test=hover-button-right]')
          cy.get('[data-test=edit-name-field] input').type('task1B{Enter}')
          cy.tick(500)
          cy.wait(5000)
        })

        it('should hide the input field and display the name in the new task cell', () => {
          //cy.get('[data-test=edit-name-field] input').should('not.exist')
          cy.get('[data-test=task-cell-test] [data-task-name]')
            .eq(1)
            .should('have.text', 'task1B')
        })
      })

      after(() => {
        hideHoverButtons('task1A')
      })
    })

    describe('when visit the template again after refresh', () => {
      before(() => {
        cy.login(user.username)
        cy.visit(`/#/template/${newTemplate.id}/taskmap`)
      })

      it('should display the expected number of task cells', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 2)
      })

      describe('and mouse over task1B', () => {
        before(() => {
          triggerHoverButtons('task1B')
          cy.wait(2000)
        })

        describe('and trying to create a sibling BELOW', () => {
          before(() => {
            triggerHoverButtons('task1B')
            cy.clock()
            cy.get('[data-test="hover-button-bottom"]').click()
            cy.get('[data-test=edit-name-field] input').type('task2B{Enter}')
            cy.tick(500)
            cy.wait(5000)
          })

          it('should hide the input field and display the name in the new task cell', () => {
            cy.get('[data-test=task-cell-test] [data-task-name]')
              .eq(2)
              .should('have.text', 'task2B')
          })
        })
      })
    })

    describe('when visit the template again after refresh', () => {
      before(() => {
        cy.login(user.username)
        cy.visit(`/#/template/${newTemplate.id}/taskmap`)
      })

      it('should display the expected number of task cells', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 3)
      })

      describe('and mouse over task1B', () => {
        before(() => {
          triggerHoverButtons('task1B')
        })

        describe('and trying to create a sibling ABOVE', () => {
          before(() => {
            triggerHoverButtons('task1B')
            cy.clock()
            cy.get('[data-test="hover-button-top"]').click()
            cy.get('[data-test=edit-name-field] input').type('task3B{Enter}')
            cy.tick(500)
            cy.wait(5000)
          })

          it('should hide the input field and display the name in the new task cell', () => {
            cy.get('[data-test=task-cell-test] [data-task-name]')
              .eq(1)
              .should('have.text', 'task3B')
          })
        })
      })
    })
  })
})
