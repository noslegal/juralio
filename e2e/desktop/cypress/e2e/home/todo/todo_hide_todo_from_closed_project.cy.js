import {
  getPayloadForDate,
  updatePED,
} from '../../../../../helpers/date/date_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('todo_hide_todo_from_closed_project.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'todohide ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Knitting',
              tasks: [{ name: 'Loom', teamMembers: [user] }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when a user has a todo on an active Project and Matter', () => {
    let matterId, projectId
    let matterUrl, projectUrl

    before(() => {
      matterId = fixture.matter.id
      projectId = fixture.projects[0].id
      projectUrl = `${Cypress.env(
        'serverBaseUrl'
      )}/admin/matter/${matterId}/workstreams/${projectId}`
      matterUrl = `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}`

      cy.login(user.username)
      updatePED(matterId, projectId, fixture.tasks[0].id, '+', 4).then(
        response => {
          getPayloadForDate(response.plannedEndDate)
        }
      )
      appPage.visitHome()
      cy.get('[data-test=todo-range-picker-button]').click()
      cy.get('[data-test=todo-option-all]').click()
    })

    it('should render the todo item', () => {
      cy.get('[data-test=juralio-chip-task]').should('exist')
    })

    it('should render the recent task item', () => {
      cy.get('[data-test=task-chip-wrapper]').should('exist')
    })

    describe('when the workstream is closed and the matter is open', () => {
      before(() => {
        cy.login(user.username)

        cy.request({
          url: projectUrl,
          method: 'PATCH',
          body: {
            active: false,
          },
        }).then(() => {
          appPage.visitHome()
        })
      })

      checkTaskNotPresent()

      describe('when the workstream is closed and the matter is closed', () => {
        before(() => {
          cy.login(user.username)

          cy.request({
            url: matterUrl,
            method: 'PATCH',
            body: {
              matterStatus: 'closed',
            },
          }).then(() => {
            appPage.visitHome()
          })
        })

        checkTaskNotPresent()

        describe('when the workstream is open and the matter is closed', () => {
          before(() => {
            cy.login(user.username)

            cy.request({
              url: projectUrl,
              method: 'PATCH',
              body: {
                active: true,
              },
            }).then(() => {
              appPage.visitHome()
            })
          })

          checkTaskNotPresent()
        })
      })
    })
  })
})

function checkTaskNotPresent() {
  it('should not render the todo item', () => {
    cy.get('[data-test=todo-item-name]').should('not.exist')
  })
  it('should not render the recent task item', () => {
    cy.get('[data-test=task-chip-wrapper]').should('not.exist')
  })
}
