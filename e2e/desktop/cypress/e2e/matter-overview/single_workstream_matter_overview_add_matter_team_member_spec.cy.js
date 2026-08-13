import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('single_workstream_matter_overview_add_matter_team_member_spec', () => {
  let testUser, fixture, user2, user3, user4, user5, user6

  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
      createUser().then(u => (user3 = u))
      createUser().then(u => (user4 = u))
      createUser().then(u => (user5 = u))
      createUser().then(u => (user6 = u))
      createUser().then(u2 => {
        user2 = u2
        const seed = {
          matter: {
            teamMembers: [testUser, user2],
            matterAdmins: [testUser],
            description: 'desc',
            projects: [
              {
                name: 'Workstream',
                tasks: [],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('when a admin visits the matter overview', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.get('[data-test=menuItem]', { timeout: 30000 }).eq(1).click()
    })
    it('should show an add button', () => {
      cy.get('[data-test=add-user-matter-button]').should('be.visible')
    })
    describe('when adding a non admin', () => {
      before(() => {
        cy.get('[data-test=add-user-matter-button]').click()
        cy.get('[data-test=add-user-flow-autocomplete-text-field]').click({
          timeout: 30000,
        })
        cy.get('[data-test="add-user-flow-autocomplete-text-field"]')
          .find('input')
          .type(user3.username)
        cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click({ force: true })
        cy.wait(3000)
      })
      it('should add the user to the table', () => {
        cy.get('[data-rowindex=2]').should('be.visible')
      })
    })
    describe('when adding an admin', () => {
      before(() => {
        cy.get('[data-test=add-user-matter-button]').click()
        cy.get('[data-test=add-user-flow-autocomplete-text-field]').click({
          timeout: 30000,
        })
        cy.get('[data-test="add-user-flow-autocomplete-text-field"]')
          .find('input')
          .type(user4.username)
        cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        cy.get('[data-test="matter-access"]').click()
        cy.get('[data-test="full-access"]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
      })
      it('should add the user to the table', () => {
        cy.get('[data-rowindex=3]').should('be.visible')
        cy.get(
          `[data-test=user-avatar-${user4.firstname}-${user4.lastname}]`
        ).should('be.visible')
      })
    })
  })
})
