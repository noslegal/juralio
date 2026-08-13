import { get3LevelATasksWithSubsData } from '../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

describe('task_aed_children_consistency.cy', () => {
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

  describe('When the task parent status is DONE and has active children', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')
      cy.wait(3000)
      appPage.visitTaskByName('task2')
      appPage.changeTaskStatus('task2', 2, true)
      selectDate('[data-test="actual-start-date"]', 2015, 6, 15)
      cy.wait(3000)
    })

    it('should display the updated date', () => {
      cy.get('[data-test="actual-start-date"]').should(
        'contain.text',
        'Mon 15 Jun 2015'
      )
    })

    describe('When the parents end date is changed to an earlier date', () => {
      before(() => {
        cy.login(user.username)
        selectDate('[data-test="actual-end-date"]', 2016, 6, 15)
      })

      describe('a dialog should be displayed', () => {
        it('should have the correct title', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'contain.text',
            'Impact of date change in Task #5 (task2)'
          )
        })

        describe('Clicking the Cancel button ', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
          })
          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })
          it('The AED should NOT persist the earlier date', () => {
            cy.get('[data-test="actual-end-date"]').should(
              'not.contain.text',
              'Wed 15 Jun 2016'
            )
          })
        })

        describe('Clicking the continue button', () => {
          before(() => {
            cy.login(user.username)
            selectDate('[data-test="actual-end-date"]', 2016, 6, 14)
            cy.get('[data-test=action-dialog-button]').click()
            cy.wait(5000)
          })

          it('should no longer display the dialog', () => {
            cy.get('[data-test=dialog-prompt-text]').should('not.exist')
          })

          it('The ASD should not change', () => {
            cy.get('[data-test="actual-start-date"]').should(
              'contain.text',
              'Mon 15 Jun 2015'
            )
          })

          it('The AED should persist the changed date', () => {
            cy.get('[data-test="actual-end-date"]').should(
              'contain.text',
              'Tue 14 Jun 2016'
            )
          })

          describe('and its first child should persist the change', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask5')
            })

            it('The ASD should be the same as the AED', () => {
              cy.get('[data-test="actual-start-date"]').should(
                'contain.text',
                'Tue 14 Jun 2016'
              )
            })

            it('The AED should persist the parents AED', () => {
              cy.get('[data-test="actual-end-date"]').should(
                'contain.text',
                'Tue 14 Jun 2016'
              )
            })
          })

          describe('and its second child should persist the change', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask6')
            })

            it('The ASD should be the same as the AED', () => {
              cy.get('[data-test="actual-start-date"]').should(
                'contain.text',
                'Tue 14 Jun 2016'
              )
            })

            it('The AED should persist the parents AED', () => {
              cy.get('[data-test="actual-end-date"]').should(
                'contain.text',
                'Tue 14 Jun 2016'
              )
            })
          })

          describe('and its third child should persist the change', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitTaskByName('subtask7')
            })

            it('The ASD should be the same as the AED', () => {
              cy.get('[data-test="actual-start-date"]').should(
                'contain.text',
                'Tue 14 Jun 2016'
              )
            })

            it('The AED should persist the parents AED', () => {
              cy.get('[data-test="actual-end-date"]').should(
                'contain.text',
                'Tue 14 Jun 2016'
              )
            })
          })
        })
      })
    })
  })
})
