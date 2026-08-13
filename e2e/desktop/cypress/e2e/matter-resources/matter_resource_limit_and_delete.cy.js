import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../helpers/users/user_api_helper'

describe('matter_resource_limit_and_delete.cy', () => {
  let user, user2, fixture, resource
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
            matterAdmins: [user, user2],
            projects: [{ name: 'a' }, { name: 'b' }],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('when visiting with 14 resources', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.get('[data-test=menuItem]').eq(2).click()
      for (let i = 0; i < 14; i++) {
        cy.get('[data-test=add-resource-button]').click()
        cy.get('[data-test=add-resource-name]')
          .find('input')
          .type(`resource-${i}`)
        cy.get('[data-test=link-url]').find('input').type('https://google.com')
        cy.get('[data-test=action-dialog-button]').click()
      }
    })
    it('should not diable the add button', () => {
      cy.get('[data-test=add-resource-button]').should('not.be.disabled')
    })
    describe('when reaching the limit', () => {
      before(() => {
        cy.get('[data-test=add-resource-button]').click()
        cy.get('[data-test=add-resource-name]')
          .find('input')
          .type('resource-15')
        cy.get('[data-test=link-url]').find('input').type('https://google.com')
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should diable the add button', () => {
        cy.get('[data-test=add-resource-button]').should('be.disabled')
      })
      describe('when deleting a label', () => {
        before(() => {
          cy.get('[data-test=card-options]').eq(0).click()
          cy.get('[data-test=delete-option]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should update from the delete', () => {
          cy.get('[data-test=add-resource-button]').should('not.be.disabled')
          cy.get('[data-test=resource-count]').should(
            'have.text',
            '14 Resources'
          )
        })
      })
    })
  })
})
