import {
  enableCosts,
  enableOrgCosts,
} from '../../../../helpers/admin/admin_api_helpers'
import { setupOrgLevelCosts } from '../../../../helpers/costs/costs_helper'
import {
  addMatterAdmin,
  addMatterCosts,
  addTeamMember,
  createAdvisorMatter,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../helpers/matterprojects/task_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('period_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser, nonMatterUser
  let org, rtd, matter, grades, rateTypes, period
  // Rate table details are position-scoped (groups-positions work). The costs
  // suite exercises the Advisor flow, so org costs are seeded for Advisor and
  // position-scoped requests (RTD save) must send the Advisor position.
  let advisorPosition
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
        createUser('', true, false, {
          roles: ['ROLE_USER'],
        }).then(u => {
          nonMatterUser = u
          sysadminAddUserToOrganisation(org, nonMatterUser)
        })
        cy.login(orgAdminUser).then(() => {
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
            method: 'GET',
          })
            .its('body')
            .then(positions => {
              advisorPosition = positions.find(p => p.name === 'Advisor')?.id
            })
        })
      })
    })
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`
    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        costsEnabled: true,
      },
    })
  })
  describe('when trying to create a period when not an org admin', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: matterCreatorUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
      })
    })
    it('Should not be allowed to create a period', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/periods`,
        method: 'POST',
        body: { name: 'test', rateTableDetailId: 100 },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a period as an org admin with a bad payload', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: orgAdminUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
      })
    })
    it('should not be allowed with a BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/periods`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('When trying to create a period as an org admin with a good payload', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: orgAdminUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
        cy.login(orgAdminUser)
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
          method: 'POST',
          body: {
            currency: 'GBP',
            work_type: 'Example',
            location: 'E2E',
            client: false,
            draft: false,
            position: advisorPosition,
          },
        }).then(res => {
          expect(res.status).to.eq(200)
          rtd = res.body
        })
      })
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/periods`,
        method: 'POST',
        body: {
          name: 'initial period',
          startDate: new Date(2020, 1, 1),
          endDate: null,
          rateTableDetailId: rtd.id,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When trying to create a period as an matter admin with a good payload for a matter rtd', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: orgAdminUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
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
                })
              })
              cy.request({
                url: `${Cypress.env('serverBaseUrl')}/rate_table_detail`,
                method: 'POST',
                body: {
                  currency: 'GBP',
                  work_type: 'Example',
                  location: 'E2E',
                  client: false,
                  draft: false,
                  matter: m.id,
                  position: advisorPosition,
                },
              }).then(res => {
                expect(res.status).to.eq(200)
                rtd = res.body
              })
            })
          })
        })
      })
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/periods`,
        method: 'POST',
        body: {
          name: 'initial period',
          startDate: new Date(2020, 1, 1),
          endDate: null,
          rateTableDetailId: rtd.id,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
        period = res.body
      })
    })
    it('should be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/periods`,
        method: 'POST',
        body: {
          name: 'initial period',
          startDate: new Date(2020, 1, 1),
          endDate: null,
          rateTableDetailId: rtd.id,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not be allowed', () => {
      cy.login(nonMatterUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/periods`,
        method: 'POST',
        body: {
          name: 'initial period',
          startDate: new Date(2020, 1, 1),
          endDate: null,
          rateTableDetailId: rtd.id,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })

    it('should not be allowed to delete', () => {
      cy.login(nonMatterUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/period/${period.id}/delete`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })

    it('should be allowed to delete', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/period/${period.id}/delete`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
