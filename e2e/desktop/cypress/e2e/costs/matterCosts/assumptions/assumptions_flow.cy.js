import { createUser } from '../../../../../../helpers/users/user_api_helper'
import {
  createProjectionPeriod,
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
Purpose: Test creating, editing, changing the status of and deleting assumptions

Test flow:  Pre setup of costs then run through assumptions add flow add 10 then edit the first, change its status via the chip dropdown then delete it


Date created: 26/01/26
*/

describe('assumptions_flow.cy', () => {
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
        for (let index = 0; index < 10; index++) {
          cy.get('[data-test=assumption-name]').eq(index).type(index)
          cy.get('[data-test=assumption-description]').eq(index).type(index)
          if (index < 9) {
            cy.get('[data-test=add-another]').click()
          }
        }
        cy.get('[data-test=add-another]').should('not.exist')
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

    describe('using the assumptions flow to edit an assumption', () => {
      before(() => {
        cy.get('[data-test=assumptions-header]', { timeout: 30000 }).should(
          'contain.text',
          'Assumptions'
        )
        cy.wait(2000)
        cy.get('[data-test=draggable-assumption]')
          .eq(0)
          .find('.MuiButtonBase-root')
          .first()
          .should('be.visible')
          .click()
        cy.get('[data-test=assumption-name]', { timeout: 30000 }).should(
          'have.length.gte',
          1
        )
      })
      it('should change the name and description of a assumption ', () => {
        cy.get('[data-test=assumption-name]').eq(0).type('test')
        cy.get('[data-test=assumption-description]').eq(0).type('test')
        cy.get('[data-test=save-button]').click()
        cy.get('[data-test=draggable-assumption]')
          .eq(0)
          .should('contain.text', 'test')
      })
    })

    describe('using the status chip to change an assumption status', () => {
      before(() => {
        cy.get('[data-test=assumptions-header]', { timeout: 30000 }).should(
          'contain.text',
          'Assumptions'
        )
        cy.wait(2000)
        cy.get('[data-test=assumption-status-chip]', { timeout: 30000 }).should(
          'have.length.gte',
          1
        )
      })

      it('should default assumptions to the On target status', () => {
        cy.get('[data-test=assumption-status-chip]')
          .eq(0)
          .should('contain.text', 'On target')
      })

      it('should change an assumption status via the chip dropdown', () => {
        cy.intercept('PATCH', '**/costs/assumption/**/bulk').as('updateStatus')
        cy.get('[data-test=assumption-status-chip]').eq(0).click()
        cy.get('[data-test=assumption-status-option-at-risk]')
          .should('be.visible')
          .click()
        cy.wait('@updateStatus').then(({ request }) => {
          expect(request.body[0]).to.have.property('status', 'at-risk')
        })
        cy.get('[data-test=assumption-status-chip]')
          .eq(0)
          .should('contain.text', 'At risk')
      })
    })

    describe('using the assumptions flow to delete an assumption', () => {
      before(() => {
        cy.get('[data-test=assumptions-header]', { timeout: 30000 }).should(
          'contain.text',
          'Assumptions'
        )
        cy.wait(2000)
        cy.get('[data-test=draggable-assumption]')
          .eq(0)
          .find('.MuiButtonBase-root')
          .first()
          .should('be.visible')
          .click()
        cy.get('[data-test=delete-assumption]', { timeout: 30000 }).should(
          'have.length.gte',
          1
        )
      })
      it('should allow for the user to delete a assumption ', () => {
        cy.get('[data-test=delete-assumption]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=add-another]').should('exist')
        cy.get('[data-test=save-button]').click()
        cy.get('[data-test=draggable-assumption]').should('have.length', 9)
      })
    })
  })
})
