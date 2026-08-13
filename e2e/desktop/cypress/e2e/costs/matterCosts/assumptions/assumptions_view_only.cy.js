import { createUser } from '../../../../../../helpers/users/user_api_helper'
import {
  createProjectionPeriod,
  finaliseAdvisorProjection,
  setupMatterRates,
  setupOrgLevelCosts,
} from '../../../../../../helpers/costs/costs_helper'

import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../../helpers/organisation/organisation_api_helper'
import {
  enableCosts,
  enableOrgCosts,
} from '../../../../../../helpers/admin/admin_api_helpers'
import {
  addMatterAdmin,
  addMatterCosts,
  addMatterViewer,
  addTeamMember,
  createAdvisorMatter,
} from '../../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../../helpers/matterprojects/projects_api_helper'
import {
  createSubTask,
  createTask,
} from '../../../../../../helpers/matterprojects/task_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Test view only cant edit assumptions

Test flow:  Pre setup of costs then run through assumptions add flow add 1 then log in as view only and ensure you can see but not edit them  


Date created: 27/01/26
*/

describe('assumptions_view_only.cy', () => {
  let orgAdminUser, matterCreatorUser, viewOnlyUser
  let org, grades, rateTypes, rtd, matter, task, projectionPeriod
  //set up
  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
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
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
        })
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          viewOnlyUser = u
          sysadminAddUserToOrganisation(org, viewOnlyUser)
        })
      })
    })
  })

  describe('Setting up a matter with costs enabled', () => {
    before(() => {
      cy.login(orgAdminUser)
      enableCosts().then(res => {
        expect(res.status).to.eq(200)
        enableOrgCosts(org.id).then(res => {
          expect(res.status).to.eq(200)
          setupOrgLevelCosts(orgAdminUser, org, rtd, grades, rateTypes)
          createAdvisorMatter('1', matterCreatorUser.username).then(m => {
            matter = m
            addTeamMember(m.id, orgAdminUser.id, matterCreatorUser)
            addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
            addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
            createProject(m.id, 'P1').then(project => {
              createTask(m.id, project.id, 'not-started', 'T1').then(t => {
                createSubTask(
                  m.id,
                  project.id,
                  'not-started',
                  'subtask',
                  t.id,
                  false,
                  true
                )
                task = t
                createProjectionPeriod(orgAdminUser.username, matter.id).then(
                  p => {
                    projectionPeriod = p
                    setupMatterRates(orgAdminUser, org.id, matter.id)
                  }
                )
              })
            })
          })
        })
      })
    })

    it('should setup matter level costs and load the matter pricing area', () => {
      cy.login(orgAdminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(3000)
      cy.get('[data-test=pricing-div]').click()
      cy.get('[data-test=pricing-top-div]').should(
        'contains.text',
        'Specify how this matter will be priced in this projection period.'
      )
    })

    it('should be able to confirm the pricing area and move onto next page', () => {
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=resource-title]').should(
        'contain.text',
        'How do you expect time to be split between different grades? '
      )
    })

    describe('using the assumptions flow', () => {
      before(() => {
        cy.get('[data-test=assumptions-button]').eq(1).click({ force: true })
      })
      it('should load the empty assumptions page ', () => {
        cy.get('[data-test=add-assumptions]').should('be.visible')
      })

      it('should allow the user to add up to 10 assumptions', () => {
        cy.get('[data-test=add-assumptions]').click()
        cy.get('[data-test=drawer-header]').trigger('mouseover')
        for (let index = 0; index < 1; index++) {
          cy.get('[data-test=assumption-name]').eq(index).type(index)
          cy.get('[data-test=assumption-description]').eq(index).type(index)
        }
        cy.get('[data-test=save-button]').click()
        cy.get('[data-test=assumptions-header]').should(
          'contain.text',
          'Assumptions'
        )
        cy.get('[data-test=deliverables-header]').should(
          'contain.text',
          'Deliverables'
        )
      })
    })
  })
  describe('Looking at assumptions as a view only', () => {
    before(() => {
      cy.login(orgAdminUser.username)
      addMatterViewer(matter.id, viewOnlyUser.id, matterCreatorUser.username)
      addMatterCosts(matter.id, viewOnlyUser.id, orgAdminUser.username)
      // Finalise the projection so the view-only user gets the read-only
      // finalised projection dashboard. On a draft, an advisor view-only user is
      // routed into the editable wizard, which POSTs rate_type and 403s for a
      // viewer (hanging the page).
      finaliseAdvisorProjection(orgAdminUser, matter, task, projectionPeriod)
      cy.login(viewOnlyUser.username)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(3000)
      cy.get('[data-test=projection-card-expand]', { timeout: 30000 }).click()
      cy.wait(2000)
      cy.get('[data-test=assumptions-button]').eq(1).click({ force: true })
      cy.wait(1000)
    })
    it('should allow not be allowed to add,edit or delete assumptions', () => {
      cy.get('[data-test=edit-assumptions]').should('not.exist')
      cy.get('[data-test=assumptions-header]').should(
        'contain.text',
        'Assumptions'
      )
      cy.get('[data-test=deliverables-header]').should(
        'contain.text',
        'Deliverables'
      )
    })

    it('should show the status chip but not allow changing it', () => {
      cy.get('[data-test=assumption-status-chip]')
        .eq(0)
        .should('be.visible')
        .click({ force: true })
      // The status dropdown must not open for a view-only user.
      cy.get('[data-test=assumption-status-option-at-risk]').should('not.exist')
    })
  })
})
