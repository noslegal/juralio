import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('external_user_add_matter.cy', () => {
  let user2, user, matter1Fixture, visitHelpers

  before(() => {
    createUser().then(createdUser1 => {
      user = createdUser1
      createUser('externalUser', true, true, {
        externalUser: true,
        roles: [],
      }).then(createdUser2 => {
        user2 = createdUser2
        const seed = {
          matter: {
            prefix: 'tcpds',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [{ name: 'Task 1', posts: {} }],
              },
            ],
          },
        }
        matter1Fixture = generateFixture(seed)

        visitHelpers = new VisitHelpers()
      })
    })
  })

  describe('when converting an internal user to extenral with no roles', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelpers.visitHome(false)
      cy.get('[data-test=accounts]').click()
      cy.wait(3000)
      cy.get('[data-test=search-button]', { timeout: 30000 }).click({
        timeout: 30000,
      })
      cy.get('[data-test=Search]', { timeout: 30000 }).type(user2.username)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=external-radio-button]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(1500)
    })
    it('should work first time', () => {
      cy.get('[data-test=form-dialog-title]').should('not.exist')
    })

    describe('When trying to add users who are external as admins', () => {
      before(() => {
        cy.login(user.username)
        updateFTUE(user, { hasSeenMatterAdmin: true })
        cy.login(user.username) // log in again to refresh status.
        visitHelpers.visitMatter(matter1Fixture.matter.id)
        cy.wait(2000)
        cy.get('[data-test=matter-people]', { timeout: 30000 })
          .should('be.visible')
          .click()
        cy.wait(1500)
        cy.get('[data-test=add-user-matter-button]').click()
        cy.get('[data-test=add-user-flow-autocomplete-text-field]').click({
          timeout: 15000,
        })
        cy.get('[data-test="add-user-flow-autocomplete-text-field"]')
          .find('input')
          .type(user2.username)
        cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        cy.get('[data-test=matter-access]').click()
        cy.get('[data-test=view-admin]').should('have.class', 'Mui-disabled')
        cy.get('[data-test=full-access]').should('have.class', 'Mui-disabled')
        cy.get('[data-test=view-edit]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
        cy.get('[data-test=search-button]', { timeout: 30000 }).click({
          timeout: 30000,
        })
        cy.get('[data-test=Search]').type(user2.username)
      })
      it('should not add external users as admins', () => {
        cy.get('[data-test=matter-content]')
          .should('not.contain', 'Full access')
          .and('not.contain', 'View and admin')
      })
      it('should not allow for the user to be switched to no access admin', () => {
        cy.get('[data-test=matter-content]').click()
        cy.get('[data-test=no-access-disabled]').should('exist')
        cy.get('[data-test=no-access]').should('not.exist')
      })
    })

    describe('When trying to add users who are external as no access admin it should not add them ', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitMatter(matter1Fixture.matter.id)
        cy.wait(2000)
        cy.get('[data-test=matter-people]', { timeout: 30000 })
          .should('be.visible')
          .click()
        cy.wait(3000)
        cy.get('[data-test=search-button]', { timeout: 30000 }).click({
          timeout: 30000,
        })
        cy.get('[data-test=Search]').type(user2.username)
        cy.get('[data-test=delete-button]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
        cy.get('[data-test=add-user-matter-button]').click()
        cy.get('[data-test=add-user-flow-autocomplete-text-field]').click()
        cy.get('[data-test="add-user-flow-autocomplete-text-field"]')
          .find('input')
          .type(user2.username)
        cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        cy.get('[data-test=matter-access]').click()
        cy.get('[data-test=no-access]').should('have.class', 'Mui-disabled')
        cy.get('body').type('{esc}')
        cy.get('[data-test=cancel-dialog-button]').click()
        cy.wait(2000)
      })
      it('should not add external users to the table', () => {
        cy.get('[data-test=search-button]', { timeout: 30000 }).click({
          timeout: 30000,
        })
        cy.get('[data-test=Search]').type(user2.username)
        cy.get('[data-rowindex=1] [data-colindex=0]').should('not.exist')
      })
    })
  })
})
