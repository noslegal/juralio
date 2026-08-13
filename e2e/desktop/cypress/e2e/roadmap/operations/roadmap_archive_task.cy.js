import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

const taskCellMenu = taskmapPage.operationMenu

describe('roadmap_archive_task.cy', () => {
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
            prefix: 'roadmap_archive_task.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'ARchive',
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
      appPage.visitRoadmap()
      cy.get('.reactour__close').click()

      showDoneTasks()
    })

    it('should display the remaining Task', () => {
      roadmap.tasks().should('have.length', 2)
      roadmap.tasks().should('be.visible')
    })

    describe('and archiving a task', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click({ force: true })
        cy.get('[data-test=task-card-option-menu-more]').click()
        taskCellMenu.archiveMenuText().click()

        cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')

        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/archive').as(
          'archiveFetch'
        )
        cy.get('[data-test=action-dialog-button]').click('right')
        cy.wait('@archiveFetch')
        cy.wait('@projectFetch')
      })

      it('should display the remaining Task', () => {
        cy.get('[data-test=action-dialog-button]').should('not.exist')
        roadmap.tasks().should('have.length', 1)
        roadmap.tasks().should('be.visible')
        roadmap.tasks().eq(0).should('contain.text', 'Task 1')
      })
    })
  })
})
