import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  createProjectionPeriod,
  setupMatterRates,
  setupOrgLevelCosts,
} from '../../../../../helpers/costs/costs_helper'

import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  enableCosts,
  enableOrgCosts,
} from '../../../../../helpers/admin/admin_api_helpers'
import {
  addMatterAdmin,
  addMatterCosts,
  addTeamMember,
  createAdvisorMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../../helpers/matterprojects/task_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Test setting up matter pricing for a matter with multiple pricing segments then deleing one 

Test flow:  Pre setup of costs till matter pricing then user fills out area form with 2 segments then deletes one  


Date created: 3/03/25
*/

describe('delete_matter_pricing.cy', () => {
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false
  })
  let orgAdminUser, matterCreatorUser
  let org, projectionPeriod, grades, rateTypes, rtd, matter, task, snapshot
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
              createTask(m.id, project.id, 'not-started', 'T2')
              createTask(m.id, project.id, 'not-started', 'T1').then(t => {
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

    it('should allow the user to add a second pricing type', () => {
      cy.get('[data-test=new-pricing-segment]').click()
      cy.get('[data-test=new-pricing-segment]').should('exist')
      cy.get('[data-test=assign-phases]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').should('be.disabled')
      cy.get('[data-test=assign-phase-checkbox]').eq(0).click()
      cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should be able to confirm the pricing area and move onto next page', () => {
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=resource-title]').should(
        'contain.text',
        'How do you expect time to be split between different grades? '
      )
    })

    it('should be able to go back to pricing and move the phases to another task', () => {
      cy.get('[data-test=pricing-div]').click()
      cy.get('[data-test=delete-segment]').eq(0).should('be.disabled')
      cy.get('[data-test=delete-segment]').eq(1).should('be.disabled')
      cy.get('[data-test=assign-phases]').eq(0).click()
      cy.get('[data-test=assign-phase-checkbox]').eq(1).click()
      cy.get('[data-test=action-dialog-button]').should('not.be.disabled')
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should be able to delete the extra pricing type', () => {
      cy.wait(1000)
      cy.get('[data-test=delete-segment]').eq(1).should('not.be.disabled')
      cy.get('[data-test=delete-segment]').eq(1).click()
      cy.get('[data-test=pricing-segment]').eq(1).should('not.exist')
    })
  })
})
