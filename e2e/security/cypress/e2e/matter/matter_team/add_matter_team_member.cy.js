import HttpStatus from 'http-status-codes'
import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
    createOrganisation,
    sysadminAddUserToOrganisation
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('add_matter_team_member.cy', () => {
  let orgAdminA, orgAdminB
  let userA, userB
  let dummyUserA
  let orgA, orgB
  const matterA_orgAdminInTeam = 'Matter A with org admin'
  const matterA_orgAdminNotInTeam = 'Matter A without org admin'
  const matterB_orgAdminInTeam = 'Matter B with org admin'
  const matterB_orgAdminNotInTeam = 'Matter B without org admin'

  let matterA_orgAdmin, matterA_regularUser

  before(() => {
    createOrganisation(`Org A ${new Date().toISOString()}`, false)
      .then(organisation => {
        orgA = organisation

        createOrganisation(`Org B ${new Date().toISOString()}`, false)
      })
      .then(organisation => {
        orgB = organisation

        createUser('Dummy user', undefined, false, {
          roles: ['ROLE_USER'],
        })
      })
      .then(createdUser => {
        dummyUserA = createdUser
        sysadminAddUserToOrganisation(orgA.body, dummyUserA)

        createUser('Org Admin A', undefined, false, {
          roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
        })
      })
      .then(createdUser => {
        orgAdminA = createdUser
        sysadminAddUserToOrganisation(orgA.body, orgAdminA)

        createUser('Org User A', undefined, false, {
          roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
        })
      })
      .then(createdUser => {
        userA = createdUser
        sysadminAddUserToOrganisation(orgA.body, userA)

        createUser('Org Admin B', undefined, false, {
          roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
        })
      })
      .then(createdUser => {
        orgAdminB = createdUser
        sysadminAddUserToOrganisation(orgB.body, orgAdminB)

        createUser('Org User B', undefined, false, {
          roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
        })
      })
      .then(createdUser => {
        userB = createdUser
        sysadminAddUserToOrganisation(orgB.body, userB)

        createMatter(matterA_orgAdminInTeam, orgAdminA.username)
      })
      .then(matter => {
        matterA_orgAdmin = matter

        createMatter(matterA_orgAdminNotInTeam, userA.username)
      })
      .then(matter => {
        matterA_regularUser = matter

        createMatter(matterB_orgAdminInTeam, userB.username)
      })
      .then(matter => {
        matterB = matter
        createMatter(matterB_orgAdminNotInTeam, userB.username)
      })
  })

  const makeRequest = (matterId, userIdsList) =>
    cy.apiSpecRequest({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/admin/matter/${matterId}/teammembers`,
      method: 'POST',
      body: {
        matter: matterId,
        users: userIdsList,
      },
    })

  describe('when trying to add a new matter team member', () => {
    describe('when NOT signed in as an authenticated user', () => {
      before(() => {
        cy.logoutServerSide()
      })

      it('should return UNAUTHORIZED status', () => {
        makeRequest(matterA_regularUser.id, [dummyUserA.id]).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })

    describe('when as a MATTER ADMIN but not ORG ADMIN', () => {
      describe('when NOT admin of the matter', () => {
        before(() => {
          cy.login(userA.username)
        })

        it('should return BAD_REQUEST status', () => {
          makeRequest(matterB.id, [dummyUserA.id]).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })

      describe('when admin of the matter', () => {
        before(() => {
          cy.login(userA.username)
        })

        it('should return OK status', () => {
          makeRequest(matterA_regularUser.id, [dummyUserA.id]).then(
            response => {
              expect(response.status).to.eq(HttpStatus.OK)
            }
          )
        })
      })
    })

    describe('when as a MATTER ADMIN and ORG ADMIN', () => {
      describe('when NOT admin of the matter and matter is in DIFFERENT org', () => {
        before(() => {
          cy.login(orgAdminA.username)
        })

        it('should return BAD_REQUEST status', () => {
          makeRequest(matterB.id, [dummyUserA.id]).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })

      describe('when NOT admin of the matter and matter is in SAME org', () => {
        before(() => {
          cy.login(orgAdminA.username)
        })

        it('should return OK status', () => {
          makeRequest(matterA_regularUser.id, [createUser().id]).then(
            response => {
              expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
            }
          )
        })
      })

      describe('when admin of the matter', () => {
        before(() => {
          cy.login(orgAdminA.username)
        })

        it('should return OK status', () => {
          makeRequest(matterA_orgAdmin.id, [dummyUserA.id]).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })
  })
})
