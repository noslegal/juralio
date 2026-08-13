import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { getGlobalNotification } from '../../../../../helpers/notifications/global-notification-helper'
import globalNotificationsPage from '../../../../../page/notifications/global_notifications_page'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

const LABEL_NAME = 'DELETED'

describe('oa_organisation_label_deletion_notification.cy', () => {
  let orgAdminUser
  let matterAdminUser
  let fixture
  let visitHelper = new VisitHelpers()
  let matterId, projectId
  let task1, task2, label

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
    setupOrganisationWithMatter(
      true,
      [{}],
      [
        {
          name: 'DELETED_2nd_project',
          tasks: [{}],
        },
      ]
    ).then(result => {
      fixture = result.fixture
      orgAdminUser = result.orgAdminUser
      matterAdminUser = result.orgMC
      matterId = fixture.matter.id
      projectId = fixture.projects[0].id

      matter2Id = fixture.projects[1].matter.id
      project2Id = fixture.projects[1].id

      task1 = fixture.tasks[0]
      task2 = fixture.tasks[1]

      cy.login(orgAdminUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {
          name: LABEL_NAME,
          type: 'risk',
        },
      }).then(response => {
        label = response.body
        cy.login(matterAdminUser.username)
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/matter/${matterId}/workstreams/${projectId}/task/${
            task1.id
          }/labels`,
          method: 'POST',
          body: {
            labelId: label.id,
            modifier: 'red',
          },
        }).then(response => {
          cy.login(matterAdminUser.username)
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/matter/${matter2Id}/workstreams/${project2Id}/task/${
              task2.id
            }/labels`,
            method: 'POST',
            body: {
              labelId: label.id,
              modifier: 'green',
            },
          })
        })
      })
    })
  })

  describe('when visiting the tasks with the label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitTaskDetails(matterId, projectId, task1.id)
    })

    it('should show the label', () => {
      cy.get('[data-test=label-chip-text]').should('have.text', LABEL_NAME)
    })

    describe('when visiting the tasks with the label', () => {
      before(() => {
        cy.login(orgAdminUser)
        visitHelper.visitTaskDetails(matter2Id, project2Id, task2.id)
      })

      it('should show the label', () => {
        cy.get('[data-test=label-chip-text]').should('have.text', LABEL_NAME)
      })
    })
  })

  describe('when deleting the org label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitOrgLabels()
      labelsPage.get.deleteLabelButton().eq(0).click()
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should close the dialog and delete the org label', () => {
      cy.get('[data-test=dialog-prompt-text]').should('not.exist')

      labelsPage.get.listRisksBespoke().should('have.length', 0)
    })
  })

  describe('when visiting the tasks with the label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitTaskDetails(matterId, projectId, task1.id)
    })

    it('should show the label', () => {
      cy.get('[data-test=label-chip-text]').should('have.text', LABEL_NAME)
    })

    describe('when visiting the tasks with the label', () => {
      before(() => {
        cy.login(orgAdminUser)
        visitHelper.visitTaskDetails(matter2Id, project2Id, task2.id)
      })

      it('should show the label', () => {
        cy.get('[data-test=label-chip-text]').should('have.text', LABEL_NAME)
      })
    })
  })

  // PBI-10: label delete notifications were dropped in the move off the old
  // InboxNotification path and are not yet reimplemented on the MatterEvent path.
  // Re-enable once that work lands.
  describe.skip('when open the notifications box', () => {
    before(() => {
      globalNotificationsPage.get.notificationButton().click()
    })

    it('should have "Label deletion" notification', () => {
      getGlobalNotification(0)
        .find(globalNotificationsPage.selectors.NOTIFICATION_TITLE)
        .should('have.text', 'Label deleted')

      getGlobalNotification(0)
        .find(globalNotificationsPage.selectors.NOTIFICATION_BODY)
        .should(
          'have.text',
          'Organisation-level label "DELETED" has been deleted. It will remain applied to existing tasks in your matters, but cannot be added to more tasks.'
        )
    })
  })
})
