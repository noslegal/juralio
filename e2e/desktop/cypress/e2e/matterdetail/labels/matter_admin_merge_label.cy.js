import { addHashtagToTask } from '../../../../../helpers/labels/add-label-to-task'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_merge_label.cy', () => {
  let organisation, orgAdminUser, orgMC
  let fixture, appPage

  before(() => {
    setupOrganisationWithMatter(true, [
      { name: 'task 1', tasks: [{ name: 'task 3' }] },
      { name: 'task 2' },
    ]).then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
    })
  })

  describe('when a user (both a matter editor & matter admin) visits a task and adds labels', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitTaskByName('task 1')

      addHashtagToTask('Ahashtag')
      addHashtagToTask('Bhashtag')
      cy.wait(1000)
      appPage.visitTaskByName('task 2')
      addHashtagToTask('Bhashtag')
      addHashtagToTask('Chashtag')
      addHashtagToTask('Dhashtag')
      addHashtagToTask('Ehashtag')
      appPage.visitMatter()

      labelsPage.get.labelsPanelItem().click()
      cy.wait(1000)
      labelsPage.get.userDefinedTab().click()
    })
    it('should show the correct usages', () => {
      cy.get('[data-test=label-chip]').should('have.length', 5)
      cy.get('[data-test=label-chip]')
        .eq(0)
        .find('[data-test=label-chip-text]')
        .should('have.text', '#Bhashtag')
      cy.get('[data-test=label-usage-count-link]')
        .eq(0)
        .should('have.text', 'Used in 2 tasks')

      cy.get('[data-test=label-chip]')
        .eq(1)
        .find('[data-test=label-chip-text]')
        .should('have.text', '#Ahashtag')
      cy.get('[data-test=label-usage-count-link]')
        .eq(1)
        .should('have.text', 'Used in 1 task')

      cy.get('[data-test=label-chip]')
        .eq(2)
        .find('[data-test=label-chip-text]')
        .should('have.text', '#Chashtag')
      cy.get('[data-test=label-usage-count-link]')
        .eq(2)
        .should('have.text', 'Used in 1 task')
    })
    describe('when mergin two labels', () => {
      before(() => {
        cy.get('[data-test=merge-hashtags]').click()
        cy.get('[data-test=merge-label-1]').click()
        cy.get('[data-test=merge-label-1]')
          .find('input')
          .type('Ahashtag{downArrow}{enter}')
        cy.get('[data-test=merge-label-2]').click()
        cy.get('[data-test=merge-label-2]')
          .find('input')
          .type('Chashtag{downArrow}{enter}')
      })
      it('should enable the action button and show the picker', () => {
        cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
        cy.get('[data-test=label-select]').should('exist')
      })
      describe('when confirming the merge', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(5000)
        })
        it('should update the list', () => {
          cy.get('[data-test=label-chip]').should('have.length', 4)
          cy.get('[data-test=label-chip]')
            .eq(0)
            .find('[data-test=label-chip-text]')
            .should('have.text', '#Ahashtag')
          cy.get('[data-test=label-usage-count-link]')
            .eq(0)
            .should('have.text', 'Used in 2 tasks')

          cy.get('[data-test=label-chip]')
            .eq(1)
            .find('[data-test=label-chip-text]')
            .should('have.text', '#Bhashtag')
          cy.get('[data-test=label-usage-count-link]')
            .eq(1)
            .should('have.text', 'Used in 2 tasks')
        })
        describe('when trying to merge two deleted labels', () => {
          before(() => {
            cy.get('[data-test=delete-label-button]').eq(2).click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=delete-label-button]').eq(2).click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=merge-hashtags]').click()
            cy.get('[data-test=merge-label-1]').click()
            cy.get('[data-test=merge-label-1]')
              .find('input')
              .type('Dhashtag{downArrow}{enter}')
            cy.get('[data-test=merge-label-2]').click()
            cy.get('[data-test=merge-label-2]')
              .find('input')
              .type('Ehashtag{downArrow}{enter}')
          })
          it('should not allow this', () => {
            cy.get('[data-test=merge-error-text]').should('be.visible')
            cy.get('[data-test=action-dialog-button]').should('be.disabled')
          })
          describe('when merging a deleted hashtag and a regular one', () => {
            before(() => {
              cy.get('[data-test=merge-label-2]').click()
              cy.get('[data-test=merge-label-2]')
                .find('input')
                .clear()
                .type('Bhashtag{downArrow}{enter}')
            })
            it('should not allow this', () => {
              cy.get('[data-test=merge-error-text]').should('not.exist')
              cy.get('[data-test=action-dialog-button]').should(
                'not.be.disabled'
              )
            })
          })
        })
      })
    })
  })
})
