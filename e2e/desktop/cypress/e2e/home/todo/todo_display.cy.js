import {
  getPayloadForDate,
  updatePED,
} from '../../../../../helpers/date/date_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('todo_display.cy', () => {
  let user, nonTTMUser, appPage, fixture
  const testDescription = 'This task has a description'
  const createTTM = () =>
    createUser('a').then(createdUser => (user = createdUser))
  const createNonTTMUser = () =>
    createUser('b').then(createdUser => (nonTTMUser = createdUser))
  before(() => {
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
  describe('when a user has no todos', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
    })
    it('should not render the todo list container', () => {
      cy.get('[data-test=todo-list]').should('not.exist')
    })
    describe('when a task is visited directly', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('task1')
        cy.get('[data-test=add-team-member-button]').click()
        cy.get('[data-test=autocomplete-search]')
          .find('input')
          .type(`${user.firstname}{enter}`)
        cy.wait(1000)
      })
      it('should have a planned End date field', () => {
        cy.get('[data-test=planned-end-date]').should('exist')
      })
      describe('and the PED modified', () => {
        let plannedEndDate, matterId, projectId
        before(() => {
          matterId = fixture.matter.id
          projectId = fixture.projects[0].id
          cy.login(user.username)
          updatePED(matterId, projectId, fixture.tasks[0].id, '+', 4).then(
            response => {
              plannedEndDate = getPayloadForDate(response.plannedEndDate)
              cy.reload()
            }
          )
        })
        it('should have an updated planned End date field', () => {
          cy.get('[data-test=planned-end-date]')
            // .find('input')
            .should('contain.text', plannedEndDate)
        })
        describe('on visiting the home page', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitHome()
            cy.get('[data-test=todo-range-picker-button]').click()
            cy.get('[data-test=todo-option-all]').click()
          })
          describe('a todo item should display', () => {
            it('should render 1 todo', () => {
              cy.get('[data-test=todo-list]')
                .find('[data-test=todo-item]')
                .should('have.length', 1)
            })
            it('the todo list is in view', () => {
              cy.get('[data-test=todo-list]').scrollIntoView()
              cy.get('[data-test=todo-list]').should('be.visible')
            })
            it('should render a task', () => {
              cy.get('[data-test=juralio-chip-task]').should(
                'contain.text',
                fixture.tasks[0].name
              )
            })
            describe('when updating another task PED', () => {
              before(() => {
                cy.login(user.username)
                updatePED(matterId, projectId, fixture.tasks[1].id, '+', 5)
                cy.reload()
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
  })
  describe('when a PEDs are updated across multiple projects', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')
      updatePED(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        '+',
        0
      )
      updatePED(
        fixture.matter.id,
        fixture.projects[1].id,
        fixture.tasks[3].id,
        '+',
        1
      )
      updatePED(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[2].id,
        '+',
        2
      )
      cy.reload()
    })
    describe('on visiting the home page', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
        cy.get('[data-test=todo-range-picker-button]').click()
        cy.get('[data-test=todo-option-all]').click()
      })
      it('should render the earliest todo first', () => {
        cy.get('[data-test=todo-list]')
          .find('[data-test=todo-item]')
          .find('[data-test=juralio-chip-task]')
          .eq(0)
          .should('contain.text', fixture.tasks[1].name)
      })
      it('should render the middle todo in between', () => {
        cy.get('[data-test=todo-list]')
          .find('[data-test=todo-item]')
          .find('[data-test=juralio-chip-task]')
          .eq(1)
          .should('contain.text', fixture.tasks[3].name)
      })
      it('should render the latest todo in last', () => {
        cy.get('[data-test=todo-list]')
          .find('[data-test=todo-item]')
          .find('[data-test=juralio-chip-task]')
          .eq(2)
          .should('contain.text', fixture.tasks[2].name)
      })
    })
  })
  describe('when the user has a todo', () => {
    let task
    before(() => {
      /* eslint-disable prefer-destructuring */
      task = fixture.tasks.find(t => t.projectId === fixture.projects[0].id)
      cy.login(user.username)
      updatePED(fixture.matter.id, fixture.projects[0].id, task.id, '+', 0)
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
      cy.get('[data-test=todo-item]').contains(task.name).click()
    })
    describe('when clicking on the task navigation button', () => {
      it('should navigate to task details for the selected task', () => {
        cy.url().should('contains', `/task/${task.id}`)
        cy.get('[data-test=task-name]').should('have.text', task.name)
      })
    })
  })
  describe('when user is a TTM but not a MTM', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
    })
    it('should NOT display any todos', () => {
      cy.get('[data-test=zero-state-image]').should('not.exist')
    })
  })
  describe('when login as a user who is MTM but not TTM', () => {
    before(() => {
      cy.login(nonTTMUser.username)
      cy.visit('/#/home')
    })
    it('should NOT display any todos', () => {
      cy.get('[data-test=todo-zero-state]').should('exist')
    })
  })
})
