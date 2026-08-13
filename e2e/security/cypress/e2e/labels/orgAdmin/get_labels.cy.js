import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_labels.cy', () => {
  let teamMember, organisation, matterMember, fixture
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    createOrganisation('test', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(() => {
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] })
          .then(createdUser => {
            teamMember = createdUser
          })
          .then(() => {
            sysadminAddUserToOrganisation(organisation, teamMember).then(() => {
              cy.login(teamMember.username)
              cy.apiSpecRequest({
                url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
                method: 'POST',
                body: {
                  name: 'organisationLabel',
                  type: 'workflow',
                },
              }).then(response => {
                orgLabel = response.body
                createUser().then(u => {
                  matterMember = u
                  const seed = {
                    matter: {
                      prefix: 'directroute',
                      teamMembers: [matterMember],
                      matterAdmins: [matterMember],
                      projects: [
                        {
                          name: 'P1',
                        },
                      ],
                    },
                  }
                  fixture = generateFixture(seed)
                })
              })
            })
          })
      })
  })

  describe('as an orgadmin', () => {
    it('should not allow me to read the system level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/labels/system`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should  allow me to read my org level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(1)
      })
    })
    it('should  allow me to read my org and system level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/organisation/labels?includeHierarchicalLabels=true`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(11)
      })
    })
    it('should not allow me to read another org level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow me to read matter level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })
})
