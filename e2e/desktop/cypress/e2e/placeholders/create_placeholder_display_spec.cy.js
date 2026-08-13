import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  DEFAULT_ORGANISATION_ID,
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

describe('create_placeholder_display_spec.cy', () => {
  let user, user2, fixture
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
            teamMembers: [user, user2],
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
      updateFTUE(user2, { hasSeenMatterAdmin: true })
      cy.login(user2.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.get('[data-test=matter-people]').click()
      cy.get('[data-test=placeholders-tab]').click()
      cy.wait(1000)
      cy.get('[data-test=add-placeholder-button]').click()
    })
    it('should display the create placeholder dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should('be.visible')
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain.text',
        'Create Placeholder'
      )
    })
    describe('When both name fields are blank', () => {
      before(() => {
        cy.get('[data-test=firstname-input]').find('input')
        cy.get('[data-test=lastname-input]').find('input')
      })
      it('Should be disabled', () => {
        cy.get('[data-test=firstname-input]').find('input').should('be.empty')
        cy.get('[data-test=lastname-input]').find('input').should('be.empty')
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })
    })
    describe('When only the first name field is blank', () => {
      before(() => {
        cy.get('[data-test=firstname-input]').find('input')
        cy.get('[data-test=lastname-input]').find('input').type('Smith')
      })
      it('Should be disabled', () => {
        cy.get('[data-test=firstname-input]').find('input').should('be.empty')
        cy.get('[data-test=lastname-input]')
          .find('input')
          .should('have.value', 'Smith')
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })
      describe('When only the last name field is blank', () => {
        before(() => {
          cy.get('[data-test=firstname-input]').find('input').type('John')
          cy.get('[data-test=lastname-input]').find('input').clear()
        })
        it('Should be disabled', () => {
          cy.get('[data-test=firstname-input]')
            .find('input')
            .should('have.value', 'John')
          cy.get('[data-test=lastname-input]').find('input').should('be.empty')
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })
        describe('When both fields have a value', () => {
          before(() => {
            cy.get('[data-test=lastname-input]').find('input').type('Smith')
            cy.get('[data-test=email-input]').find('input').type('1@1.com')
          })
          it('Should be enabled', () => {
            cy.get('[data-test=firstname-input]')
              .find('input')
              .should('have.value', 'John')
            cy.get('[data-test=lastname-input]')
              .find('input')
              .should('have.value', 'Smith')
            cy.get('[data-test=action-dialog-button]').should('be.enabled')
          })
          describe('After successfully creating a placeholder', () => {
            before(() => {
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(3000)
            })
            it('Should display the new placeholder in the table', () => {
              cy.get('[data-test=user-list-item]').should('have.length', 1)
              cy.get('[data-test=placeholder-name-text]').should(
                'contain.text',
                'John Smith'
              )
            })
            describe('When cancelling', () => {
              before(() => {
                cy.get('[data-test=add-placeholder-button]').click()
                cy.wait(1000)
                cy.get('[data-test=firstname-input]')
                  .find('input')
                  .type('Smith')
                cy.get('[data-test=lastname-input]').find('input').type('Smith')
                cy.wait(1000)
                cy.get('[data-test=cancel-dialog-button]').click()
              })
              it('Should only have 1 item', () => {
                cy.get('[data-test=user-list-item]').should('have.length', 1)
              })
            })
            describe('When trying to use a name that is already used by another placeholder', () => {
              before(() => {
                cy.login(user2.username)
                cy.wait(3000)
                cy.reload()
                cy.get('[data-test=matter-people]').click()
                cy.get('[data-test=placeholders-tab]').click()
                cy.wait(1000)
                cy.get('[data-test=add-placeholder-button]').click()
                cy.wait(1000)
                cy.get('[data-test=firstname-input]').find('input').type('John')
                cy.wait(1000)
                cy.get('[data-test=lastname-input]').find('input').type('Smith')
              })
              it('Should show the name in use error text', () => {
                cy.get('[data-test=name-in-use-error-text]').should(
                  'be.visible'
                )
                cy.get('[data-test=action-dialog-button]').should('be.disabled')
              })
              describe('When trying to use a name that is already used by another placeholder', () => {
                before(() => {
                  cy.get('[data-test=email-input]')
                    .find('input')
                    .type('1@1.com')
                })
                it('Should show the name in use error text', () => {
                  cy.get('[data-test=email-in-use-error-text]').should(
                    'be.visible'
                  )
                  cy.get('[data-test=action-dialog-button]').should(
                    'be.disabled'
                  )
                })
              })
            })
            // describe('When a server error happens', () => {
            //   before(() => {
            //     cy.get('[data-test=add-placeholder-button]').click()
            //     cy.wait(1000)
            //     cy.get('[data-test=firstname-input]').find('input').type('Smith')
            //     cy.get('[data-test=lastname-input]').find('input').type('Smith')
            //     cy.wait(1000)
            //     cy.get('[data-test=action-dialog-button]').click()
            //     cy.intercept('POST', `/admin/matter/${
            //       fixture.matter.id
            //     }/placeholders`, {
            //       statusCode: 500,
            //       body: {
            //       },
            //     })
            //   })
            //   it('Should show the error text', () => {
            //     cy.get('[data-test=create-error-text]').should('be.visible')
            //   })
            // })
          })
        })
      })
    })
  })
})
