import chaiColors from 'chai-colors'
import { datePayloadGenerator } from '../../../../../helpers/date/date_api_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

chai.use(chaiColors)

describe('todo_status.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'todo ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'todo_status.cy',
              teamMembers: [user],
              tasks: [
                {
                  name: 'Not started - overdue',
                  teamMembers: [user],
                  properties: {
                    plannedEndDate: datePayloadGenerator('-', 1),
                  },
                },
                {
                  name: 'Not started',
                  teamMembers: [user],
                  properties: {
                    plannedEndDate: datePayloadGenerator('-', 0),
                  },
                },
                {
                  name: 'In progress',
                  teamMembers: [user],
                  properties: {
                    plannedEndDate: datePayloadGenerator('-', 0),
                    status: 'in-progress',
                  },
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

  const overdueStatusColour = '#d96b5b'

  describe('when the user has a range of todos', () => {
    const getTodoItem = index => cy.get('[data-test=todo-item]').eq(index)

    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
    })

    describe('The overdue todo', () => {
      it('should have red coloured date text', () => {
        getTodoItem(0)
          .find('[data-test=task-chip-due-date]')
          .should('have.css', 'color')
          .and('be.colored', overdueStatusColour)
      })
    })
  })
})
