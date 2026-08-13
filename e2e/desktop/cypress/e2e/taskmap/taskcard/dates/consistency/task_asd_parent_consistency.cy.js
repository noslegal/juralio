import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_asd_parent_consistency.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskStatusSortingTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: get3LevelATasksWithSubsData(),
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When a child is in progress', () => {
    before(() => {
      cy.login(user.username)
      appPage.changeTaskStatus('task2', 1)
      selectDate('[data-test="actual-start-date"]', 2016, 6, 14)
      appPage.changeTaskStatus('subtask5', 1)
      selectDate('[data-test="actual-start-date"]', 2016, 6, 16)
    })

    it('should display the updated date', () => {
      cy.get('[data-test="actual-start-date"]').should(
        'contain.text',
        'Thu 16 Jun 2016'
      )
    })

    describe('When the task ASD is changed to an earlier date than its parents ASD', () => {
      before(() => {
        cy.login(user.username)
      })

      describe('when selecting the date', () => {
        it('should be disabled', () => {
          cy.get('[data-test="actual-start-date"]').click()
          cy.wait(1000)
          cy.get('[data-test=calendar-date]')
            .contains(new RegExp('^13$'))
            .should('have.css', 'pointer-events', 'none')
        })
      })
    })
  })
})
