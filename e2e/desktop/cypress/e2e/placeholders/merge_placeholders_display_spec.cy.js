import faker from 'faker'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  DEFAULT_ORGANISATION_ID,
  createUser,
} from '../../../../helpers/users/user_api_helper'

describe('merge_placeholders_display_spec.cy', () => {
  let user, user2, fixture, resource, p1, p2
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser('other user', undefined, false).then(createdUser => {
      user2 = createdUser
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
      createUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user],
            matterAdmins: [user2],
            projects: [],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('as a matter admin', () => {
    before(() => {
      cy.login(user2)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
      }).then(res => {
        p1 = res.body

        cy.login(user2.username)
        visitHelpers.visitMatter(fixture.matter.id)
        cy.wait(5000)
        cy.get('[data-test=matter-people]').click({ force: true })
        cy.get('[data-test=placeholders-tab]').click()
      })
    })
    it('should disable the merge button when there is only 1 placeholder', () => {
      cy.get('[data-test=merge-placeholders-button]').should('be.disabled')
    })
    describe('when there are 2 placeholders', () => {
      before(() => {
        cy.login(user2.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/placeholders`,
          method: 'POST',
          body: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
          },
        }).then(res => {
          p2 = res.body
          cy.login(user2.username)
          visitHelpers.visitMatter(fixture.matter.id)
          cy.get('[data-test=matter-people]').click({ force: true })
          cy.get('[data-test=placeholders-tab]').click()
        })
      })
      it('should not disable the merge button when there is only 1 placeholder', () => {
        cy.get('[data-test=merge-placeholders-button]').should(
          'not.be.disabled'
        )
      })
      describe('in the merge dialog', () => {
        before(() => {
          cy.get('[data-test=merge-placeholders-button]').click()
        })
        it('should be disabled dy default', () => {
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })
        describe('when selection the first placeholder', () => {
          before(() => {
            cy.get('[data-test=merge-placeholder-select]').eq(0).click()
          })
          it('should have 2 options', () => {
            cy.get('[data-test=placeholder-option]').should('have.length', 2)
          })
          describe('when selection the first placeholder', () => {
            before(() => {
              cy.get('[data-test=placeholder-option]').eq(0).click()
              cy.get('[data-test=merge-placeholder-select]').eq(1).click()
            })
            it('should have 2 options', () => {
              cy.get('[data-test=placeholder-option]').should('have.length', 1)
            })
          })
          describe('when cancelling', () => {
            before(() => {
              cy.get('[data-test=placeholder-option]').eq(0).click()
              cy.get('[data-test=cancel-dialog-button]').click()
            })
            it('does not merge', () => {
              cy.get('[data-test=user-list-item]').should('have.length', 2)
            })
            describe('when merging', () => {
              before(() => {
                cy.get('[data-test=merge-placeholders-button]').click()
                cy.get('[data-test=merge-placeholder-select]').eq(0).click()
                cy.get('[data-test=placeholder-option]').eq(0).click()
                cy.get('[data-test=merge-placeholder-select]').eq(1).click()
                cy.get('[data-test=placeholder-option]').eq(0).click()
                cy.get('[data-test=merge-placeholder-master-select]').click()
                cy.get('[data-test=merge-master-option-1]').click()
                cy.get('[data-test=action-dialog-button]').click()
                cy.wait(5000)
              })
              it('should merge the placeholders', () => {
                cy.get('[data-test=user-list-item]').should('have.length', 1)
                cy.get('[data-test="placeholder-name-text"]').should(
                  'have.text',
                  `${p1.firstName} ${p1.lastName}`
                )
              })
            })
          })
        })
      })
    })
  })
})
