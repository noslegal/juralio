import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('recent_tasks_panel.cy', () => {
  let user, fixture, appPage

  describe('When a user has not tasks', () => {
    let user

    before(() => {
      createUser().then(createdUser => {
        user = createdUser
        cy.login(user.username)
        cy.visit('/#/home')
        cy.get('[data-test=home-recently-viewed-tab]').click()
      })
    })

    it('should show the zero state', () => {
      cy.get('[data-test=desktop-home-zero-state]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
  })

  describe('as a user with tasks', () => {
    before(() => {
      cy.logoutServerSide()
      createUser().then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'recent_tasks_4_tasks',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Test Project 1',
                tasks: [{ name: 'Test Task 1A' }, { name: 'Test Task 1B' }],
              },
              {
                name: 'Test Project 2',
                tasks: [{ name: 'Test Task 2A' }, { name: 'Test Task 2B' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })

    describe('when visiting the home page after visiting 2 tasks in the same project', () => {
      before(() => {
        cy.login(user.username)

        for (let taskIndex = 0; taskIndex < 2; ++taskIndex) {
          appPage.visitTaskByName(fixture.tasks[taskIndex].name)
        }

        appPage.visitHome(false)
        cy.get('[data-test=home-recently-viewed-tab]').click()
      })

      describe('the recent tasks panel', () => {
        it('should be visible', () => {
          cy.get('[data-test="home-recent-tasks-panel"]', {
            timeout: 30000,
          }).should('be.visible')
        })

        describe('the zero state', () => {
          it('should not be visible', () => {
            cy.get('[data-test="home-recent-tasks-zero-state"]').should(
              'not.exist'
            )
          })
        })

        describe('the task list', () => {
          const taskList = '[data-test=home-recent-tasks-panel]'

          it('should be visible', () => {
            cy.get(taskList).should('be.visible')
          })

          it('should have a search bar', () => {
            cy.get('[data-test="recentlyViewed-filter"]').should('be.visible')
          })

          it('should have the correct number of children', () => {
            cy.get('[data-test=recently-viewed-matter-title]').should(
              'have.length',
              1
            )
          })

          it('No recent tasks should be shown', () => {
            cy.get('[data-test=juralio-chip-task]').should('have.length', 4)
          })

          it('should render project names', () => {
            cy.get('[data-test=recently-viewed-matter-title]').should(
              'be.visible'
            )
          })

          it('should render go to overview button', () => {
            cy.get('[data-test=go-to-matter-overview]').should('be.visible')
          })

          it('should show the correct project name', () => {
            cy.get('[data-test=recently-viewed-matter-title]')
              .first()
              .should('have.text', fixture.matter.name)
          })

          describe('the first listed task', () => {
            it('should be visible', () => {
              cy.get('[data-test=juralio-chip-task]').should('be.visible')
            })

            it('should navigate to the task details when clicked', () => {
              cy.get('[data-test=juralio-chip-task]').eq(0).click()
              cy.url().should(
                'contain',
                `matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task`
              )
            })
          })

          describe('the second listed task', () => {
            before(() => {
              cy.login(user.username)
              appPage.visitHome(false)
              cy.get('[data-test=home-recently-viewed-tab]').click()
            })

            it('should be visible', () => {
              cy.get('[data-test=juralio-chip-task]').should('be.visible')
            })

            it('should navigate to the task details when clicked', () => {
              cy.get('[data-test=juralio-chip-task]').eq(0).click()
              cy.url().should(
                'contain',
                `matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task`
              )
            })
          })
        })
      })
    })

    describe(
      'when visiting the home page after visiting tasks in different projects',
      { retries: { runMode: 3, openMode: 1 } },
      () => {
        before(() => {
          cy.login(user.username)

          for (
            let taskIndex = 0;
            taskIndex < fixture.tasks.length;
            ++taskIndex
          ) {
            appPage.visitTaskByName(fixture.tasks[taskIndex].name)
            cy.wait(2000)
          }

          appPage.visitHome(false)

          cy.get('[data-test=home-recently-viewed-tab]').click()
        })

        describe('the task list', () => {
          const taskList = '[data-test=home-recently-viewed-tab]'

          it('should be visible', () => {
            cy.get(taskList).should('be.visible')
          })

          it('should have the correct number of children', () => {
            cy.get('[data-test=recently-viewed-matter-title]').should(
              'have.length',
              1
            )
          })

          it('should show the correct project name for the most recent group', () => {
            cy.get('[data-test=recently-viewed-matter-title]')
              .first()
              .should('have.text', fixture.matter.name)
          })

          it('should navigate to the project overview when the button is clicked', () => {
            cy.get('[data-test=go-to-matter-overview]').eq(0).click()
            cy.url().should('contain', `matter/${fixture.matter.id}/overview`)
          })
        })
      }
    )

    describe('when searching for the tasks in the project', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitHome(false)
        cy.get('[data-test=home-recently-viewed-tab]').click()
        cy.get('[data-test=recentlyViewed-filter]', { timeout: 5000 }).type(
          'Test Task'
        )
      })

      it('should display them', () => {
        cy.get('[data-test=recently-viewed-matter-title]').should(
          'have.text',
          fixture.matter.name
        )
        cy.get('[data-test=juralio-chip-task]').should('have.length', 4)
      })

      describe('when searching for an item that does not exist', () => {
        before(() => {
          cy.get('[data-test=recentlyViewed-filter]', { timeout: 5000 }).type(
            'Test Task 15'
          )
        })
        it('should only display the no search results screen', () => {
          cy.get('[data-test=recentlyViewed-zero-state]', {
            timeout: 5000,
          }).should('be.visible')
          cy.get('[data-test=juralio-chip-task]').should('not.exist')
        })
      })
    })
  })

  describe('When the matter is closed', () => {
    before(() => {
      cy.login(user.username)
      let matterUrl = `${Cypress.env('serverBaseUrl')}/admin/matter/${
        fixture.matter.id
      }`
      cy.request({
        url: matterUrl,
        method: 'PATCH',
        body: {
          matterStatus: 'closed',
        },
      }).then(() => {
        cy.request({
          url: matterUrl,
          method: 'PATCH',
          body: {
            matterStatus: 'active',
          },
        }).then(() => {
          appPage.visitHome(false)
          cy.get('[data-test=home-recently-viewed-tab]').click()
        })
      })
    })

    it('No recent tasks should be shown', () => {
      cy.get('[data-test=juralio-chip-task]').should('have.length', 0)
    })
  })
})
