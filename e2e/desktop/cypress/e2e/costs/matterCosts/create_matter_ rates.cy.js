import { enableCosts, enableOrgCosts } from '../../../../../helpers/admin/admin_api_helpers'
import { setupOrgLevelCosts } from '../../../../../helpers/costs/costs_helper'
import { addMatterAdmin, addMatterCosts, addTeamMember, createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Test setting up matter rates for a matter 

Test flow:  Pre setup of costs till matter rates then user fills out area forms 


Date created: 25/04/25
*/

describe('create_matter_rates.cy', () => {
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
          createMatter('1', matterCreatorUser.username).then(m => {
            matter = m
            addTeamMember(m.id, orgAdminUser.id, matterCreatorUser)
            addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
            addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
            createProject(m.id, 'P1').then(project => {
              createTask(m.id, project.id, 'not-started', 'T1').then(t => {
                task = t
              })
            })
          })
        })
      })
    })

    it('should setup org level costs and load the matter costs area', () => {
      cy.login(orgAdminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(3000)
      cy.get('[data-test=get-started]').should('exist')
      cy.get('.MuiTypography-h2').should(
        'contains.text',
        'Make a financial plan for this matter'
      )
    })

    it('should show the list of available rateTableDetails with continue button disabled', () => {
      cy.get('[data-test=get-started]').click()
      cy.wait(100)
      cy.get('[data-test=continue]').should('be.disabled')
    })

    it('should allow the user to select a rate card and continue', ()=> {
      cy.get('.PrivateSwitchBase-input').click()
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=matter-rates-table]').should('exist')
    })

    it('should allow the user to go back to change the selected rate card', () => {
      cy.get('[data-test=change-reference]').click()
      cy.get('[data-test=continue]').should('be.disabled')
    })
    it('should allow the creation of a matter rate table with manual rates',()=>{
      cy.get('.PrivateSwitchBase-input').click()
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=matter-rates-table]').should('exist')
      cy.wait(2000)
      cy.get('[data-test=rate-manual-values]').click()
      cy.get('.dvn-scroller').click(900, 75, { force: true })
      for (let index = 0; index < 21; index++) {
        cy.get('body').type('500')
        cy.get('body').type('{enter}')
      }
      cy.get('[data-test=continue]').click()
      cy.intercept('*/rates/bulk').as('saveRates')
      cy.intercept(
        { method: 'GET', url: '*/rates/*/matter/*/false' }
      ).as('getTable')
      cy.wait('@saveRates').its('response.statusCode').should('eq', 200)
      cy.wait('@getTable').should(({ request, response }) => {
        expect(request.method).to.equal('GET')
        expect(response.statusCode).to.eq(200)
        response.body.forEach((item) => {
          expect(item.rate).to.eq(500)
        })
      })
      cy.get('[data-test=get-started]').should('exist')
    })
    it('should allow the user to view the rates after continuing by opening the rate modal',()=>{
      cy.get('[data-test=get-started]').click()
      cy.wait(3000)
      cy.get('[data-test=show-rates-modal]').should('exist')
      cy.get('[data-test=show-rates-modal]').eq(1).click()
      cy.get('[data-test=matter-rates-table]').should('exist')
    })
    it('should allow the user to edit rates',()=>{
      cy.get('[data-test=edit-rates]').click()
      cy.get('.dvn-scroller').click(900, 75, { force: true })
      cy.get('body').type('600')
      cy.get('[data-test=edit-rates]').click()
      cy.intercept(
        { method: 'GET', url: '*/rates/*/matter/*/false' }
      ).as('getTable')
      cy.wait('@getTable').should(({ request, response }) => {
        expect(request.method).to.equal('GET')
        expect(response.statusCode).to.eq(200)
        expect(response.body[0].rate).to.eq(600)
      })
    })
    it('should allow the user to replace the rate table with premium rates',()=>{
      cy.get('[data-test=show-rates-modal]').should('exist')
      cy.get('[data-test=show-rates-modal]').eq(1).click()
      cy.get('[data-test=matter-rates-table]').should('exist')
      cy.get('[data-test="replace-rates"]').click()
      cy.get('.PrivateSwitchBase-input').click()
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=matter-rates-table]').should('exist')
      cy.wait(2000)
      cy.get('[data-test="costs-filter-button"]').click()
      cy.get('[data-test="costs-filter-premium"]').click()
      cy.get('.MuiInputBase-root').type('50')
      cy.get('[data-test="continue"]').click()
      cy.intercept('*/rates/bulk').as('saveRates')
      cy.intercept(
        { method: 'GET', url: '*/rates/*/matter/*/false' }
      ).as('getTable')
      cy.wait('@saveRates').its('response.statusCode').should('eq', 200)
      cy.wait('@getTable').should(({ request, response }) => {
        expect(request.method).to.equal('GET')
        expect(response.statusCode).to.eq(200)
        response.body.forEach((item) => {
          expect(item.rate).to.eq(150)
        })
      })
    })
    it('should allow the user to replace the rate table with discounted rates',()=>{
      cy.get('[data-test=show-rates-modal]').should('exist')
      cy.get('[data-test=show-rates-modal]').eq(1).click()
      cy.get('[data-test=matter-rates-table]').should('exist')
      cy.get('[data-test="replace-rates"]').click()
      cy.get('.PrivateSwitchBase-input').click()
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=matter-rates-table]').should('exist')
      cy.wait(2000)
      cy.get('[data-test="costs-filter-button"]').click()
      cy.get('[data-test="costs-filter-discount"]').click()
      cy.get('.MuiInputBase-root').type('50')
      cy.get('[data-test="continue"]').click()
      cy.intercept('*/rates/bulk').as('saveRates')
      cy.intercept(
        { method: 'GET', url: '*/rates/*/matter/*/false' }
      ).as('getTable')
      cy.wait('@saveRates').its('response.statusCode').should('eq', 200)
      cy.wait('@getTable').should(({ request, response }) => {
        expect(request.method).to.equal('GET')
        expect(response.statusCode).to.eq(200)
        response.body.forEach((item) => {
          expect(item.rate).to.eq(50)
        })
      })
    })
  })
})
