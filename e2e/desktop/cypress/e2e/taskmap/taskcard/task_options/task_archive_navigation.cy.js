/* eslint-disable arrow-parens */
import { getProjectAToFLevelData } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_archive_navigation.cy', () => {
  let appPage, fixture
  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapNavTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAToFLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when a sub task is archived ', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('subtask4 B')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu-archive]').click()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should return to task map with parent task selected', () => {
      cy.url().should('contains', `/taskmap?id=${fixture.tasks[0].id}`)
    })
  })

  describe('when a Level A task is archived ', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('task1 A')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu-archive]').click()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should return to task map with parent task selected', () => {
      cy.url().should('contains', '/taskmap')
      cy.url().should('not.contain', 'id=')
    })

    // This step verifies that the selected task state has been reset.
    describe('when visiting another task ', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap()
        cy.get('[data-test=depth-1]')
          .eq(0)
          .should('have.length', 1)
          .click('center')
      })
      it('should display a label saying this task has no notes', () => {
        taskdetail_page.get.noNotesPrompt().should('have.text', 'No posts yet')
      })
    })
  })
})
