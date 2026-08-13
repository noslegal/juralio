import HttpStatus from 'http-status-codes'
import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
  sysadminRemoveUserFromOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateUser,
} from '../../../../../helpers/users/user_api_helper'

const addMTM = (matterId, userIdsList) =>
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}/teammembers`,
    method: 'POST',
    body: {
      matter: matterId,
      users: userIdsList,
    },
  })

const addMA = (matterId, userId) =>
  cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}/matters`,
      method: 'POST',
      body: {
        matter: matterId,
        user: userId,
      },
    })
    .its('body')

describe('cross_org_access.cy', () => {
  let orgUserA, orgUserB
  let orgA, orgB
  let orgAUser2
  let matter

  before(() => {
    createOrganisation('Org A' + new Date().toISOString(), false).then(
      organisation1 => {
        orgA = organisation1

        createOrganisation('Org B' + new Date().toISOString(), false).then(
          organisation2 => {
            orgB = organisation2

            createUser('Org User A', undefined, false, {
              roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
            }).then(createdUser => {
              orgUserA = createdUser

              sysadminAddUserToOrganisation(orgA.body, orgUserA)

              createUser('Org User A2', undefined, false, {
                roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
              }).then(user => {
                orgAUser2 = user

                sysadminAddUserToOrganisation(orgA.body, orgAUser2)
                updateUser({
                  id: orgAUser2.id,
                  roles: [
                    'ROLE_ORG_ADMIN',
                    'ROLE_MATTER_CREATOR',
                    'ROLE_ORG_OWNER',
                  ],
                })
              })

              createUser('Org User B', undefined, false, {
                roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
              }).then(createdUser => {
                orgUserB = createdUser

                sysadminAddUserToOrganisation(orgB.body, orgUserB)
              })
            })
          }
        )
      }
    )
  })

  describe('when trying to list matters', () => {
    before(() => {
      cy.logoutServerSide()
      createMatter('TEST', orgUserA.username).then(response => {
        matter = response
        addMA(matter.id, orgAUser2.id)
      })
    })
    const URL = 'matter'
    describe('when signed in as an authenticated user of Matter A Org A', () => {
      before(() => {
        cy.logoutServerSide()
        cy.login(orgUserA.username, 'Password2Password2$')
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/${URL}/${matter.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })

      describe('when signed in as member of Org B', () => {
        before(() => {
          cy.logoutServerSide()

          sysadminRemoveUserFromOrganisation(orgA.body, orgUserA)
          cy.logoutServerSide()

          sysadminAddUserToOrganisation(orgB.body, orgUserA)
          cy.logoutServerSide()

          cy.login(orgUserA.username, 'Password2Password2$')
          cy.wait(5000)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}/${matter.id}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
