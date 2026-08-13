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

describe('roadmap_knock_on_status.cy', () => {
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
                name: 'Knock On',
                tasks: [
                  { name: 'Task 0' },
                  {
                    name: 'Task 1',
                    tasks: [
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
      roadmap.tasks().should('have.length', 2)
      roadmap.tasks().should('be.visible')
    })

    describe('when changing a task (with subtasks) status to done', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click({ force: true })
        taskCellMenu.done().click()
        cy.get('[data-test=action-dialog-button]', { timeout: 30000 })
          .eq(0)
          .click()
        showDoneTasks()
      })

      it('should display the Task in progress', () => {
        roadmap.tasks().should('have.length', 2)
        roadmap.tasks().should('be.visible')
        roadmap
          .tasks()
          .eq(1)
          .get('[data-test=task-cell-test]')
          .should('have.css', 'background-color')
          .and('be.colored', taskStatusColors.done)
      })

      describe('when changing a task (with subtasks) status to not started', () => {
        before(() => {
          taskCellMenu.taskCellDropDownArrow().eq(0).click({ force: true })
          taskCellMenu.notStarted().click({ force: true })
          cy.get('[data-test=action-dialog-button]', { timeout: 30000 })
            .eq(0)
            .click({ force: true })
        })

        it('should display the Task in progress', () => {
          roadmap.tasks().should('have.length', 2)
          roadmap.tasks().should('be.visible')
          roadmap
            .tasks()
            .eq(1)
            .get('[data-test=task-cell-test]')
            .should('have.css', 'background-color')
            .and('be.colored', taskStatusColors.notStarted)
        })
      })
    })
  })
})
