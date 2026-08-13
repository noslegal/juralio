import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

const taskCellMenu = taskmapPage.operationMenu
const { moveDialog } = taskDetailPage

describe('roadmap_move_task.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_move_task.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Move',
                tasks: [
                  {
                    name: 'Task 1',
                    properties: {
                      status: 'done',
                    },
                  },
                  {
                    name: 'Task 2',
                    properties: {
                      status: 'in-progress',
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
      cy.wait(5000)
      appPage.visitRoadmap()
      cy.get('.reactour__close', { timeout: 30000 }).click()

      showDoneTasks()
    })

    it('should display the remaining Task', () => {
      roadmap.tasks().should('have.length', 2)
      roadmap.tasks().should('be.visible')
    })

    describe('when moving a task', () => {
      before(() => {
        // cy.get('body').click()
        taskCellMenu.taskCellDropDownArrow().eq(1).click({ force: true })
        cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.moveMenuText().click()
        moveDialog.get.destinationSelectionDropdown().click()
        cy.wait(2000)
        cy.get('[data-test=destination-subtask-of]').click()
        cy.get('[data-test=task-select-base]')
          .click()
          .find('input')
          .type('Task')
        cy.wait(2000)
        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()

        cy.wait(2000)
        cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')

        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/move').as(
          'moveFetch'
        )
        cy.get('[data-test=action-dialog-button]').eq(1).click('right')
        cy.wait('@moveFetch')
        cy.wait('@projectFetch')
        cy.login(user)
        appPage.visitRoadmap()
      })

      it('should display the remaining Task', () => {
        roadmap.tasks().should('have.length', 1)
        roadmap.tasks().should('be.visible')
        roadmap.tasks().eq(0).should('contain.text', 'Task 1')
      })
    })
  })
})
