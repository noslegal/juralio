import { getProjectWithMultiFLevelData } from '../../../../../helpers/data/task_operations_test_project_data'
import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/destinationdialog/destinationdialog_page'

describe('create_task_level_f_destinations_disabled.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectWithMultiFLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in creating a Subtask', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Next pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        cy.get('[data-test=action-dialog-button]').click()

        destinationPage.get.parentTypeSelector().click()
        destinationPage.get.parentTypeSubTaskOf().click()

        destinationPage.get.taskSelector().click()
        cy.backendRoute('/matter/*/workstreams/*/tasks*').as('taskGet')
        destinationPage.get.taskSelector().find('Input').type('subtask1')
        cy.wait('@taskGet')
      })

      it('Level F Tasks in the list should be disabled - subtask11 ', () => {
        cy.get('[data-test=task-search-item]')
          .eq(0)
          .parent()
          .should('have.attr', 'tabindex', '-1')
      })

      it('Level F Tasks in the list should be disabled - subtask16', () => {
        cy.get('[data-test=task-search-item]')
          .eq(5)
          .parent()
          .should('have.attr', 'tabindex', '-1')
      })

      it('Other Tasks in the list should be enabled', () => {
        for (let i = 1; i < 5; i++) {
          cy.get('[data-test=task-search-item]')
            .eq(i)
            .parent()
            .should('not.have.attr', 'tabindex', '-1')
        }
      })
    })
  })
})
