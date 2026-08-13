import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('template_task_map_move_new_task.cy', () => {
  let user,
    fixture,
    template,
    newTemplateName = 'template_task_map_move_new_task.cy'

  before(() => {
    createKnowledgeManagerUser()
      .then((createdUser) => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'taskMapDNDTest',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [
                  {
                    name: 'Test 1',
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          (createdTemplate) => {
            template = createdTemplate
            visitHelpers.visitTemplateTaskMap(template.id)
          }
        )
      })
  })

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      // visitHelpers.visitTemplateTaskMap(template.id)
      // cy.get('.reactour__close').click({ force: true })

      // triggerMouseOverForTask('Test 1')
      cy.get('[data-test=task-cell-test]', { timeout: 30000 })
        .eq(0)
        .trigger('mouseover')
    })

    describe('and the create child button is clicked, a task name is typed and enter is pressed', () => {
      before(() => {
        cy.get('[data-test=hover-button-bottom]').click()
        cy.get('[data-test=edit-name-field] input').type('Yeti{Enter}')
        cy.wait(2400)
        cy.get('[data-test=edit-name-field] input').type('{Esc}')
      })

      it('should hide the input field and display the name in the new task cell', () => {
        cy.get('[data-test=edit-name-field] input').should('not.exist')
        cy.get('[data-test=task-cell-test] [data-task-name]')
          .eq(1)
          .should('have.text', 'Yeti')
      })

      // describe('The task can be moved successfully', () => {
      //   before(() => {
      //     performTemplateDrag(2, generatePoint(900, 130), { wait: false })
      //     cy.wait(400)
      //     cy.get('[data-test=enterMoveMode]').click()
      //     cy.wait(500)
      //     cy.get('[data-test=move-button-right]').eq(0).click()
      //     cy.wait(500)
      //     cy.login(user.username)
      //     cy.reload()
      //   })
      //   checkTaskMapLevelAndDepthCounts([
      //     {
      //       depth: 1,
      //       expectedCount: 1,
      //     },
      //     {
      //       depth: 2,
      //       expectedCount: 1,
      //     },
      //   ])
      // })
    })
  })
})

const triggerMouseOverForTask = (taskName) => {
  getTaskCell(taskName).trigger('mouseover')
  cy.wait(1000)
}
const getTaskCell = (taskName) => {
  cy.get('div')
    .contains(new RegExp(`^${taskName}$`))
    .scrollIntoView()
}
