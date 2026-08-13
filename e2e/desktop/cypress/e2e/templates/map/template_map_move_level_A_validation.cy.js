import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

describe('template_map_move_level_A_validation.cy', () => {
  let user, fixture, newTemplate
  const taskCellMenu = taskmapPage.operationMenu
  const { moveDialog } = taskDetailPage
  const visitHelpers = new VisitHelpers()

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_move_levelA_validation',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'TASK1',
                  tasks: [{ name: 'TASK1-B' }, ,],
                },
                { name: 'TASK2' },
                { name: 'TASK3' },
                { name: 'TASK4' },
                { name: 'TASK5' },
                { name: 'TASK6' },
                { name: 'TASK7' },
                { name: 'TASK8' },
                { name: 'TASK9' },
                { name: 'TASK10' },
                { name: 'TASK11' },
                { name: 'TASK12' },
                { name: 'TASK13' },
                { name: 'TASK14' },
                { name: 'TASK15' },
                { name: 'TASK16' },
              ],
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
      cy.get('[data-test=task-cell-test]').should('have.length', 17)
    })

    describe('and trying to move a subtask to level A', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(8).click()
        taskCellMenu.moveMenuText().click()
        moveDialog.get.destinationSelectionDropdown().click()
      })

      it('should display level A validation message', () => {
        moveDialog.get.destinationOption.levelA().should('not.exist')
      })
    })
  })
})
