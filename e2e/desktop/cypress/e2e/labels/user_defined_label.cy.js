//api uniqueness
import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let testUser, appPage, fixture

const open = () => {
  cy.backendRoute(
    'GET',
    `/matter/${fixture.matter.id}/labels**`
  ).as('fetchLabels')

  cy.get('[data-test=add-label-button]').click()
  cy.wait('@fetchLabels')
  cy.wait(1000)
}

//frontend validation
describe('user_defined_label.cy', () => {
  
  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
      const seed = {
        matter: {
          prefix: 'directroute',
          teamMembers: [testUser],
          matterAdmins: [testUser],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'user defined label task' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when adding a user defined label', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTaskByName('user defined label task')
      open()
      cy.get('[data-test=label-search-field]')
        .find('input')
        .type('validNewLabel')
      cy.get('[data-test=add-user-defined-label-button]').click()
    })
    it('should add the new label', () => {
      cy.get('[data-test=label-chip-text]').should('have.length', 1)
    })
  })
  describe('when adding an invalid user defined label', () => {
    before(() => {
      open()
      cy.get('[data-test=label-search-field]').find('input').type('-')
    })
    it('should not allow _', () => {
      cy.get('[data-test=add-label-error-text]').should('exist')
    })
    after(() => {
      cy.get('[data-test=label-search-field]').find('input').clear()
    })
  })
  describe('when adding an invalid user defined label', () => {
    before(() => {
      cy.get('[data-test=label-search-field]').find('input').type('*')
    })
    it('should not allow *', () => {
      cy.get('[data-test=add-label-error-text]').should('exist')
    })
    after(() => {
      cy.get('[data-test=label-search-field]').find('input').clear()
    })
  })
  describe('when adding an invalid user defined label', () => {
    before(() => {
      cy.get('[data-test=label-search-field]').find('input').type('1')
    })
    it('should not allow to start iwth a number', () => {
      cy.get('[data-test=add-label-error-text]').should('exist')
    })
    after(() => {
      cy.get('[data-test=label-search-field]').find('input').clear()
    })
  })
  describe('when adding an valid user defined label', () => {
    before(() => {
      cy.get('[data-test=label-search-field]').find('input').type('#A123')
    })
    it('should not allow to start iwth a number', () => {
      cy.get('[data-test=add-label-error-text]').should('not.exist')
    })
    after(() => {
      cy.get('[data-test=label-search-field]').find('input').clear()
    })
  })
  describe('when adding an label with the same name as an existing one', () => {
    before(() => {
      cy.get('[data-test=label-search-field]').find('input').type('Cost')
    })
    it('should allow you to add it as a hashtag', () => {
      cy.get('[data-test=add-user-defined-label-button]').should(
        'have.text',
        'Add "#Cost" hashtag'
      )
    })
    after(() => {
      cy.get('[data-test=label-search-field]').find('input').clear()
    })
  })
  describe('when adding a valid label', () => {
    before(() => {
      cy.get('[data-test=label-search-field]').find('input').type('new_label')
      cy.get('[data-test=add-user-defined-label-button]').click()
    })
    it('should add ther label to the task', () => {
      cy.get('[data-test=label-chip-text]').should('have.length', 1)
    })
  })
})
