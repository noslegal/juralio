import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('todo_interaction.cy', () => {
  let user, appPage, fixture
  const testDescription = 'This task has a description'

  const createTTM = () =>
    createUser('a').then(createdUser => (user = createdUser))

  before(() => {
    createTTM().then(() => {
      const seed = {
        matter: {
          prefix: 'todo1 ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'project1',
              tasks: [
                { name: 'task1' },
                {
                  name: 'task2',
                  teamMembers: [user],
                  properties: { plannedStartDate: new Date(2000, 3, 3) },
                },
                {
                  name: 'task4',
                  teamMembers: [user],
                  properties: {
                    actualStartDate: new Date(2000, 3, 3),
                    plannedEndDate: new Date(2000, 4, 4),
                    status: 'in-progress',
                  },
                },
                {
                  name: 'task3',
                  teamMembers: [user],
                  properties: {
                    actualStartDate: new Date(2000, 3, 3),
                    plannedEndDate: new Date(2000, 3, 3),
                    status: 'in-progress',
                  },
                },
              ],
            },
          ],
        },
      }

      seed.matter.projects[0].tasks[0].properties = {
        description: testDescription,
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when visiting the home page', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
    })

    it('should render a side panel for Todo', () => {
      cy.get('[data-test=home-todo-tab]').should('be.visible')
    })

    it('should render a side panel for recently viewed', () => {
      cy.get('[data-test=home-recently-viewed-tab]').should('be.visible')
    })

    it('should have 3 todos', () => {
      cy.get('[data-test=juralio-chip-task]').should('have.length', 3)
    })

    it('should order the tasks', () => {
      cy.get('[data-test=task-name]').eq(0).should('have.text', 'task2')
      cy.get('[data-test=task-name]').eq(1).should('have.text', 'task3')
      cy.get('[data-test=task-name]').eq(2).should('have.text', 'task4')
    })
  })
})
