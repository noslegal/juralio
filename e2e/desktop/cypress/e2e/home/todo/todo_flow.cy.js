import {
  getPayloadForDate,
  updatePED,
} from '../../../../../helpers/date/date_api_helper'
import getLocationParams from '../../../../../helpers/location/location_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('todo_flow.cy', () => {
  let user, appPage1, appPage2

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed1 = {
        matter: {
          prefix: 'todo1',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'project1',
              tasks: [
                { name: 'task1' },
                { name: 'task2', teamMembers: [user] },
              ],
            },
          ],
        },
      }

      const seed2 = {
        matter: {
          prefix: 'todo2',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'project2',
              tasks: [{ name: 'diff task1' }],
            },
          ],
        },
      }

      const fixture1 = generateFixture(seed1)
      const fixture2 = generateFixture(seed2)
      appPage1 = getWrapper(fixture1)
      appPage2 = getWrapper(fixture2)
    })
  })
  describe('when a user has no todos', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')
    })

    it('should not render the todo list container', () => {
      cy.get('[data-test=todo-list]').should('not.exist')
    })

    describe('when a task is visited directly', () => {
      let matterId, projectId, taskId
      before(() => {
        cy.login(user.username)
        appPage1.visitTaskByName('task1')

        getLocationParams('matter').then(response => {
          matterId = response
        })
        getLocationParams('workstream').then(response => {
          projectId = response
        })
        getLocationParams('task').then(response => {
          taskId = response
        })
      })

      it('should have a planned End date field', () => {
        cy.get('[data-test=planned-end-date]').should('exist')
      })

      describe('and the PED modified', () => {
        let plannedEndDate
        before(() => {
          cy.login(user.username)
          updatePED(matterId, projectId, taskId, '+', 4).then(response => {
            plannedEndDate = getPayloadForDate(response.plannedEndDate)
            cy.get('[data-test=add-team-member-button]').click()
            cy.get('[data-test=autocomplete-search]')
              .find('input')
              .type(`${user.firstname}{enter}`)
            cy.wait(1000)
            cy.reload()
          })
        })

        it('should have an updated planned End date field', () => {
          cy.get('[data-test=planned-end-date]')
            // .find('span')
            .should('contain.text', plannedEndDate)
        })

        describe('on visiting the home page', () => {
          before(() => {
            cy.login(user.username)
            cy.visit('/#/home')
            cy.get('[data-test=todo-range-picker-button]').click()
            cy.get('[data-test=todo-option-all]').click()
          })

          it('should render 1 todos', () => {
            cy.get('[data-test=todo-list]', { timeout: 30000 })
              .find('[data-test=todo-item]')
              .should('have.length', 1)
          })
        })
      })
    })
    describe('when a task is visited directly', () => {
      let matterId, projectId, taskId
      before(() => {
        cy.login(user.username)
        appPage2.visitTaskByName('diff task1')

        getLocationParams('matter').then(response => {
          matterId = response
        })
        getLocationParams('workstream').then(response => {
          projectId = response
        })
        getLocationParams('task').then(response => {
          taskId = response
        })
      })

      it('should have a planned End date field', () => {
        cy.get('[data-test=planned-end-date]').should('exist')
      })

      describe('and the PED modified', () => {
        let plannedEndDate
        before(() => {
          cy.login(user.username)
          updatePED(matterId, projectId, taskId, '-', 4).then(response => {
            plannedEndDate = getPayloadForDate(response.plannedEndDate)
            cy.get('[data-test=add-team-member-button]').click()
            cy.get('[data-test=autocomplete-search]')
              .find('input')
              .type(`${user.firstname}{enter}`)
            cy.wait(1000)
            cy.reload()
          })
        })

        it('should have an updated planned End date field', () => {
          cy.get('[data-test=planned-end-date]')
            // .find('input')
            .should('contain.text', plannedEndDate)
        })

        describe('on visiting the home page', () => {
          before(() => {
            cy.login(user.username)
            cy.visit('/#/home')
            cy.get('[data-test=todo-range-picker-button]').click()
            cy.get('[data-test=todo-option-all]').click()
          })

          it('should render 2 todos', () => {
            cy.get('[data-test=todo-list]')
              .find('[data-test=todo-item]')
              .should('have.length', 2)
          })
        })
      })
    })
  })
})
