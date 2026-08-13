import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'
import destinationPage from '../../../../../../page/templatetaskdestinationdialog/templatetaskdestinationdialog_page'
import textWithDestinationDialog from '../../../../../../page/textwithdestinationdialog/textwithdestinationdialog_page'

describe('navigate_to_new_template_task_via_snackbar.cy', () => {
  let user, fixture, appPage, templateUrl

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
      },
    })

    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'templatetaskcreateandnav',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Create & Nav Temp Task Spec',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When in the template task details screen', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()
      createTemplateFromProject(
        'template task nav create',
        'templatetaskcreateandnav',
        'Create & Nav Temp Task Spec'
      )
      cy.url().then(result => {
        templateUrl = result
      })
      cy.get('[data-test=task-cell-test]').eq(0).click({ force: true })
    })

    it('displays the template task details', () => {
      cy.get('[data-test=task-name]').should('contain', 'Task To have subtasks')
    })

    it('should display a task level of - "A"', () => {
      taskDetailPage.get.jurNumber().should('contain', 'A')
    })

    describe('When a subtask is created', () => {
      before(() => {
        destinationHelper.openTemplateTaskCreateFlowFromFab()
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('Conquer World')
        cy.get('[data-test="action-dialog-button"]').click()
      })

      describe('When Sub task is created', () => {
        before(() => {
          cy.get('[data-test=task-cell-test]').eq(0).click()
        })
        it('continue to display the parent task details', () => {
          cy.get('[data-test=task-name]').should('contain', 'Conquer World')
        })
      })
    })
  })

  describe('When Task is created from task details screen as a level A task', () => {
    before(() => {
      destinationHelper.openTemplateTaskCreateFlowFromFab()
      cy.get('[data-test=text-prompt-text-field]')
        .find('input')
        .type('Conquer Mars')

      cy.backendRoute('GET', '/projecttemplates/*/tasks/*').as('getTask')
      textWithDestinationDialog.get.editLink().click()
      cy.wait('@getTask')

      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeLevelA().click()
      cy.get('[data-test="action-dialog-button"]').click()
    })

    describe('When Sub task is created', () => {
      before(() => {
        cy.reload()
        cy.login(user.username)
        cy.visit(templateUrl)
        cy.get('[data-test=task-cell-test]').eq(3).click()
      })
      it('continue to display the parent task details', () => {
        cy.get('[data-test=task-name]').should('contain', 'Conquer Mars')
      })
    })
  })
})
