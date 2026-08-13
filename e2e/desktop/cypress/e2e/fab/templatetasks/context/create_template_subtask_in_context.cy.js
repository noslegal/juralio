import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('create_template_subtask_in_context.cy', () => {
  let user, fixture, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'templatetaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Template For Subtask',
              tasks: [{ name: 'Task to have subtasks' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in a Template Task details context', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()

      createTemplateFromProject(
        'template in context create',
        'templatetaskcreate',
        'Template For Subtask'
      )
      cy.get('[data-test=status-tour-close-forever]').click()

      cy.get('[data-test=task-cell-test]', { timeout: 60000 })
        .eq(0)
        .click({ force: true })
    })

    testSubTaskCreation('Monkey', 0)

    testSubTaskCreation('Ape', 1)

    testSubTaskCreation('Penguin', 2)
  })

  function testSubTaskCreation(name, index) {
    describe('When create template task flow initiated,a name is entered and create pressed', () => {
      before(() => {
        destinationHelper.openTemplateTaskCreateFlowFromFab()

        cy.get('[data-test=text-prompt-text-field]').find('input').type(name)

        cy.backendRoute('POST', '/projecttemplates/*/tasks').as('addTask')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@addTask')
        cy.wait(2000)
      })

      it('new SubTask is shown', () => {
        taskdetail_page.get
          .subTasks()
          .get('[data-test=name]')
          .eq(index)
          .should('have.text', name)
      })
    })
  }
})
