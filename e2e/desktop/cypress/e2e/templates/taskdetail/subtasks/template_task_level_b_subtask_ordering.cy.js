import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'


const newTemplateName = nameGenerator.generate().spaced
const visitHelpers = new VisitHelpers()

describe('template_task_level_b_subtask_ordering.cy', () => {
  let user, fixture, newTemplate, rootTask

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_task_subtask_ordering.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'A0',
                  tasks: [{ name: 'B1' }, { name: 'B2' }, { name: 'B3' }],
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When visiting task details for a template task', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        rootTask = template.tasks.find(task => task.level === 1)
        visitHelpers.visitTemplateTaskDetails(newTemplate.id, rootTask.id)
      })
    })

    it('should show the tasks in their initial expected order', () => {
      cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'B1')
      cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'B2')
      cy.get('[data-test=task-cell-test]').eq(2).should('contain', 'B3')
    })

    describe("when dragging the last subtask into the first subtask's position", () => {
      before(() => {
        cy.backendRoute('PATCH', '/projecttemplates/*/tasks').as('updateTasks')
        cy.dragAndDrop( "[data-test=task-cell-test]", "[data-test=task-cell-test]",2,0)


        cy.wait('@updateTasks')
      })

      it('should show the tasks in the expected order after drag & drop', () => {
        cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'B3')
        cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'B1')
        cy.get('[data-test=task-cell-test]').eq(2).should('contain', 'B2')
      })

      describe('when refreshing the page', () => {
        before(() => {
          cy.login(user.username)
          cy.reload()
        })

        it('the order should be maintained', () => {
          cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'B3')
          cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'B1')
          cy.get('[data-test=task-cell-test]').eq(2).should('contain', 'B2')
        })
      })
    })
  })
})
