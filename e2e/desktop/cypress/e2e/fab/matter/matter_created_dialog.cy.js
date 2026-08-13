import { createMatterWithBlankWorkstream } from '../../../../../helpers/matter/matter_create_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createBlankTemplate,
  createTemplateTask,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
let standardUser

describe(
  'matter_created_dialog.cy',
  { retries: { runMode: 2, openMode: 0 } },
  () => {
    before(() => {
      createUser(undefined, true, true, {
        roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
      }).then(createdUser => {
        standardUser = createdUser
        createBlankTemplate('temp').then(t => {
          template = t
          createTemplateTask(template.id, undefined, 'test')
          publishTemplate(template.id)
        })
      })
    })

    describe('When a matter is created', () => {
      before(() => {
        cy.login(standardUser.username)
        createMatterWithBlankWorkstream('Agatha', 'Christie', 'HP')
        cy.wait(5000)
      })

      it(
        'should navigate to the matter overview',
        { retries: { runMode: 3, openMode: 3 } },
        () => {
          cy.url().should('contains', '/matter')
          cy.url().should('contains', '/overview')
        }
      )

      it('show the Matter Created dialog', () => {
        cy.get('[data-test=dialog-content]', { timeout: 30000 }).should('exist')
        cy.get('[data-test=invite-people-button]').should('exist')
        cy.get('[data-test=dialog-content] [data-test=add-task-button]', {
          timeout: 30000,
        }).should('exist')
      })

      describe('when clicking on the invite people button', () => {
        before(() => {
          cy.get('[data-test=invite-people-button]').click()
        })

        it('should navigate to the matter admin', () => {
          cy.url().should('contains', '/matteradmin')
          cy.get('[data-test=dialog-header-title-text]', {
            timeout: 30000,
          }).should('be.visible')
        })

        describe('when navigating to the matter overview', () => {
          before(() => {
            cy.get('[data-test=cancel-dialog-button]').click()
            cy.get('[data-test=matter-switcher-button]').click()
            cy.wait(3000)
            cy.get('[data-test=matter-item-matter-name]').eq(0).click()
            cy.wait(3000)
            cy.get('[data-test=go-to-matter-overview]').eq(0).click()
          })

          it('should not redisplay the matter created dialog', () => {
            cy.get('[data-test=dialog-header-title-text]').should(
              'not.be.exist'
            )
            cy.get('[data-test=invite-people-button]').should('not.exist')
          })
        })
      })
    })

    describe('when creating a matter clicking on the add tasks button', () => {
      before(() => {
        cy.login(standardUser.username)

        createMatterWithBlankWorkstream('Charles', 'Dickens', 'Pip')
        cy.get('[data-test=dialog-content]', { timeout: 30000 }).should(
          'be.visible'
        )
        cy.wait(5000)
        cy.get('[data-test=dialog-content] [data-test=add-task-button]')
          .should('be.visible')
          .click()
      })

      it('should navigate to the taskmap and be ready to enter the first task', () => {
        cy.url().should('contains', '/taskmap')
        cy.get('[data-test=edit-name-field]', { timeout: 30000 }).click()
      })
    })
  }
)
