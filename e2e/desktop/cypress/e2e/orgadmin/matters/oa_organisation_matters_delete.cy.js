import {
  addMatterAdmin,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'

const visitHelpers = new VisitHelpers()

const getMatterRowByOrgName = (matterName, isDeleted, returnItem = true) => {
  if (!isDeleted) {
    cy.backendRoute('GET', '/matters?**').as('mattersList')
  }
  cy.get('[data-test=search-button]').click()
  cy.wait(1000)
  cy.get('[data-test=Search]', { timeout: 30000 })
    .clear()
    .type(matterName, { delay: 5 })
  if (!isDeleted) {
    cy.wait('@mattersList')
  }
  if (!returnItem) return
  const selector = isDeleted
    ? '[data-test=deleted-matters-list-item]'
    : '[data-test=matters-list-item]'
  cy.get(selector, { timeout: 10000 }).should('contain', matterName)
  return cy.get(selector)
}

describe('oa_organisation_matters_delete', () => {
  let aMatter, standardUser

  const navigateToOrgMatters = () => {
    cy.login(standardUser.username)
    visitHelpers.visitOrgMatters()
  }
  describe('when deleting a matter from the list', () => {
    before(() => {
      createUser().then(user => {
        standardUser = user
        createMatter().then(matter => {
          aMatter = matter
          addMatterAdmin(matter.id, user.id)
        })
        createMatter().then(() => {
          cy.login(standardUser.username)
          navigateToOrgMatters()
        })
      })
    })
    describe('when clicking the delete button', () => {
      before(() => {
        getMatterRowByOrgName(aMatter.name, false)
        cy.get('[data-test=delete-matter-button]').eq(0).click()
      })
      it('should display a confirmation dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          `Delete ${aMatter.name}`
        )
      })
    })
    describe('when clicking the confirm button and searching for the deleted matter', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should remove the matter from the table', () => {
        cy.get('[data-test=matters-list-item]').should('not.exist')
      })
    })
    describe('when navigating to the deleted matters table', () => {
      before(() => {
        cy.get('[data-test=deleted-matters-tab]').click()
        cy.wait(3000)
        getMatterRowByOrgName(aMatter.name, true)
      })
      it('should contain the deleted matter', () => {
        cy.get('[data-test=deleted-matters-list-item]').should(
          'contain',
          aMatter.name
        )
        cy.get('[data-test=deleted-matters-list-item]').should(
          'contain',
          standardUser.username
        )
        cy.get('[data-test=deleted-matters-list-item]').should(
          'contain',
          new Date().toLocaleDateString()
        )
        cy.get('[data-test=matter-delete-days-left]').should(
          'have.text',
          '29 days left'
        )
        cy.get('[data-test=restore-deleted-matter-button]').should('be.visible')
      })
    })
    describe('when clicking the restore button', () => {
      before(() => {
        cy.wait(3000)
        cy.get('[data-test=restore-deleted-matter-button]').click()
      })
      it('should display a confirmation dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          `Restore ${aMatter.name}`
        )
      })
    })
    describe('when clicking the confirm button and searching for the restored matter', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(3000)
        //getMatterRowByOrgName(aMatter.name, true, false)
      })
      // it('should remove the matter from the table', () => {
      //   cy.get('[data-test=deleted-matters-list-item]').should('not.exist')
      // })
      it('should add it to the matters table', () => {
        cy.get('[data-test=matters-tab]').click()
        getMatterRowByOrgName(aMatter.name, false).should(
          'contain',
          aMatter.name
        )
      })
    })
    describe('when going to the home page and checking the notifications', () => {
      before(() => {
        cy.login(standardUser.username)
        visitHelpers.visitHome()
        globalNotificationsPage.get.notificationButton().click()
      })
      it('should show two unread notifications for the delete and restore', () => {
        globalNotificationsPage.get
          .unreadNotifications()
          .should('contain', `Restored ${aMatter.matterId} ${aMatter.name}`)
        globalNotificationsPage.get
          .unreadNotifications()
          .should('contain', `Deleted ${aMatter.matterId} ${aMatter.name}`)
      })
    })
  })
})
