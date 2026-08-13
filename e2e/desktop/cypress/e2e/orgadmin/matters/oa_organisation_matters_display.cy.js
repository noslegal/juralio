import {
  addTeamMember,
  createMatter
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { openSelector } from '../../../../../helpers/navigation/project-selector-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_matters_display.cy', () => {
  let standardMatter, standardUser

  const navigateToOrgMatters = () => {
    cy.login(standardUser.username)
    visitHelpers.visitOrgMatters()
  }

  before(() => {
    createUser().then(user => {
      standardUser = user
      createMatter().then(matter => {
        standardMatter = matter
        addTeamMember(matter.id, user.id)
      })
      createMatter()
    })
  })

  describe('when go to matters page', () => {
    before(() => {
      navigateToOrgMatters()
    })

    it('should display a matters tab', () => {
      cy.get('[data-test=matters-tab]', { timeout: 10000 }).should('contain', 'Matters')
    })
    it('should display a deleted matters tab', () => {
      cy.get('[data-test=deleted-matters-tab]').should(
        'contain',
        'Deleted matters'
      )
    })
    it('should display a table title', () => {
      cy.get('[data-test=matters-table-title]').should('contain', 'Matters')
    })
    it('should display a matter/ client header', () => {
      cy.get('[role="columnheader"][data-field="matter"]').should('contain', 'Matter / Client')
    })
    it('should display a projects header', () => {
      cy.get('[role="columnheader"][data-field="numProjects"]').should('contain', 'Workstream')
    })
    it('should display a people header', () => {
      cy.get('[role="columnheader"][data-field="people"]').should('contain', 'People')
    })
    it('should display a status header', () => {
      cy.get('[role="columnheader"][data-field="status"]').should('contain', 'Status')
    })
    it('should display a delete header', () => {
      cy.get('[role="columnheader"][data-field="delete"]').should('contain', 'Delete')
    })
    it('should display a row', () => {
      cy.get('[data-rowindex=0]').should('exist')
      cy.get('[data-rowindex=1]').should('exist')
    })
  })

  describe('when you open the matter switcher', () => {
    before(() => {
      openSelector()
    })
    it('should display your matters', () => {
      cy.get('[data-test=matter-switcher-matter-list]').should(
        'have.length',
        '1'
      )
    })
    describe('when looking back at the org matters table', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-mask]').click()
      })
      it('should not have updated', () => {
        cy.get('[data-rowindex=0]').should('exist')
        cy.get('[data-rowindex=1]').should('exist')
      })
    })

    describe('when viewing the deleted matters table', () => {
      before(() => {
        navigateToOrgMatters()
        cy.get('[data-test=deleted-matters-tab]', { timeout: 10000 }).click()
      })
      it('should display a table title', () => {
        cy.get('[data-test=deleted-matters-table-title]').should('contain', 'Deleted matters')
      })      
      it('should display a table subheader', () => {
        cy.get('[data-test=deleted-matters-table-subheader]').should('contain', 'Deleted matters can be restored within 30 days of deletion. After that, they are automatically deleted and cannot be restored.')
      })
      it('should display a matter/ client header', () => {
        cy.get('[role="columnheader"][data-field="matter"]').should('contain', 'Matter / Client')
      })
      it('should display a deleted by header', () => {
        cy.get('[role="columnheader"][data-field="deletedBy"]').should('contain', 'Deleted By')
      })
      it('should display a deleted on header', () => {
        cy.get('[role="columnheader"][data-field="deletedOn"]').should('contain', 'Deleted On')
      })
      it('should display a status header', () => {
        cy.get('[role="columnheader"][data-field="status"]').should('contain', 'Status')
      })
    })
  })
})
