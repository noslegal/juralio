import {
  createMatter,
  addTeamMembers,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisationUser,
  createUser,
  DEFAULT_ORGANISATION_ID,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import { createOrganisationGroup } from '../../../../../helpers/organisation/organisation_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import faker from 'faker'

const visitHelpers = new VisitHelpers()

describe('group_position_table.cy', () => {
  let matterAdmin, externalGroup, externalUser, matter

  const navigateToGroupPositionsTab = () => {
    cy.login(matterAdmin.username)
    visitHelpers.visitMatter(matter.id)
    cy.get('[data-test=matter-people]', { timeout: 30000 }).click()
    cy.contains('Group positions', { timeout: 10000 }).click()
    cy.wait(2000)
  }

  const changeFirstRowPosition = () => {
    cy.get('[data-field=position]')
      .find('.MuiSelect-select')
      .first()
      .then($sel => {
        const target = $sel.text().includes('Client') ? 'Advisor' : 'Client'
        cy.wrap($sel).click({ force: true })
        cy.get('.MuiMenuItem-root', { timeout: 5000 }).contains(target).click()
      })
  }

  before(() => {
    createUser(undefined, true, true, {
      roles: ['ROLE_USER', 'ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
    })
      .then(user => {
        matterAdmin = user
        updateFTUE(matterAdmin, { hasSeenMatterAdmin: true })
        cy.login(matterAdmin.username)
        return createOrganisationGroup(
          DEFAULT_ORGANISATION_ID,
          faker.company.companyName(),
          false
        )
      })
      .then(group => {
        externalGroup = group
        cy.login(matterAdmin.username)
        return createOrganisationUser({
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          username: faker.internet.email().toLowerCase(),
          roles: ['ROLE_USER'],
          group: externalGroup.id,
        })
      })
      .then(user => {
        externalUser = user
        return createMatter(undefined, matterAdmin.username)
      })
      .then(createdMatter => {
        matter = createdMatter
        return addTeamMembers(
          matter.id,
          [externalUser.id],
          matterAdmin.username
        )
      })
  })

  describe('the group positions tab', () => {
    before(navigateToGroupPositionsTab)

    it('should display the group positions DataGrid', () => {
      cy.get('.MuiDataGrid-root').should('exist')
    })

    it('should have Group, Position and delete column headers', () => {
      cy.get('[data-field=group]').first().should('exist')
      cy.get('[data-field=position]').first().should('exist')
      cy.get('[data-field=delete]').first().should('exist')
    })

    it('should display at least one row', () => {
      cy.get('.MuiDataGrid-row').should('have.length.at.least', 1)
    })

    describe('the internal group row', () => {
      it('should have its delete button disabled', () => {
        cy.get('[data-field=delete]')
          .find('button')
          .filter('[disabled]')
          .should('have.length.at.least', 1)
      })
    })

    describe('the position Select', () => {
      it('should render a Select dropdown in the position column', () => {
        cy.get('[data-field=position]')
          .find('.MuiSelect-select')
          .should('exist')
      })

      it('should have at least one position option available', () => {
        cy.get('[data-field=position]')
          .find('.MuiSelect-select')
          .first()
          .click({ force: true })
        cy.get('.MuiMenuItem-root', { timeout: 5000 }).should(
          'have.length.at.least',
          1
        )
        cy.get('body').type('{esc}')
      })
    })
  })

  describe('when changing a group position', () => {
    before(navigateToGroupPositionsTab)

    before(changeFirstRowPosition)

    it('should show the position change confirmation dialog', () => {
      cy.get('[data-test=juralio-dialog]', { timeout: 10000 }).should('exist')
    })

    it('should have the action button disabled until "UPDATE" is typed', () => {
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
    })

    it('should enable the action button after typing "UPDATE"', () => {
      cy.get('.MuiDialog-root').find('input').type('UPDATE')
      cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
    })

    describe('when confirming the position change', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should close the confirmation dialog', () => {
        cy.get('[data-test=juralio-dialog]').should('not.exist')
      })

      it('should still show the row in the table', () => {
        navigateToGroupPositionsTab()
        cy.get('.MuiDataGrid-row').should('have.length.at.least', 1)
      })
    })
  })

  describe('when cancelling a position change', () => {
    before(navigateToGroupPositionsTab)

    before(() => {
      changeFirstRowPosition()
      cy.get('[data-test=juralio-dialog]', { timeout: 10000 }).should('exist')
      cy.get('[data-test=cancel-dialog-button]').click()
    })

    it('should close the dialog without changes', () => {
      cy.get('[data-test=juralio-dialog]').should('not.exist')
    })

    it('should still show the rows in the table', () => {
      cy.get('.MuiDataGrid-row').should('have.length.at.least', 1)
    })
  })

  describe('when deleting an external group', () => {
    let rowCountBefore, peopleCountBefore

    before(() => {
      cy.login(matterAdmin.username)
      visitHelpers.visitMatter(matter.id)
      cy.get('[data-test=matter-people]', { timeout: 30000 }).click()
      cy.get('[data-test=user-list-item]', { timeout: 10000 }).then(rows => {
        peopleCountBefore = rows.length
      })

      cy.contains('Group positions', { timeout: 10000 }).click()
      cy.wait(2000)
      cy.get('.MuiDataGrid-row').then(rows => {
        rowCountBefore = rows.length
      })

      cy.get('.MuiDataGrid-cell[data-field=delete] button:not([disabled])')
        .first()
        .click()
    })

    it('should show the delete confirmation dialog', () => {
      cy.get('[data-test=dialog-prompt-text]', { timeout: 10000 }).should(
        'exist'
      )
    })

    describe('when confirming the delete', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(2000)
      })

      it('should close the confirmation dialog', () => {
        cy.get('[data-test=dialog-prompt-text]').should('not.exist')
      })

      it('should remove the group row from the table immediately', () => {
        cy.get('.MuiDataGrid-row').should(
          'have.length.lessThan',
          rowCountBefore
        )
      })

      it('should remove the external group users from the people table', () => {
        cy.contains('People', { timeout: 10000 }).first().click()
        cy.wait(2000)
        cy.get('[data-test=user-list-item]').should(
          'have.length.lessThan',
          peopleCountBefore
        )
      })
    })
  })
})
