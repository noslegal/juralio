import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../helpers/taskmap/task-map-helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('template_map_move.cy', () => {
  let user, fixture, newTemplate
  const taskCellMenu = taskmapPage.operationMenu
  const { moveDialog } = taskDetailPage
  const visitHelpers = new VisitHelpers()

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_move.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'MOON', tasks: [{ name: 'SUN' }] }],
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
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        visitHelpers.visitTemplateTaskMap(newTemplate.id)
      })
    })

    it('should display the expected number of task cells', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 2)
    })

    describe('and trying to move a template task', () => {
      describe('as a level A task', () => {
        before(() => {
          taskCellMenu.taskCellDropDownArrow().eq(1).click()
          taskCellMenu.moveMenuText().click()

          moveDialog.get.destinationSelectionDropdown().click()
          moveDialog.get.destinationOption.levelA().click()
          cy.backendRoute('/projecttemplates/*/tasks').as('templateTasksFech')
          cy.get('[data-test=action-dialog-button]').click()
          cy.get('[data-test=global-snackbar]').should('be.visible')
          cy.get('[data-test=global-snackbar]', {
            timeout: 8000,
          }).should('not.exist')
        })

        checkTaskMapLevelAndDepthCounts([
          {
            depth: 1,
            expectedCount: 2,
            expectedText: ['MOON', 'SUN'],
          },
        ])
      })

      describe('as a subtask', () => {
        before(() => {
          taskCellMenu.taskCellDropDownArrow().eq(1).click()
          taskCellMenu.moveMenuText().click()

          moveDialog.get.destinationSelectionDropdown().click()
          moveDialog.get.destinationOption.newTask().click()
          moveDialog.get.destinationTextField().clear().type('MOON')
          cy.get('[data-test=task-item-name-0]')
          cy.get('[data-test=task-item-name-0]').click()
          cy.backendRoute('/projecttemplates/*/tasks').as('templateTasksFech')
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@templateTasksFech')
          cy.wait(5000)
        })

        checkTaskMapLevelAndDepthCounts([
          {
            depth: 1,
            expectedCount: 1,
            expectedText: ['MOON'],
          },
        ])

        checkTaskMapLevelAndDepthCounts([
          {
            depth: 2,
            expectedCount: 1,
            expectedText: ['SUN'],
          },
        ])
      })
    })
  })
})
