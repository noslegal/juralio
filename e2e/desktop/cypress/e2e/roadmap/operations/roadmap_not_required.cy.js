import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { showDoneTasks } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'
import taskmapPage from '../../../../../page/taskmap/taskmap_page'

const taskCellMenu = taskmapPage.operationMenu

describe('roadmap_not_required.cy', () => {
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
            prefix: 'roadmap_not_required.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Not required',
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

    describe('When setting a task to not required', () => {
      before(() => {
        taskCellMenu.taskCellDropDownArrow().eq(1).click({ force: true })
        taskCellMenu.notRequired().click()
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should display the remaining Task', () => {
        roadmap.tasks().should('have.length', 1)
        roadmap.tasks().should('be.visible')
        roadmap.tasks().eq(0).should('contain.text', 'Task 1')
      })
    })
  })
})
