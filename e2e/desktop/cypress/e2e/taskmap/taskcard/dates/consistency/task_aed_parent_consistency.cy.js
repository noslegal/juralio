import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_aed_parent_consistency.cy', () => {
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

  describe('When updating AED of a done task', () => {
    before(() => {
      cy.login(user.username)
      appPage.changeTaskStatus('task2', 2, true)
      selectDate('[data-test="actual-start-date"]', 2015, 6, 15)
      selectDate('[data-test="actual-end-date"]', 2015, 7, 15)
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should display the updated dates', () => {
      cy.get('[data-test="actual-start-date"]')
        
        .should('contain.text', 'Mon 15 Jun 2015')
      cy.get('[data-test="actual-end-date"]')
        
        .should('contain.text', 'Wed 15 Jul 2015')
    })

    describe('and trying to make a a child task AED after its parent', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask5')
      })

      describe('when selecting the date', () => {
        it('should be disabled', () => {
          cy.get('[data-test="actual-end-date"]').click()
          cy.wait(1000)
          cy.get('[data-test=calendar-date]')
              .contains(new RegExp('^17$'))
              .should('have.css', 'pointer-events', 'none')
        })

        
        

        
      })
    })
  })
})
