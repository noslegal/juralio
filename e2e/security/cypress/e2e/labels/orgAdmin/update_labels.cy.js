import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('update_labels.cy', () => {
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
    it('should not allow me to update the system level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/labels/system/1`,
        method: 'PATCH',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should  allow me to update my org level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels/${
          orgLabel.id
        }`,
        method: 'PATCH',
        body: { name: 'org name update' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body['name']).to.eq('org name update')
      })
    })
    it('should not allow me to update another org level labels', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels/1`,
        method: 'PATCH',
        body: { name: 'err' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
    it('should not allow me to update matter level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/labels`,
        method: 'PATCH',
        body: { name: 'err' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })
})
