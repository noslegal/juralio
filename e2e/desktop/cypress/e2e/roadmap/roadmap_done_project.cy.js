import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  getTaskCellByTaskName,
  showDoneTasks,
} from '../../../../helpers/taskmap/task-map-helper'
import { taskCellColours } from '../../../../helpers/tasks/task_status_colours'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../page/roadmap/roadmap_page'

describe('roadmap_done_project.cy', () => {
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
            prefix: 'roadmap_done_project.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: '1 Level Done',
                tasks: [
                  {
                    name: 'Done Task',
                    properties: {
                      status: 'done',
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

    it('should set the correct document title', () => {
      cy.title().should('eq', 'Roadmap | 1 Level Done | Juralio')
    })

    it('should show the Today label', () => {
      roadmap.todayLabel().should('be.visible')
    })

    it('should display the Date Range labels', () => {
      roadmap.startTimelineLabel().should('exist')
    })

    it('should display the Task', () => {
      roadmap.tasks().should('have.length', 1)
      roadmap.tasks().should('be.visible')
    })

    it('should be Done status colour', () => {
      getTaskCellByTaskName('Done Task').should(
        'have.css',
        'background-color',
        taskCellColours.done
      )
    })
  })
})
