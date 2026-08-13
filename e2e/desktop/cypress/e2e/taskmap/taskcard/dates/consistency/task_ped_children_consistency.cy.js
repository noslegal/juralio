import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_ped_children_consistency.cy', () => {
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

  describe('When updating dates on a parent', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('task2')
      selectDate('[data-test="planned-end-date"]', 2015, 6, 20)
      appPage.visitTaskByName('subtask5')
      selectDate('[data-test="planned-end-date"]', 2015, 6, 20)
    })

    describe('and trying to set planned end date earlier than its child', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('task2')
        selectDate('[data-test="planned-end-date"]', 2015, 6, 18)
      })

      describe('a dialog should be displayed', () => {
        it('should have the correct title', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'contain.text',
            'Impact of date change in Task #5 (task2)'
          )
        })

        it('should display the confirmation dialog', () => {
          cy.get('[data-test=affected-task-count]').should(
            'contain.text',
            '1 Task'
          )
          cy.get('[data-test=old-date]').should('contain.text', '20 Jun 2015')
          cy.get('[data-test=new-date]').should('contain.text', '18 Jun 2015')
        })

        describe('Clicking the Cancel button ', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
            cy.wait(5000)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The PED should NOT persist the earlier date', () => {
            cy.get('[data-test="planned-end-date"]').should(
              'not.contain.text',
              'Thu 18 Jun 2015'
            )
          })
        })

        describe('Clicking the continue button', () => {
          before(() => {
            cy.login(user.username)
            selectDate('[data-test="planned-end-date"]', 2015, 6, 18)
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The PED should persist the changed date', () => {
            cy.get('[data-test="planned-end-date"]').should(
              'contain.text',
              'Thu 18 Jun 2015'
            )
            cy.wait(5000)
          })

          describe('and its child task', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask5')
              cy.wait(5000)
            })

            it('should have PED updated', () => {
              cy.get('[data-test="planned-end-date"]').should(
                'contain.text',
                'Thu 18 Jun 2015'
              )
            })
          })
        })
      })
    })
  })
})
