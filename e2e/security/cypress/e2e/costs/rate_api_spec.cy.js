import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('rate_api_spec.cy', () => {
  let orgAdminUser, matterCreatorUser
  let org, rtd, grades, rateTypes, period, advisorPosition
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
          cy.login(orgAdminUser)
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
  })
  describe('when trying to create a rate when not an org admin', () => {
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
    it('Should not be allowed to create a rate', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rates`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
  describe('When trying to create a rate as an org admin with a bad payload', () => {
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
        url: `${Cypress.env('serverBaseUrl')}/rates`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('When trying to create a rate as an org admin with a good payload', () => {
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
        cy.login(orgAdminUser)
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/grade/${
            org.id
          }/generateDefaults`,
          method: 'POST',
          body: { position: advisorPosition },
        })
          .its('body')
          .then(gradeList => {
            grades = gradeList
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/rate_type/${
                org.id
              }/generateDefaults`,
              method: 'POST',
              body: { position: advisorPosition },
            })
              .its('body')
              .then(rt => {
                rateTypes = rt
                cy.request({
                  url: `${Cypress.env('serverBaseUrl')}/otherCosts/${
                    org.id
                  }/generateDefaults`,
                  method: 'POST',
                  body: { position: advisorPosition },
                })
                  .its('body')
                  .then(oc => {
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
                    })
                      .its('body')
                      .then(newRtd => {
                        rtd = newRtd
                        cy.request({
                          url: `${Cypress.env('serverBaseUrl')}/periods`,
                          method: 'POST',
                          body: {
                            name: 'initial period',
                            startDate: new Date(2020, 1, 1),
                            endDate: null,
                            rateTableDetailId: rtd.id,
                          },
                        })
                          .its('body')
                          .then(newPeriod => {
                            period = newPeriod
                          })
                      })
                  })
              })
          })
      })
    })
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rates`,
        method: 'POST',
        body: {
          gradeId: grades[0].id,
          rateTypeId: rateTypes[0].id,
          periodId: period.periodId ? period.periodId : period.id,
          rate: 100,
          rate_table_detailsId: rtd.id,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when trying to get multiple rates with access', () => {
    it('should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rates`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when trying to get multiple rates without access', () => {
    it('should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/rates`,
        method: 'GET',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
})
