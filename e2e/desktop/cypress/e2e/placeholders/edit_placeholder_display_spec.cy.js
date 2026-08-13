import faker from 'faker'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  DEFAULT_ORGANISATION_ID,
  createUser,
} from '../../../../helpers/users/user_api_helper'

describe('edit_placeholders_display_spec.cy', () => {
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
        cy.get('[data-test=matter-people]').click({ force: true })
        cy.get('[data-test=placeholders-tab]').click()
      })
    })
    describe('When attempting to edit a placeholder', () => {
      before(() => {
        cy.get('[data-test=edit-placeholder-button]').click()
      })
      it('should show the populated dialog with the action disabled', () => {
        cy.get('[data-test=dialog-header-title-text]').should('be.visible')
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain.text',
          'Manage Placeholder'
        )
        cy.get('[data-test=firstname-input]')
          .find('input')
          .should('have.value', p1.firstName)
        cy.get('[data-test=lastname-input]')
          .find('input')
          .should('have.value', p1.lastName)
        cy.get('[data-test=email-input]').find('input').should('be.empty')
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })
      describe('When trying to clear a name field', () => {
        before(() => {
          cy.get('[data-test=firstname-input]').find('input').clear()
        })
        it('Should disable the action button', () => {
          cy.get('[data-test=firstname-input]').find('input').should('be.empty')
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })
        describe('When updating a name field to more than 30 characters', () => {
          before(() => {
            cy.get('[data-test=firstname-input]')
              .find('input')
              .type('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
          })
          it('Should disable the actioin and show max char error text', () => {
            cy.get('[data-test=firstname-input]')
              .find('p')
              .should('contain.text', 'Maximum 30 characters')
            cy.get('[data-test=action-dialog-button]').should('be.disabled')
          })
          describe('When successfuly updating the placeholder', () => {
            before(() => {
              cy.get('[data-test=firstname-input]').find('input').clear()
              cy.get('[data-test=firstname-input]')
                .find('input')
                .type('Newname')
            })
            it('should update the table with the new name', () => {
              cy.get('[data-test=action-dialog-button]').click()
              cy.wait(1000)
              cy.get('[data-test=placeholder-name-text]').should(
                'contain.text',
                'Newname ' + p1.lastName
              )
            })
          })
        })
      })
    })
  })
})
