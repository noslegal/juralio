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

describe('roadmap_mix_of_task_statuses.cy', () => {
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
            prefix: 'roadmap_mix_of_task_statuses.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Mix of Statuses',
                tasks: [
                  {
                    name: 'Done Task',
                    properties: {
                      status: 'done',
                    },
                  },
                  {
                    name: 'In Progress Task',
                    properties: {
                      status: 'in-progress',
                    },
                  },
                  {
                    name: 'Not Started Task',
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
      cy.get('.reactour__close').click()
      showDoneTasks()
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', 'Roadmap | Mix of Statuses | Juralio')
    })

    it('should show the Today label', () => {
      roadmap.todayLabel().should('be.visible')
    })

    it('should display the Date Range labels', () => {
      roadmap.startTimelineLabel().should('exist')
    })

    it('should display the Tasks', () => {
      roadmap.tasks().should('have.length', 3)
      roadmap.tasks().eq(0).should('be.visible')
      roadmap.tasks().eq(1).should('be.visible')
      roadmap.tasks().eq(2).should('exist')
    })

    it('should colour the tasks correctly', () => {
      getTaskCellByTaskName('Done Task').should(
        'have.css',
        'background-color',
        taskCellColours.done
      )
      getTaskCellByTaskName('In Progress Task').should(
        'have.css',
        'background-color',
        taskCellColours['in-progress']
      )
      getTaskCellByTaskName('Not Started Task').should(
        'have.css',
        'background-color',
        taskCellColours['not-started']
      )
    })
  })
})
