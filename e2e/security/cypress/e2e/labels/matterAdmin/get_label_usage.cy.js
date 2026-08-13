import HttpStatus from 'http-status-codes'
import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_label_usage.cy', () => {
  let organisation
  let teamMember, nonTeamMember
  let matterLabel

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    createOrganisation(null, false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(() => {
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
          createdUser => {
            orgAdmin = createdUser
          }
        )
      })
      .then(() => {
        createUser().then(createdUser => {
          nonTeamMember = createdUser
        })
      })
      .then(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        sysadminAddUserToOrganisation(organisation, orgAdmin).then(() => {
          createUser(undefined, true, false, {
            roles: ['ROLE_MATTER_CREATOR'],
          }).then(u => {
            teamMember = u
            sysadminAddUserToOrganisation(organisation, teamMember).then(() => {
              cy.login(orgAdmin).then(() => {
                cy.apiSpecRequest({
                  url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
                  method: 'POST',
                  body: {
                    name: 'organisationLabel',
                    type: 'workflow',
                  },
                }).then(response => {
                  orgLabel = response.body
                  cy.login(teamMember)
                  createMatter('test matter', teamMember.username).then(m => {
                    matter = m
                    cy.apiSpecRequest({
                      url: `${Cypress.env('serverBaseUrl')}/matter/${
                        matter.id
                      }/labels`,
                      method: 'POST',
                      body: {
                        name: 'matterLabel',
                        type: 'workflow',
                      },
                    }).then(res => (matterLabel = res.body))
                  })
                })
              })
            })
          })
        })
      })
  })

  describe('as a matter admin', () => {
    let labels

    it('should allow me to read matter level labels', () => {
      cy.login(teamMember.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/labels`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          expect(response.body).to.have.length(1)
          labels = response.body
        })
      })
    })

    it('should allow me to read label usage', () => {
      cy.login(teamMember.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/labels/${
            labels[0].id
          }`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          expect(response.body).to.have.length(0)
        })
      })
    })

    describe('When logged in as a non-Matter member', () => {
      it('should NOT allow me to read label usage', () => {
        cy.login(nonTeamMember.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/labels/${
              labels[0].id
            }`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })

    describe('when not logged in', () => {
      const verbs = ['GET', 'PUT', 'PATCH', 'DELETE', 'POST']
      verbs.forEach(verb =>
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/labels/${
              labels[0].id
            }`,
            method: verb,
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
          })
        })
      )
    })

    describe('when logged in', () => {
      const verbs = ['PUT', 'DELETE']
      verbs.forEach(verb =>
        it(`should return UNAUTHORIZED status for ${verb}`, () => {
          cy.login(teamMember.username).then(() => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/matter/${
                matter.id
              }/labels/${labels[0].id}`,
              method: verb,
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
            })
          })
        })
      )
    })
  })
})
