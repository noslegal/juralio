import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { addMatterAdmin } from '../../../../../helpers/matterprojects/matter_api_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const createLabel = (name, type) =>
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/matter/${fixture.matter.id}/labels`,
    method: 'POST',
    body: {
      name: name,
      type: type,
    },
  })

describe('create_labels_limit.cy', () => {
  let organisation, matteradmin
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
    it('should allow me to create matter level labels', () => {
      cy.login(matteradmin).then(() => {
        for (let i = 0; i < 10; i++) {
          createLabel(`risk${i}`, 'risk').then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
          createLabel(`workflow${i}`, 'workflow').then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        }
      })

      cy.login(orgAdminUser).then(() => {
        for (let i = 0; i < 20; i++) {
          createLabel(`user_defined${i}`, 'user_defined').then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        }
      })
    })

    it('should NOT allow me to create another RISK label', () => {
      cy.login(matteradmin)
      createLabel('risk', 'risk').then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should NOT allow me to create another WORKFLOW label', () => {
      cy.login(matteradmin)
      createLabel('workflow', 'workflow').then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should NOT allow me to create another USER_DEFINED label', () => {
      cy.login(orgAdminUser)
      createLabel('user_defined', 'user_defined').then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
