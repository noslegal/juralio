import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import {
  clickAddLabelBtn,
  testAddNewCustomLabel,
} from '../../../../../helpers/labels/test-custom-label-helper'
import { addMatterAdmin } from '../../../../../helpers/matterprojects/matter_api_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import labelsPage from '../../../../../page/organisation/organisation_labels_page'

describe('matter_admin_user_defined_label.cy', () => {
  let organisation, matteradmin, orgMC, orgAdminUser
  before(() => {
    setupOrganisationWithMatter().then(result => {
      organisation = result.organisationLabels.body
      orgAdminUser = result.orgAdminUser
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
      createUser('', true, false).then(user => {
        matteradmin = user

        cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
          sysadminAddUserToOrganisation(organisation, matteradmin).then(() => {
            addMatterAdmin(fixture.matter.id, matteradmin.id, orgMC.username)
          })
        })
      })
    })
  })
  describe('as a matter admin', () => {
    before(() => {
      updateFTUE(orgMC, { hasSeenMatterAdmin: true })
      cy.login(orgMC)
      appPage.visitMatter()
      cy.wait(2000)
      labelsPage.get.labelsPanelItem().click()
      cy.wait(1000)
      labelsPage.get.userDefinedTab().click()
    })
    it('should be able to view user defined labels', () => {
      cy.get('[data-test=list-userDefined]').children().should('have.length', 2)
    })
    describe('when adding a label', () => {
      before(() => {
        clickAddLabelBtn('userDefined')
      })
      testAddNewCustomLabel('userDefined', 'label name', 1)
      describe('when updating a label', () => {
        before(() => {
          cy.get('[data-test=edit-label-button]').click()
          cy.get('[data-test=label-text-field]').find('input').type('test')
          cy.get('[data-test=label-text-field-save-button]').click()
        })
        it('should update the text', () => {
          cy.get('[data-test=label-chip-text]')
            .eq(0)
            .should('contain.text', 'test')
        })
        describe('when deleting a label', () => {
          before(() => {
            labelsPage.get.deleteLabelButton().click()
            cy.get('[data-test=action-dialog-button]').click()
          })
          it('shouldremove the label', () => {
            cy.get('[data-test=list-userDefined]')
              .children()
              .should('have.length', 2)
          })
        })
      })
    })
  })
})
