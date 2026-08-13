import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_asd_children_consistency.cy', () => {
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

  describe('When the task parent is in progress and has active children', () => {
    before(() => {
      cy.login(user.username)
      appPage.changeTaskStatus('task2', 1)
      selectDate('[data-test="actual-start-date"]', 2016, 6, 14)
      appPage.changeTaskStatus('subtask5', 1)
      selectDate('[data-test="actual-start-date"]', 2016, 6, 16)
      cy.get('[data-test="actual-start-date"]').should(
        'contain.text',
        'Thu 16 Jun 2016'
      )
      appPage.visitTaskByName('task2')
    })

    it('should display the correct date', () => {
      cy.get('[data-test="actual-start-date"]').should(
        'contain.text',
        'Tue 14 Jun 2016'
      )
    })

    describe('When the parents ASD is changed to an later date than its childs ASD', () => {
      before(() => {
        cy.login(user.username)
        selectDate('[data-test="actual-start-date"]', 2016, 6, 22)
      })

      it('should have the correct ASD', () => {
        cy.get('[data-test="actual-start-date"]').should(
          'contain.text',
          'Tue 14 Jun 2016'
        )
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
        })

        describe('Clicking the Cancel button ', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
          })
          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })
          it('The ASD should NOT persist the later date', () => {
            cy.get('[data-test="actual-start-date"]').should(
              'not.contain.text',
              'Wed 22 Jun 2016'
            )
          })
        })

        describe('Clicking the continue button', () => {
          before(() => {
            cy.login(user.username)
            selectDate('[data-test="actual-start-date"]', 2016, 6, 22)
            cy.wait(2000)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(2000)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The ASD should persist the changed date', () => {
            cy.get('[data-test="actual-start-date"]').should(
              'contain.text',
              'Wed 22 Jun 2016'
            )
          })

          describe('and its first child should persist the change', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask5')
            })

            it('The ASD should persist the parents ASD', () => {
              cy.get('[data-test="actual-start-date"]').should(
                'contain.text',
                'Wed 22 Jun 2016'
              )
            })
          })
        })
      })
    })
  })
})
