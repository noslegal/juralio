import {
  addLabelToTask,
  createOrganisationLabel,
} from '../../../../../helpers/labels/labels_api_helper'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { createTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { updateFTUE } from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

/*
Purpose: Tests the order of organisation labels in matter admin settings is by usage (highest first) then alphabetical

Test flow: Create 4 org labels, (a, b, c, d) and use c once. Should be ordered (c, a, b, d)


Date created: 11/01/22
*/

describe('matter_admin_organisation_labels_order.cy', () => {
  let organisation, orgAdminUser, orgMC
  let fixture, appPage
  const visitHelper = new VisitHelpers()

  before(() => {
    setupOrganisationWithMatter()
      .then(result => {
        organisation = result.organisationLabels
        orgAdminUser = result.orgAdminUser
        updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
        orgMC = result.orgMC
        fixture = result.fixture
        appPage = result.appPage
      })
      .then(() => {
        createOrganisationLabel(orgAdminUser, 'a', 'risk')
        createOrganisationLabel(orgAdminUser, 'b', 'risk')
        createOrganisationLabel(orgAdminUser, 'c', 'risk').then(label =>
          createTask(
            fixture.matter.id,
            fixture.projects[0].id,
            'not-started',
            'task'
          ).then(task => {
            addLabelToTask(
              orgAdminUser,
              fixture.matter.id,
              fixture.projects[0].id,
              task.id,
              label.id
            )
          })
        )
        createOrganisationLabel(orgAdminUser, 'd', 'risk')
      })
      .then(() => {})
  })

  describe('when a matter admin disables an organisation label', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitMatter()
      labelsPage.get.labelsPanelItem().click()
    })

    it('should order the org labels (c, a, b, d)', () => {
      labelsPage.get
        .listRiskOrganisation()
        .find('[data-test=label-chip-text]')
        .should('have.text', 'cabd')
    })
  })
})
