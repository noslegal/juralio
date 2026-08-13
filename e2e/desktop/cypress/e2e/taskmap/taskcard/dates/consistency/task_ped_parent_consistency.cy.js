import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_ped_parent_consistency.cy', () => {
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

  describe('When updating PED of a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('task2')
      selectDate('[data-test="planned-start-date"]', 2015, 6, 15)
      selectDate('[data-test="planned-end-date"]', 2015, 7, 15)
    })

    it('should display the updated dates', () => {
      cy.get('[data-test="planned-start-date"]')
        .should('contain.text', 'Mon 15 Jun 2015')
      cy.get('[data-test="planned-end-date"]')
        .should('contain.text', 'Wed 15 Jul 2015')
    })

    describe('and trying to make a a child task PED after its parent', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask5')
      })

      describe('when trying to choose the date', () => {
        it('should be disabled', () => {
          cy.get('[data-test="planned-start-date"]').click()
          cy.wait(1000)
          cy.get('[data-test=calendar-date]')
              .contains(new RegExp('^2$'))
              .should('have.css', 'pointer-events', 'none')
        })

      })
    })
  })
})
