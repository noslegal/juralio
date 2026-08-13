import HttpStatus from 'http-status-codes'
import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_labels.cy', () => {
  let teamMember, orgLabel, organisation, orgAdmin, matter, matterLabel
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    createOrganisation(null, false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(() => {
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] })
          .then(createdUser => {
            orgAdmin = createdUser
          })
          .then(() => {
            cy.login('sysadmin@juralio.com', 'Password1Password1$')
            sysadminAddUserToOrganisation(organisation, orgAdmin).then(() => {
              createUser(undefined, true, false, {
                roles: ['ROLE_MATTER_CREATOR'],
              }).then(u => {
                teamMember = u
                sysadminAddUserToOrganisation(organisation, teamMember).then(
                  () => {
                    cy.login(orgAdmin).then(() => {
                      cy.apiSpecRequest({
                        url: `${Cypress.env(
                          'serverBaseUrl'
                        )}/organisation/labels`,
                        method: 'POST',
                        body: {
                          name: 'organisationLabel',
                          type: 'workflow',
                        },
                      }).then(response => {
                        orgLabel = response.body
                        cy.login(teamMember)
                        createMatter('test matter', teamMember.username).then(
                          m => {
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
                          }
                        )
                      })
                    })
                  }
                )
              })
            })
          })
      })
  })

  describe('as a matter admin', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should allow me to read matter level labels', () => {
      cy.login(teamMember.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${matter.id}/labels`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          expect(response.body).to.have.length(1)
        })
      })
    })
    it('should allow me to read organisation and system level labels', () => {
      cy.login(teamMember.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            matter.id
          }/labels?includeHierarchicalLabels=true`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          expect(response.body).to.have.length(12)
        })
      })
    })
    describe('when there is an inactive org label', () => {
      before(() => {
        cy.login(orgAdmin.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/organisation/labels/${
              orgLabel.id
            }`,
            method: 'PATCH',
            body: {
              inactive: true,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
            cy.login(teamMember.username)
          })
        })
      })
      it('should not let me read inactive org labels', () => {
        cy.login(teamMember.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              matter.id
            }/labels?includeHierarchicalLabels=true`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
            expect(response.body).to.have.length(11)
          })
        })
      })
    })

    it('should not let me read system labels', () => {
      cy.login(teamMember.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/labels/system`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
    it('should not let me read other org labels', () => {
      cy.login(teamMember.username).then(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
