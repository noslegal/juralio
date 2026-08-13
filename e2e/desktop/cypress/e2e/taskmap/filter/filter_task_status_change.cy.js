import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('filter_task_status_change.cy', () => {
  let adminUser, fixture, appPage

  const otherTasks = [{}, {}, {}, {}, {}, {}, {}, {}]

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))

  before(() => {
    createUser1().then(() => {
      const seed = {
        matter: {
          prefix: 'task_status_event',
          teamMembers: [adminUser],
          matterAdmins: [adminUser],
          projects: [
            {
              name: 'Law Project',
              tasks: [
                {
                  name: 'not-started',
                  teamMembers: [],
                  followers: [],
                },
                {
                  name: 'in-progress',
                  teamMembers: [],
                },
                {
                  name: 'done',
                  teamMembers: [],
                },
                {
                  name: 'level A',
                  teamMembers: [],
                  tasks: [{ name: 'level B' }],
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when on the task map', () => {
    before(() => {
      cy.login(adminUser.username)
      appPage.visitTaskMap()
      appPage.changeTaskStatus('in-progress', 1)
      appPage.changeTaskStatus('level A', 1)
      appPage.visitTaskMap()
    })

    describe('when using the filter to hide done tasks a snackbar will show when a tasks status is changed', () => {
      it('should show done snackbar', () => {
        cy.get('[data-test=options-dropdown]').should('have.length', 5)
        cy.get('[data-test=options-dropdown]').eq(0).click({ force: true })
        cy.get('[data-test=menu-text]').eq(2).click()
        snackbarHelper.checkShownAndHasExpectedText(
          'Task status changed. Done tasks are curently hidden. Use the status filter to change what tasks are displayed',
          'Dismiss'
        )
      })
    })

    // describe('when using the filter to hide not started tasks a snackbar will show when a tasks status is changed', () => {
    //   before(() => {
    //     cy.get('[data-test=status-filter-selected-text]').click()
    //     cy.get('[data-test=not-started-checkbox]').click()
    //   })
    //   it('should show not started snackbar', () => {
    //     cy.get('[data-test=options-dropdown]').should('have.length', 1)
    //     cy.wait(2000)
    //     cy.get('[data-test=options-dropdown]').eq(0).click({ force: true })
    //     cy.get('[data-test=menu-text]').eq(0).click()
    //     snackbarHelper.checkShownAndHasExpectedText(
    //       'Task status changed. Not started tasks are curently hidden. Use the status filter to change what tasks are displayed',
    //       'Dismiss'
    //     )
    //   })
    // })
  })
})
