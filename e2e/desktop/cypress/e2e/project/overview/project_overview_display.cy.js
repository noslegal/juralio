import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe(
  'project_overview_display.cy',
  {
    retries: {
      runMode: 3,
      openMode: 0,
    },
  },
  () => {
    let maUser, nonMAUser, fixture, matter, project, project2, appPage

    before(() => {
      createUser().then(createdUser => {
        nonMAUser = createdUser
      })
      createUser()
        .then(createdUser => {
          maUser = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              position: 'Advisor',
              teamMembers: [maUser, nonMAUser],
              matterAdmins: [maUser],
              projects: [
                {
                  name: 'Overview Spec with Tasks',
                  tasks: [{ name: 'Task1', teamMembers: [maUser] }],
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
        cy.login(maUser.username)
        appPage.visitTaskByName('Task1')
        cy.get('[data-test=avatar-group]').eq(0).click()
      })

      it('The delete icon should be shown.', () => {
        cy.get('[data-test=delete-icon]').should('have.length', 1)
      })

      describe('When removing the user', () => {
        before(() => {
          cy.get('[data-test=delete-icon]').first().click({ force: true })
        })

        it('The default user should no longer be in the list.', () => {
          cy.get('[data-test=delete-icon]').should('have.length', 0)
        })

        describe('When navigating to project overview with tasks', () => {
          before(() => {
            cy.reload()
            cy.login(maUser.username)
            visitHelpers.visitProjectOverview(matter.id, project.id)
          })

          it('should display the matter overview link', () => {
            cy.get('[data-test=overview-button]').click()
          })
          it('should display project number and client name', () => {
            cy.get('[data-test=workstream-ref-number]').should('have.text', '1')
            cy.get('[data-test=bread1]').should(
              'contains.text',
              fixture.matter.clientName
            )
          })
          it('should display task counts with labels', () => {
            cy.get('[data-test=task-count]').should('be.visible')
            cy.get('[data-test=task-count]').should('contain', '1')
          })

          it('should show the people header', () => {
            cy.get('[data-test=peopleTab]').should('be.visible')
          })

          it('should show the 0 state', () => {
            cy.get('[data-test=people-tab-zero-state]').should(
              'have.text',
              'Nobody has been assigned tasks on this workstream yet.'
            )
          })

          it('should show a task map with labelled level A tasks', () => {
            cy.get('[data-test=project-overview-roadmap]').should('be.visible')
            cy.get('[data-test=project-overview-roadmap-task-name]').should(
              'be.visible'
            )
          })

          // Trouble getting Ref No when fixture created so lightly test this.
          it('should set the correct document title', () => {
            cy.title().should(
              'include',
              'Overview | Overview Spec with Tasks | Juralio'
            )
          })

          describe('When navigating to project overview without tasks', () => {
            before(() => {
              cy.login(maUser.username)
              visitHelpers.visitProjectOverview(matter.id, project2.id)
            })

            it('should set the correct document title', () => {
              cy.title().should(
                'eq',
                'Overview | Overview Spec without Tasks | Juralio'
              )
            })

            // it('should display the name of the project', () => {
            //   get.projectName().should('have.text', project2.name)
            // })

            it('should display task and post counts with labels', () => {
              cy.get('[data-test=not-started-tasks]').should('contain.text', '0')
              cy.get('[data-test=in-progress-tasks]').should('contain.text', '0')
              cy.get('[data-test=done-tasks]').should('contain.text', '0')
            })

            it('should NOT show the task status bar', () => {
              cy.get('[data-test=status-bar]').should('not.exist')
            })

            it('should show the people header', () => {
              cy.get('[data-test=peopleTab]').should('be.visible')
            })

            it('should show the 0 state', () => {
              cy.get('[data-test=people-tab-zero-state]').should(
                'have.text',
                'Nobody has been assigned tasks on this workstream yet.'
              )
            })
            describe('when clicking on the go to matter overview button', () => {
              before(() => {
                cy.get('[data-test=overview-button]').click()
              })

              it('should take the user to the matter admin section overview', () => {
                cy.url().should('contain', '/matter/')
                cy.url().should('contain', '/overview')
              })
            })
            describe('when a MA visits the Matter Overview', () => {
              before(() => {
                cy.login(maUser.username)
                visitHelpers.visitMatterOverview(matter.id, project2.id)
              })

              it('should take the user to the matter admin section overview', () => {
                cy.get('[data-test=go-to-matter-admin]').should('exist')
              })

              describe('when clicking on the go to matter admin button', () => {
                before(() => {
                  cy.get('[data-test=go-to-matter-admin]').click()
                })

                it('should take the user to the matter admin section overview', () => {
                  cy.url().should('contain', '/matteradmin/')
                })
              })
            })
            describe('when a non-MA visits the Matter Overview', () => {
              before(() => {
                cy.login(nonMAUser.username)
                visitHelpers.visitMatterOverview(matter.id, project2.id)
              })

              it('should take the user to the matter admin section overview', () => {
                cy.get('[data-test=go-to-matter-admin]').should('not.exist')
              })
            })
          })
        })
      })
    })
  }
)
