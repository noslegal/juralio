import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { updateProject } from '../../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../../page/project/overview/project_overview_page'

const visitHelpers = new VisitHelpers()

describe('project_overview_zerostate.cy', () => {
  let testUser, otherUser, fixture, appPage

  before(() => {
    createUser()
      .then(u => {
        otherUser = u
      })
      .then(createUser)
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Overview Spec without Tasks',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
      })
  })

  describe('When navigating to an empty project overview', () => {
    before(() => {
      cy.login(testUser.username)
      cy.backendRoute('/matter/*/workstreams/*/overview').as(
        'workstreamOverview'
      )
      appPage.visitProjectOverview(fixture.matter.id, fixture.projects[0].id)
      cy.wait('@workstreamOverview')
      cy.wait(2000)
    })
    it('shows the zero state', () => {
      get.taskMapZeroState.text().should('be.visible')
      get.taskMapZeroState.image().should('be.visible')
      get.taskMapZeroState.button().should('be.visible')
    })

    describe('When starting to add a task via the zero state', () => {
      before(() => {
        get.taskMapZeroState.button().click()
        cy.get('[data-test="edit-name-field"]', { timeout: 30000 }).should(
          'be.visible'
        )
      })

      it('Should navigate to the taskmap', () => {
        cy.url().should('include', '/taskmap')
      })

      describe('When cancelling adding a task via the zero state', () => {
        before(() => {
          // cy.get('[data-test=edit-name-field] input', { timeout: 10000 }).type(
          //   '{esc}'
          // )
          cy.get('body').type('{esc}')
          cy.get('body').click()
        })

        it('the zero-state should be displayed', () => {
          cy.get('[data-test="zero-state-title"]', { timeout: 10000 }).should(
            'be.visible'
          )
          cy.get('[data-test="zero-state-caption"]').should('be.visible')
          cy.get('[data-test="taskmap-zero-state-button"]').should('be.visible')
        })

        describe('When the workstream is closed', () => {
          before(() => {
            cy.login(testUser.username)
            updateProject(fixture.matter.id, fixture.projects[0], {
              active: false,
            })
            cy.reload()
            cy.login(testUser.username)
            cy.wait(2000)
          })

          it('should say that the workstream is closed', () => {
            cy.get('[data-test=zero-state-text]').should(
              'have.text',
              'This workstream has been closed'
            )
          })

          after(() => {
            updateProject(fixture.matter.id, fixture.projects[0], {
              active: true,
            })
          })
        })

        describe('When adding a task via the zero state', () => {
          before(() => {
            cy.login(testUser.username)
            appPage.visitProjectOverview(
              fixture.matter.id,
              fixture.projects[0].id
            )
            cy.wait(2000)
            get.taskMapZeroState.button().click()
            cy.wait(2000)
          })

          it('Should navigate to the taskmap', () => {
            cy.url().should('include', '/taskmap')
          })

          describe('When adding a task via the zero state', () => {
            before(() => {
              cy.wait(2000)
              cy.backendRoute('POST', '/matter/*/workstreams/*/tasks').as(
                'postTask'
              )
              cy.get('input').eq(0).type('New Task{enter}')
              cy.wait('@postTask')
            })

            it('should display the first task', () => {
              cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
                'be.visible'
              )
              cy.get('[data-test=options-dropdown]').should('exist')
              cy.get('[data-test=task-cell-test]').should('contain', 'New Task')
            })
          })
        })
      })
    })
  })

  describe('When navigating to an empty project overview as a non-mtm', () => {
    before(() => {
      cy.login(otherUser.username)
      visitHelpers.visitProjectOverview(
        fixture.matter.id,
        fixture.projects[0].id
      )
    })

    it('shows the access denied zero state', () => {
      cy.get('h4', { timeout: 30000 }).should(
        'contain',
        "Oops! You don't have access to this workstream"
      )
    })
  })
})
