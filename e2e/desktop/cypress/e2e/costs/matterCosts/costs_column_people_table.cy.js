import {
  enableCosts,
  enableOrgCosts,
} from '../../../../../helpers/admin/admin_api_helpers'
import { setupOrgLevelCosts } from '../../../../../helpers/costs/costs_helper'
import {
  addTeamMember,
  createAdvisorMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Tests that the costs column in the matter people table is shown or
         hidden based on whether the org has completed costs setup for the
         current user's position (Advisor or Client) on the matter.

Test flow:
  1. No costs setup → column hidden
  2. Advisor costs complete, user is Advisor → column visible
  3. Client costs complete, user flipped to Client → column visible


Date created: 17/04/26
*/

describe('costs_column_people_table.cy', () => {
  let org, orgAdminUser, teamMember, matter
  const openPeopleTab = () => {
    cy.login(orgAdminUser.username)
    visitHelpers.visitMatter(matter.id)
    cy.get('[data-test=matter-people]', { timeout: 30000 }).click()
    cy.wait(2000)
  }

  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
        updateFTUE(orgAdminUser, { hasSeenMatterAdmin: true })
        createUser('', true, false).then(u => {
          teamMember = u
          sysadminAddUserToOrganisation(org, teamMember)
        })
        enableCosts().then(() => {
          enableOrgCosts(org.id).then(() => {
            createAdvisorMatter('costs-col', orgAdminUser.username).then(m => {
              matter = m
              addTeamMember(m.id, teamMember.id, orgAdminUser.username)
            })
          })
        })
      })
    })
  })

  describe("when costs setup is NOT complete for the user's position", () => {
    before(openPeopleTab)

    it('should not show the costs column in the people table', () => {
      cy.get('[data-test="is-costs"]').should('not.exist')
    })
  })

  describe('when Advisor costs setup is complete and the user is Advisor on the matter', () => {
    before(() => {
      setupOrgLevelCosts(orgAdminUser, org)
      openPeopleTab()
    })

    it('should show the costs column in the people table', () => {
      cy.get('[data-test="is-costs"]').should('exist')
    })
  })

  describe('when Client costs setup is complete and the user is Client on the matter', () => {
    before(() => {
      setupOrgLevelCosts(orgAdminUser, org, { positionName: 'Client' })
      cy.login(orgAdminUser.username)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}`,
        method: 'GET',
      })
        .its('body')
        .then(m => {
          const internalGroup = m.positionsOfGroups.find(
            p => p.group.isInternal
          )
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
            method: 'GET',
          })
            .its('body')
            .then(positions => {
              const clientPosition = positions.find(p => p.name === 'Client')
              cy.request({
                url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/matterGroupPosition`,
                method: 'PATCH',
                body: {
                  groupId: internalGroup.group.id,
                  positionId: clientPosition.id,
                },
              })
            })
        })

      openPeopleTab()
    })

    it('should show the costs column in the people table', () => {
      cy.get('[data-test="is-costs"]').should('exist')
    })
  })
})
