import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../helpers/taskmap/task-map-helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('template_map_copy_delete.cy', () => {
  let user, fixture, newTemplate
  const taskCellMenu = taskmapPage.operationMenu
  const visitHelpers = new VisitHelpers()

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_copy_delete.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'MOON' }],
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
        visitHelpers.visitTemplateTaskMap(newTemplate.id)
      })
    })

    it('should display the expected number of task cells', () => {
      cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
        'have.length',
        1
      )
    })

    describe('and trying to copy a template task', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(0).click()
        taskCellMenu.copyMenuText().click()

        cy.backendRoute('/projecttemplates/*/tasks').as('templateTasksFetch')
        cy.get('[data-test=new-task-name-text-field]')
          .find('input')
          .clear()
          .type('SUN')
          .type('{enter}')

        cy.wait('@templateTasksFetch')
        cy.wait(5000)
      })

      checkTaskMapLevelAndDepthCounts([
        {
          depth: 1,
          expectedCount: 2,
          expectedText: ['MOON', 'SUN'],
        },
      ])
    })

    describe('and then delete the copied task', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click()
        taskCellMenu.deleteMenuText().click()

        cy.backendRoute('/projecttemplates/*/tasks').as('templateTasksFech')
        cy.backendRoute('DELETE', '/projecttemplates/*/tasks/*').as(
          'deleteTask'
        )
        cy.get('[data-test=action-dialog-button]').click('right')
        cy.wait('@deleteTask')
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
    })
  })
})
