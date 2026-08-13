import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
//no todos
//today
//overdue
//this week
//all
let user, nonTTMUser, appPage, fixture

const addDays = (date, days) => {
  let result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

describe('todo_range_picker_display.cy', () => {
  before(() => {
    const testDescription = 'This task has a description'
    const createTTM = () =>
      createUser('a').then(createdUser => (user = createdUser))
    const createNonTTMUser = () =>
      createUser('b').then(createdUser => (nonTTMUser = createdUser))
    createTTM()
      .then(createNonTTMUser)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'todo1 ',
            teamMembers: [user, nonTTMUser],
            matterAdmins: [user],
            projects: [
              {
                name: 'project1',
                tasks: [
                  { name: 'task1' },
                  { name: 'task2', teamMembers: [user] },
                  { name: 'task3', teamMembers: [user] },
                ],
              },
              {
                name: 'project2',
                tasks: [
                  { name: 'p2task1', teamMembers: [user] },
                  { name: 'p2task2', teamMembers: [user] },
                  { name: 'p3task3', teamMembers: [user] },
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
  describe('when there are no todos', () => {
    before(() => {
      cy.login(user.username)
      cy.intercept(
        {
          method: 'GET',
          url: '*/todo',
        },
        {
          body: [],
        }
      )
      appPage.visitHome()
    })

    it('should show the zero state for todos', () => {
      cy.get('[data-test=todo-zero-state]').should('be.visible')
    })
  })
  describe('when there are only overdue tasks', () => {
    before(() => {
      cy.login(user.username)
      cy.intercept(
        {
          method: 'GET',
          url: '**/todo',
        },
        {
          body: [
            {
              id: 3733,
              level: 2,
              name: 'Jupiter',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
    })
    it('should show no tasks today', () => {
      cy.get('[data-test=todo-zero-state]').should('be.visible')
      cy.get('[data-test=todo-range-picker-button]').should('be.visible')
      cy.get('[data-test=todo-range-picker-button]').should(
        'contain.text',
        'Today (0)'
      )
    })
    describe('when opening the menu', () => {
      before(() => {
        cy.get('[data-test=todo-range-picker-button]').click()
      })
      it('should have the correct counts', () => {
        cy.get('[data-test=todo-option-overdue]').should(
          'contain.text',
          'Overdue (1)'
        )
        cy.get('[data-test=todo-option-this-week]').should(
          'contain.text',
          'This week (0)'
        )
        cy.get('[data-test=todo-option-all]').should('contain.text', 'All (1)')
      })
    })
    describe('when selecting overdue', () => {
      before(() => {
        cy.get('[data-test=todo-option-overdue]').click()
      })
      it('should show the overdue task', () => {
        cy.get('[data-test=todo-item]').should('have.length', 1)
      })
    })
  })
  describe('when there are tasks due today and overdue', () => {
    before(() => {
      cy.login(user.username)
      cy.intercept(
        {
          method: 'GET',
          url: '**/todo',
        },
        {
          body: [
            {
              id: 3733,
              level: 2,
              name: 'Jupiter',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
            {
              id: 3733,
              level: 2,
              name: 'Jupiter 2',
              plannedEndDate: new Date(
                new Date().getTime() + 20 * 60000
              ).toISOString(),
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
    })
    it('should show 1 task today', () => {
      cy.get('[data-test=todo-range-picker-button]').should('be.visible')
      cy.get('[data-test=todo-range-picker-button]').should(
        'contain.text',
        'Today (1)'
      )
      cy.get('[data-test=todo-item]').should('have.length', 1)
    })
    describe('when opening the menu', () => {
      before(() => {
        cy.get('[data-test=todo-range-picker-button]').click()
      })
      it('should have the correct counts', () => {
        cy.get('[data-test=todo-option-overdue]').should(
          'contain.text',
          'Overdue (1)'
        )
        cy.get('[data-test=todo-option-this-week]').should(
          'contain.text',
          'This week (1)'
        )
        cy.get('[data-test=todo-option-all]').should('contain.text', 'All (2)')
      })
    })
    describe('when selecting overdue', () => {
      before(() => {
        cy.get('[data-test=todo-option-overdue]').click()
      })
      it('should show the overdue task', () => {
        cy.get('[data-test=todo-item]').should('have.length', 1)
      })
    })
  })
  describe('when there are tasks due tomorrow and overdue', () => {
    before(() => {
      cy.login(user.username)
      cy.intercept(
        {
          method: 'GET',
          url: '**/todo',
        },
        {
          body: [
            {
              id: 3733,
              level: 2,
              name: 'Jupiter',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
            {
              id: 3733,
              level: 2,
              name: 'Jupiter 2',
              plannedEndDate: new Date(
                new Date().getTime() + 1460 * 60000
              ).toISOString(),
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
    })
    it('should show 1 task today', () => {
      cy.get('[data-test=todo-range-picker-button]').should('be.visible')
      cy.get('[data-test=todo-range-picker-button]').should(
        'contain.text',
        'Today (0)'
      )
    })
    describe('when opening the menu', () => {
      before(() => {
        cy.get('[data-test=todo-range-picker-button]').click()
      })
      it('should have the correct counts', () => {
        cy.get('[data-test=todo-option-overdue]').should(
          'contain.text',
          'Overdue (1)'
        )
        cy.get('[data-test=todo-option-this-week]').should(
          'contain.text',
          'This week (1)'
        )
        cy.get('[data-test=todo-option-all]').should('contain.text', 'All (2)')
      })
    })
    describe('when selecting overdue', () => {
      before(() => {
        cy.get('[data-test=todo-option-this-week]').click()
      })
      it('should show the overdue task', () => {
        cy.get('[data-test=todo-item]').should('have.length', 1)
      })
    })
  })
  describe('when there are tasks due next week and overdue', () => {
    before(() => {
      cy.login(user.username)
      cy.intercept(
        {
          method: 'GET',
          url: '**/todo',
        },
        {
          body: [
            {
              id: 3733,
              level: 2,
              name: 'Jupiter',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
            {
              id: 3733,
              level: 2,
              name: 'Jupiter 2',
              plannedEndDate: new Date(
                new Date().getTime() + 10080 * 60000
              ).toISOString(),
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
    })
    it('should show 1 task today', () => {
      cy.get('[data-test=todo-range-picker-button]').should('be.visible')
      cy.get('[data-test=todo-range-picker-button]').should(
        'contain.text',
        'Today (0)'
      )
    })
    describe('when opening the menu', () => {
      before(() => {
        cy.get('[data-test=todo-range-picker-button]').click()
      })
      it('should have the correct counts', () => {
        cy.get('[data-test=todo-option-overdue]').should(
          'contain.text',
          'Overdue (1)'
        )
        cy.get('[data-test=todo-option-this-week]').should(
          'contain.text',
          'This week (0)'
        )
        cy.get('[data-test=todo-option-all]').should('contain.text', 'All (2)')
      })
    })
    describe('when selecting overdue', () => {
      before(() => {
        cy.get('[data-test=todo-option-all]').click()
      })
      it('should show the overdue task', () => {
        cy.get('[data-test=todo-item]').should('have.length', 2)
      })
    })
  })
})
