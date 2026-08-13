import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../helpers/snackbar/snackbar-helper'
import { enterTaskName } from '../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../page/destinationdialog/destinationdialog_page'

describe('direct_route_task_details.cy', () => {
  let user, fixture, appPage

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
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'directroute',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'Task1' }],
            },
            {
              name: 'Project 2',
              tasks: [{ name: 'Direct task' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when a task is created in a different project', () => {
    before(() => {
      cy.login(user.username)
      cy.reload()
      appPage.visitTaskMap(0)

      enterTaskName('task 7')
      cy.wait(5000)
      destinationPage.get.projectSelectorInput().click()
      cy.wait(5000)

      destinationPage.get.projectSelectorInput().clear().type('Project 2')
      destinationPage.get
        .projectSelectorItem()
        .should('contain.text', 'Project 2')
      destinationPage.get.projectSelectorItem().click()
      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeLevelA().click()

      cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as(
        'postNewTask'
      )
      destinationPage.get.createButton().click()
      cy.wait('@postNewTask')
    })

    describe('when the new task is visited via the snackbar link', () => {
      before(() => {
        cy.backendRoute('/matter/*/workstreams/*/task/*').as('getTask')
        snackbarHelper.clickActionButton()
        cy.wait('@getTask')
      })
      describe('task status should be visible', () => {
        it('should have "not started" status text"', () => {
          cy.get('[data-test=task-header-status-text]').should(
            'have.text',
            'Not started'
          )
        })
      })
    })
  })

  describe('when visiting a task directly', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Direct task')
    })

    describe('task status should be visible', () => {
      it('should have "not started" status text"', () => {
        cy.get('[data-test=task-header-status-text]').should(
          'have.text',
          'Not started'
        )
      })
    })
  })
})
