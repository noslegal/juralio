/*
Purpose: Tests the label promotion from Matter level to Organisation Level.

Test flow: Creates and assigns a matter level label, then creates and promotes.


Date created: 19/01/2022
*/
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { createTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { getGlobalNotification } from '../../../../../helpers/notifications/global-notification-helper'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'

const LABEL_NAME = 'PROMOTE'

describe('oa_organisation_label_promote.cy', () => {
  let orgAdminUser
  let matterAdminUser
  let fixture
  let visitHelper = new VisitHelpers()
  let matterId, projectId
  let task, label

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
      },
    })
    setupOrganisationWithMatter().then(result => {
      fixture = result.fixture
      orgAdminUser = result.orgAdminUser
      matterAdminUser = result.orgMC
      matterId = fixture.matter.id
      projectId = fixture.projects[0].id

      createTask(matterId, projectId, 'not-started', 'Task').then(result => {
        task = result
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${matterId}/labels`,
          method: 'POST',
          body: {
            name: LABEL_NAME,
            type: 'risk',
          },
        }).then(response => {
          label = response.body
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/matter/${matterId}/workstreams/${projectId}/task/${
              task.id
            }/labels`,
            method: 'POST',
            body: {
              labelId: label.id,
              modifier: null,
            },
          })
        })
      })
    })
  })

  describe('when visiting the task with a label', () => {
    before(() => {
      updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
      cy.login(orgAdminUser)
      visitHelper.visitTaskDetails(matterId, projectId, task.id)
    })

    it('should show the label', () => {
      cy.get('[data-test=label-chip-text]').should('have.text', 'PROMOTE')
    })
  })

  describe('When adding an existing label to the organisation', () => {
    before(() => {
      cy.login(orgAdminUser.username)
      visitHelper.visitOrgLabels(matterId)
      cy.get('[data-test=add-label-button]').click()

      cy.get('[data-test=label-text-field]').find('input').type(LABEL_NAME)
      cy.get('[data-test=label-text-field-save-button]').click()
    })

    it('should promote the label', () => {
      cy.login(orgAdminUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/organisation/labels?includeHierarchicalLabels=true`,
        method: 'GET',
      }).then(response => {
        expect(
          response.body.find(t => t.name === LABEL_NAME).organisation
        ).to.eq(true)
        expect(response.body.find(t => t.name === LABEL_NAME).matter).to.eq(
          false
        )
      })
    })
  })

  describe('when visiting matters label page', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitMatterLabels(matterId)
    })

    it('should show the label as an organisation label', () => {
      cy.get(
        '[data-test=list-riskorganisation] [data-test=label-chip-text]'
      ).should('have.text', 'PROMOTE')
    })
  })

  describe('when visiting the task with a label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitTaskDetails(matterId, projectId, task.id)
    })

    it('should show the label', () => {
      cy.get('[data-test=label-chip-text]').should('have.text', 'PROMOTE')
    })
  })

  // PBI-10: label promote notifications were dropped in the move off the old
  // InboxNotification path and are not yet reimplemented on the MatterEvent path.
  // Re-enable once that work lands.
  describe.skip('when open the notifications box', () => {
    before(() => {
      globalNotificationsPage.get.notificationButton().click()
    })

    it('should have "Label promotion" notification', () => {
      getGlobalNotification(0)
        .find(globalNotificationsPage.selectors.NOTIFICATION_TITLE)
        .should('have.text', 'Label promotion')

      getGlobalNotification(0)
        .find(globalNotificationsPage.selectors.NOTIFICATION_BODY)
        .should(
          'have.text',
          'Matter-level label "PROMOTE" has been replaced in your matters with a new organisation-level label of the same name.'
        )
    })
  })
})
