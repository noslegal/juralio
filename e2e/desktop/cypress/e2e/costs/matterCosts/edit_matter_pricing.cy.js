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
Purpose: Test editing matter pricing for a matter 

Test flow:  Pre setup of costs till matter pricing is completed then user fills out area forms to edit the pricing type to switch to none 


Date created: 24/02/25
*/

describe('edit_matter_pricing.cy', () => {
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
      //cy.login('sysadmin@juralio.com', 'Password1Password1$')

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

    it('should be able to edit the pricing segment', () => {
      cy.get('[data-test=pricing-div]').click()
      cy.get('[data-test=segment-name]').should(
        'contain.text',
        'Time based pricing'
      )
      cy.get('[data-test=edit-segment]').click()
      cy.get('[data-test=value-option]').should('exist')
    })

    it('should be able to switch to another form of pricing', () => {
      cy.get('[data-test=none-option]').click()
      cy.get('[data-test=none-pricing-form]').should(
        'contain.text',
        'Internal work for our organisation'
      )
      cy.get('[data-test=save-pricing]').click()
      cy.get('[data-test=segment-name]').should(
        'contain.text',
        'No fee pricing'
      )
    })
  })
})
