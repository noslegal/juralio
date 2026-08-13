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

describe('todo_filtering.cy', () => {
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
  describe('when filtering on task', () => {
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
              name: 'task 2',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
            {
              id: 3733,
              level: 2,
              name: 'task 1',
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
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
      cy.get('[data-test=todo-filter]').find('input').type('task 1')
    })
    it('should show 1 of 2 tasks', () => {
      cy.get('[data-test=todo-item]').should('have.length', 1)
    })
  })
  describe('when filtering on workstream', () => {
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
              name: 'task 2',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: fixture.matter.id,
            },
            {
              id: 3733,
              level: 2,
              name: 'task 1',
              plannedEndDate: new Date(
                new Date().getTime() + 10080 * 60000
              ).toISOString(),
              status: 'not-started',
              projectId: fixture.projects[1].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
      cy.get('[data-test=todo-filter]')
        .find('input')
        .type(fixture.projects[1].name)
    })
    it('should show 1 of 2 tasks', () => {
      cy.get('[data-test=todo-item]').should('have.length', 1)
    })
  })
  describe('when filtering on matter', () => {
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
              name: 'task 2',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: -1,
            },
            {
              id: 3733,
              level: 2,
              name: 'task 1',
              plannedEndDate: new Date(
                new Date().getTime() + 10080 * 60000
              ).toISOString(),
              status: 'not-started',
              projectId: fixture.projects[1].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
      cy.get('[data-test=todo-filter]').find('input').type(fixture.matter.name)
    })
    it('should show 1 of 2 tasks', () => {
      cy.get('[data-test=todo-item]').should('have.length', 1)
    })
  })
  describe('when filtering on client', () => {
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
              name: 'task 2',
              plannedEndDate: '2021-09-17T21:59:59Z',
              status: 'not-started',
              projectId: fixture.projects[0].id,
              matterId: -1,
            },
            {
              id: 3733,
              level: 2,
              name: 'task 1',
              plannedEndDate: new Date(
                new Date().getTime() + 10080 * 60000
              ).toISOString(),
              status: 'not-started',
              projectId: fixture.projects[1].id,
              matterId: fixture.matter.id,
            },
          ],
        }
      )
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
      cy.get('[data-test=todo-filter]')
        .find('input')
        .type(fixture.matter.clientName)
    })
    it('should show 1 of 2 tasks', () => {
      cy.get('[data-test=todo-item]').should('have.length', 1)
    })
  })
})
