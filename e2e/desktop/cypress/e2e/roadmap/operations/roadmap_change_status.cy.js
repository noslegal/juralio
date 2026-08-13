import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
  showDoneTasks,
  taskStatusColors,
} from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

const taskCellMenu = taskmapPage.operationMenu

describe('roadmap_change_status.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_change_status.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'rename',
                tasks: [
                  {
                    name: 'Task 1',
                    properties: {
                      status: 'not-started',
                    },
                    tasks: [
                      {
                        name: 'level b',
                        properties: {
                          status: 'not-started',
                        },
                      },
                    ],
                  },
                  {
                    name: 'Task 2',
                    properties: {
                      status: 'not-started',
                    },
                  },
                  {
                    name: 'Task 3',
                    properties: {
                      status: 'not-started',
                    },
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
        project = fixture.projects
      })
  })

  describe('When navigating to roadmap of a single task no dates project', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap()
    })

    it('should display the remaining Task', () => {
      roadmap.tasks().should('have.length', 3)
      roadmap.tasks().should('be.visible')
    })

    describe('when changing a task status to in progress', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click({ force: true })
        taskCellMenu.inProgress().click()
        cy.wait(5000)
      })

      it('should display the Task in progress', () => {
        roadmap.tasks().should('have.length', 3)
        roadmap.tasks().should('be.visible')
        roadmap
          .tasks()
          .eq(0)
          .get('[data-test=task-cell-test]')
          .should('have.css', 'background-color')
          .and('be.colored', taskStatusColors.inProgress)
      })
    })

    describe('when changing a task status to done', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click({ force: true })
        taskCellMenu.done().click()
      })

      it('should display a dialog to change the subtask aswell', () => {
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 }).should(
          'exist'
        )
        cy.get('[data-test=juralio-chip-task]').should('have.text', 'level b')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
      })

      it('should display the remaining Task done', () => {
        cy.get('[data-test="status-tour-close-forever"]').click()
        showDoneTasks()
        roadmap.tasks().should('have.length', 3)
        roadmap.tasks().should('be.visible')
        roadmap
          .tasks()
          .eq(0)
          .get('[data-test=task-cell-test]')
          .should('have.css', 'background-color')
          .and('be.colored', taskStatusColors.done)
      })
    })

    describe('when changing a task status to done to in progress', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(2).click({ force: true })
        taskCellMenu.done().click()
        cy.login(user)
        cy.reload()
      })

      it('should display the remaining Task in progress', () => {
        roadmap.tasks().should('have.length', 1)
        roadmap.tasks().should('be.visible')
        roadmap
          .tasks()
          .get('[data-test=task-cell-test]')
          .eq(0)
          .should('have.css', 'background-color')
          .and('be.colored', taskStatusColors.inProgress)
      })
    })
  })
})
