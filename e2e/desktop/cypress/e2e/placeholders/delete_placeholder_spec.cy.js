import faker from 'faker'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  DEFAULT_ORGANISATION_ID,
  createUser,
} from '../../../../helpers/users/user_api_helper'

describe('delete_placeholder_display_spec.cy', () => {
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
    describe('When cancelling', () => {
      before(() => {
        cy.get('[data-test=delete-placeholder-button]').click()
        cy.get('[data-test=cancel-dialog-button]').click()
      })
      it('Should only have 1 item', () => {
        cy.get('[data-test=user-list-item]').should('have.length', 1)
      })
    })
    describe('When successfuly deleting a placeholder', () => {
      before(() => {
        cy.get('[data-test=delete-placeholder-button]').click()
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should delete the placeholder and remove them from the list', () => {
        cy.get('[data-test=user-list-item]').should('have.length', 0)
      })
    })
  })
})
