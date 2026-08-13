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
import {
  createTask,
  createSubTask,
} from '../../../../../helpers/matterprojects/task_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Test setting up costs for a matter then snapshotting the data

Test flow:  Pre setup of costs then run through matter costs flow and snapshot data 


Date created: 4/03/25
*/

describe('create_snapshot.cy', () => {
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
          createAdvisorMatter('1', matterCreatorUser.username).then(m => {
            matter = m
            addTeamMember(m.id, orgAdminUser.id, matterCreatorUser)
            addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
            addMatterCosts(matter.id, orgAdminUser.id, matterCreatorUser)
            createProject(m.id, 'P1').then(project => {
              createTask(m.id, project.id, 'not-started', 'T1').then(t => {
                task = t
                createSubTask(
                  m.id,
                  project.id,
                  'not-started',
                  'deliverable subtask',
                  t.id,
                  false,
                  true
                )
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
      cy.wait(5000)
      cy.get('[data-test=continue]').click()
      cy.get('[data-test=resource-title]').should(
        'contain.text',
        'How do you expect time to be split between different grades? '
      )
    })

    it('should be able to change the ratios on from the grade table', () => {
      cy.get('[data-test=edit-hour-field]').eq(0).find('input').clear().type(40)
      cy.get('[data-test=continue]').should('be.disabled')
      cy.get('[data-test=edit-hour-field]').eq(2).find('input').clear().type(0)
      cy.get('[data-test=continue]').should('contain.text', 'Continue')
      cy.get('[data-test=continue]').click()
      cy.wait(5000)
    })

    it('should be able to review phase dates and continue', () => {
      cy.get('[data-test=resource-title]').should(
        'contain.text',
        'Review phase dates'
      )
      cy.get('[data-test=continue]').click()
      cy.wait(3000)
    })

    it('should be able to set the hours for each task in the matter', () => {
      cy.get('[data-test=phase-hour-field]')
        .eq(0)
        .find('input')
        .clear()
        .type(100)
      cy.get('[data-test=continue]').should('not.be.disabled')
      cy.get('[data-test=continue]').click()
      cy.wait(2000)
    })

    it('should be able to see the resource tables', () => {
      cy.get('[data-test=continue]').should('not.be.disabled')
      cy.get('[data-test=continue]').should(
        'contain.text',
        'Finalise this projection'
      )
      cy.get('[data-test=continue]').click()
      cy.wait(2000)
      cy.get('[data-test=line-chart]').should('exist')
    })
  })

  describe('snapshot task chip counts', () => {
    before(() => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/costs/assumption/${matter.id}`,
        method: 'POST',
        body: {
          taskId: task.id,
          assumption: 'Test assumption',
          summary: 'Test summary',
        },
      })
    })

    it('should show deliverable count on task chip when viewing the snapshot', () => {
      cy.login(orgAdminUser)
      cy.visit(`/#/matter/${matter.id}/costs`)
      cy.wait(2000)
      cy.get('[data-test=projection-card-expand]').click()
      cy.wait(2000)
      cy.get('[data-test=deliverable-assumption-counts]')
        .should('be.visible')
        .and('contain.text', '1')
    })

    it('should show live assumption count when toggling to live mode', () => {
      cy.get('[data-test=live-mode-toggle]').click()
      cy.wait(1500)
      // In live mode both the deliverable (1) and the post-snapshot assumption (1) are visible
      cy.get('[data-test=deliverable-assumption-counts]')
        .should('be.visible')
        .children()
        .should('have.length', 2)
    })

    it('should return to snapshot assumption count when switching back to snapshot mode', () => {
      cy.get('[data-test=live-mode-toggle]').click()
      cy.wait(1500)
      // Snapshot was taken before the assumption was created so only the deliverable badge shows
      cy.get('[data-test=deliverable-assumption-counts]')
        .should('be.visible')
        .children()
        .should('have.length', 1)
    })
  })
})
