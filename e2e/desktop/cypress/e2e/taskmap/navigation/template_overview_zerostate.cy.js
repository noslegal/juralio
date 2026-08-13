import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../page/project/overview/project_overview_page'

describe('template_overview_zerostate.cy', () => {
  let testUser,
    fixture,
    appPage,
    template,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
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
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(testUser.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
          }
        )
      })
  })

  describe('When navigating to an empty project overview', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTemplateOverview(template.id)
    })

    it('shows the zero state', () => {
      get.taskMapZeroState.text().should('be.visible')
      get.taskMapZeroState.image().should('be.visible')
      get.taskMapZeroState.button().should('be.visible')
    })

    describe('When starting to add a task via the zero state', () => {
      before(() => {
        get.taskMapZeroState.button().click()
        cy.wait(2000)
      })

      it('Should navigate to the taskmap', () => {
        cy.url().should('include', '/taskmap')
      })

      describe('When cancelling adding a task via the zero state', () => {
        before(() => {
          //cy.get('[data-test=taskmap-zero-state-button]').click()
          cy.wait(1000)
          cy.get('[data-test=edit-name-field]').find('input').type('{ESC}')
          cy.wait(1000)
        })

        it('the zero-state should be displayed', () => {
          cy.get('[data-test="zero-state-title"]', { timeout: 30000 }).should(
            'be.visible'
          )
          cy.get('[data-test="zero-state-caption"]').should('be.visible')
          cy.get('[data-test="taskmap-zero-state-button"]').should('be.visible')
        })

        describe('When adding a task via the zero state', () => {
          before(() => {
            cy.login(testUser.username)
            appPage.visitTemplateOverview(template.id)
            get.taskMapZeroState.button().click()
            cy.wait(2000)
          })

          it('Should navigate to the taskmap', () => {
            cy.url().should('include', '/taskmap')
          })

          describe('When adding a task via the zero state', () => {
            before(() => {
              //cy.get('[data-test="taskmap-zero-state-button"]').click()
              cy.get('[data-test=edit-name-field]')
                .click()
                .type('New Task{enter}')
            })

            it('should display the first task', () => {
              cy.get('[data-test=task-cell-test]').should('be.visible')
              cy.get('[data-test=options-dropdown]').should('exist')
              cy.get('[data-test=task-cell-test]').should('contain', 'New Task')
            })
          })
        })
      })
    })
  })
})
