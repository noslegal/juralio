import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('navigation_buttons.cy', () => {
  let fixture, user

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'navigation_buttons.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [{ name: 'Test Task' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('when visiting pages without navigation buttons', () => {
    let templateId

    before(() => {
      createTemplate('Test Template', fixture.projects[0].id).then(template => {
        templateId = template.id
      })
    })

    describe('when a user navigates to home', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home/')
      })

      it('should not render a task map button', () => {
        cy.get('[data-test=taskmap-navigation]').should('not.exist')
      })
    })

    describe('when a user navigates to a template taskmap', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTemplateTaskMap(templateId)
      })

      it('should render a task map button', () => {
        cy.get('[data-test=taskmap-navigation]').should('exist')
      })
    })
  })

  describe('when visiting pages with navigation buttons', () => {
    let projectId, matterId, taskId

    before(() => {
      projectId = fixture.projects[0].id
      matterId = fixture.matter.id
      taskId = fixture.tasks[0].id
    })

    describe('when visiting pages at project level', () => {
      let taskMapUrl, taskDetailsUrl

      before(() => {
        taskMapUrl = `/#/matter/${matterId}/workstream/${projectId}/taskmap`
        taskDetailsUrl = `/#/matter/${matterId}/workstream/${projectId}/task/${taskId}`
      })

      describe('when a user navigates to task details (from task map)', () => {
        before(() => {
          cy.login(user.username)
          cy.backendRoute(
            '/matter/*/workstreams/*?includePosts=true&includeTaskTeam=true'
          ).as('loadTaskmap')
          cy.backendRoute('/matter/*').as('matterDetails')
          cy.visit(taskMapUrl)
          cy.wait(['@loadTaskmap', '@matterDetails'])
        })

        it('should render an overview button,  a task map button', () => {
          cy.get('[data-test=overview-button]').should('be.visible')
          cy.get('[data-test=taskmap-navigation]').should('be.visible')
        })

        describe('when the overview button is clicked', () => {
          before(() => {
            cy.backendRoute('/matter/*/overview').as('matterOverview')
            cy.wait(2000) //wait for the app to figure out its own state

            cy.get('[data-test=overview-button]').click({ force: true })
            //cy.wait('@matterOverview')
          })

          it('should navigate to the project overview', () => {
            cy.url().should('contains', `/overview`)
          })
        })

        describe('when the taskmap button is clicked', () => {
          before(() => {
            cy.login(user.username)
            cy.visit(taskDetailsUrl)
            cy.get('[data-test=taskmap-navigation]').click({ force: true })
          })

          it('should navigate to the taskmap', () => {
            cy.url().should('contains', `/taskmap?id=${taskId}`)
          })
        })
      })

      describe('when a user navigates to task details (from overview)', () => {
        before(() => {
          cy.login(user.username)
          cy.visit(taskDetailsUrl)
        })

        it('should render a task map button', () => {
          cy.get('[data-test=taskmap-navigation]').should('be.visible')
        })

        describe('when the taskmap button is clicked', () => {
          before(() => {
            cy.get('[data-test=taskmap-navigation]').click({ force: true })
          })

          it('should navigate to the overview taskmap with task selected', () => {
            cy.url().should('contains', `/taskmap?id=${taskId}`)
          })
        })
      })

      describe('when a user navigates to taskmap', () => {
        before(() => {
          cy.login(user.username)
          cy.visit(taskMapUrl)
        })

        it('should render a task map button', () => {
          cy.get('[data-test=taskmap-navigation]').should('be.visible')
        })
      })
    })

    describe('when visiting pages with a specific task selected', () => {
      let taskMapUrl

      before(() => {
        taskMapUrl = `/#/matter/${matterId}/workstream/${projectId}/taskmap?id=${taskId}`
      })

      describe('when a user navigates to taskmap', () => {
        before(() => {
          cy.login(user.username)
          cy.visit(taskMapUrl)
        })

        it('should render a task map button', () => {
          cy.get('[data-test=taskmap-navigation]').should('be.visible')
        })
      })
    })
  })
})
