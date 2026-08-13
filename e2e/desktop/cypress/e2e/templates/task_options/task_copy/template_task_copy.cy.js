import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openTemplateTaskCopy } from '../../../../../../helpers/tasks/task_operations_helpers'
import {
    createTemplate,
    createTemplateTask
} from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

describe('template_task_copy.cy', () => {
  let user, fixture, visitHelpers

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TmplTaskCopyTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Project to be template',
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      visitHelpers = new VisitHelpers()
    })
  })

  describe('When the template task details are loaded', () => {
    let templateId, templateTaskId
    const templateTaskName = 'Test Template Task'

    before(() => {
      cy.login(user.username)
      createTemplate('New Template', fixture.projects[0].id)
        .then(template => {
          templateId = template.id
          return createTemplateTask(templateId, null, templateTaskName)
        })
        .then(templateTask => {
          templateTaskId = templateTask.id
          return visitHelpers.visitTemplateTaskDetails(
            templateId,
            templateTaskId
          )
        })
    })

    describe('When trying to copy a task', () => {
      before(() => {
        openTemplateTaskCopy()
      })

      it('should display the copy task dialog', () => {
        cy.get('[data-test="dialog-header-title-text"]')
          .scrollIntoView()
          .should('be.visible')
      })

      describe('click the cancel button', () => {
        before(() => {
          cy.get('[data-test="cancel-dialog-button"]').click()
        })

        it('should NOT display the copy task dialog', () => {
          cy.get('[data-test="dialog-header-title-text"]').should(
            'not.exist'
          )
        })
      })

      describe('enter new task name and press enter', () => {
        const copiedTemplateTaskName = `Copy of ${templateTaskName}`
        before(() => {
          cy.login(user.username)
          visitHelpers.visitTemplateTaskDetails(templateId, templateTaskId)
          openTemplateTaskCopy()
          cy.get('[data-test="new-task-name-text-field"]')
            .find('input')
            .type(copiedTemplateTaskName)
            .type('{enter}')
        })

        it('should close the dialog', () => {
          cy.get('[data-test="dialog-header-title-text"]').should(
            'not.exist'
          )
        })

        describe('refresh to page and verify the data', () => {
          before(() => {
            cy.login(user.username)
            visitHelpers.visitTemplateTaskMap(templateId)
          })

          it('should have 2 level A task', () => {
            cy.get('[depth="1"]').should('have.length', 2)
          })

          it('the second 1 should be the copied task', () => {
            cy.get('[depth="1"]')
              .eq(1)
              .should('contain', copiedTemplateTaskName)
          })
        })
      })
    })
  })
})
