import {
  addMatterAdmin,
  createMatter,
  updateMatterStatus,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

const getMatterRowByOrgName = matterName => {
  cy.backendRoute('GET', '/matters?**').as('mattersList')
  cy.get('[data-test=search-button]').click()
  cy.get('[data-test=Search]').clear().type(matterName, { delay: 5 })
  cy.wait('@mattersList')
  cy.get('[data-test=matters-list-item]', { timeout: 10000 }).should(
    'contain',
    matterName
  )
  return cy.get('[data-test=matters-list-item]')
}

describe('oa_organisation_matters_update_status.cy', () => {
  let aMatter, standardUser

  const navigateToOrgMatters = () => {
    cy.login(standardUser.username)
    visitHelpers.visitOrgMatters()
  }

  before(() => {
    createUser().then(user => {
      standardUser = user
      createMatter().then(matter => {
        aMatter = matter
        addMatterAdmin(matter.id, user.id)
      })
      createMatter()
    })
  })

  describe('When looking at an Active matter in the Org Matter list', () => {
    before(() => {
      navigateToOrgMatters()
      getMatterRowByOrgName(aMatter.name)
    })

    it('should display a table title', () => {
      cy.get('[data-test=matters-table-title]').should('contain', 'Matters')
    })

    it('should display a read only Active matter chip', () => {
      cy.get('[data-test=matter-statustoggle-wrapper]')
        .should('contain', 'Active')
        .find('div')
        .should('have.attr', 'disabled')
    })
  })

  describe('When looking at an closed matter in the Org Matter list', () => {
    before(() => {
      cy.login(standardUser.username)
      updateMatterStatus(aMatter.id, 'closed')
      navigateToOrgMatters()
      getMatterRowByOrgName(aMatter.name)
    })

    it('should display a table title', () => {
      cy.get('[data-test=matters-table-title]').should('contain', 'Matters')
    })

    it('should display an updatable Active matter chip', () => {
      cy.get('[data-test=matter-statustoggle-wrapper]')
        .should('contain', 'Closed')
        .find('div')
        .should('not.have.attr', 'disabled')
    })

    describe('When reopening a closed Matter', () => {
      before(() => {
        cy.login(standardUser.username)
        navigateToOrgMatters()
        getMatterRowByOrgName(aMatter.name)
        cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
        cy.get('[data-test=status-select-on-option]').click()
        navigateToOrgMatters()
        getMatterRowByOrgName(aMatter.name)
      })

      it('should display a read only Active matter chip', () => {
        cy.get('[data-test=matter-statustoggle-wrapper]')
          .should('contain', 'Active')
          .find('div')
          .should('have.attr', 'disabled')
      })
    })
  })
})
