import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe(
  'project_overview_roadmap_display.cy',
  {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
  () => {
    let testUser, fixture, matter, project, project2, appPage

    before(() => {
      createUser()
        .then(createdUser => {
          testUser = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [testUser],
              matterAdmins: [testUser],
              projects: [
                {
                  name: 'Overview Spec with Tasks',
                  tasks: [
                    { name: 'Task1', teamMembers: [testUser] },
                    {
                      name: 'Task2',
                      teamMembers: [testUser],
                      properties: {
                        plannedStartDate: new Date(2000, 3, 3),
                      },
                      tasks: [{ name: 'level B' }],
                    },
                    {
                      name: 'Task3',
                      teamMembers: [testUser],
                      properties: {
                        // plannedStartDate: new Date(2000, 3, 3),
                        status: 'in-progress',

                        actualStartDate: new Date(2000, 3, 3),
                      },
                    },
                    {
                      name: 'Task4',
                      teamMembers: [testUser],
                      properties: {
                        // plannedStartDate: new Date(2000, 3, 3),
                        // plannedEndDate: new Date(2000, 3, 3),
                        actualStartDate: new Date(2000, 3, 3),
                        actualEndDate: new Date(2000, 3, 3),
                        status: 'done',
                      },
                    },
                    {
                      name: 'Task5',
                      teamMembers: [testUser],
                      properties: {
                        plannedEndDate: new Date(2000, 3, 3),
                        status: 'not-started',
                      },
                    },
                  ],
                },
                {
                  name: 'Overview Spec without Tasks',
                },
              ],
            },
          }

          fixture = generateFixture(seed)
        })
        .then(() => {
          matter = fixture.matter
          project = fixture.projects[0]
          project2 = fixture.projects[1]
          appPage = getWrapper(fixture)
        })
    })

    describe('When navigating to a task', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitProjectOverview()
      })
      it('should render the level A tasks', () => {
        cy.get('[data-test=project-overview-roadmap-level]').should(
          'have.length',
          5
        )
      })
      it('should render their names', () => {
        cy.get('[data-test=project-overview-roadmap-task-name]')
          .eq(0)
          .should('have.text', 'Task4')
        cy.get('[data-test=project-overview-roadmap-task-name]')
          .eq(1)
          .should('have.text', 'Task3')
        cy.get('[data-test=project-overview-roadmap-task-name]')
          .eq(2)
          .should('have.text', 'Task1')
        cy.get('[data-test=project-overview-roadmap-task-name]')
          .eq(3)
          .should('have.text', 'Task2')
        cy.get('[data-test=project-overview-roadmap-task-name]')
          .eq(4)
          .should('have.text', 'Task5')
      })
      it('should render their dates', () => {
        cy.get('[data-test=task-start-date]')
          .eq(0)
          .should('have.text', 'Mon 3 Apr 2000')
        cy.get('[data-test=task-start-date]')
          .eq(1)
          .should('have.text', 'Mon 3 Apr 2000')
        cy.get('[data-test=task-start-date]')
          .eq(2)
          .should('have.text', 'No start date set')
        cy.get('[data-test=task-end-date]')
          .eq(0)
          .should('have.text', 'Mon 3 Apr 2000')
        cy.get('[data-test=task-end-date]')
          .eq(1)
          .should('have.text', 'No end date set')
        cy.get('[data-test=task-end-date]')
          .eq(3)
          .should('have.text', 'No end date set')
      })

      it('should show the correct colored bars', () => {
        cy.get('[data-test=task-bar]')
          .eq(0)
          .should('have.css', 'background-color', 'rgb(209, 229, 230)')
        cy.get('[data-test=task-bar]')
          .eq(1)
          .should('have.css', 'background-color', 'rgb(244, 225, 186)')
        cy.get('[data-test=task-bar]')
          .eq(2)
          .should('have.css', 'background-color', 'rgb(252, 251, 232)')
      })
    })
  }
)
