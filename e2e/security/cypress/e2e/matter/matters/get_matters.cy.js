import HttpStatus from 'http-status-codes'
import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_matters.cy', () => {
  let orgAdminA, orgAdminB
  let orgUserA, orgUserB
  let orgA, orgB
  const matterA_orgAdminInTeam = 'Matter A with org admin'
  const matterA_orgAdminNotInTeam = 'Matter A without org admin'
  const matterB_orgAdminInTeam = 'Matter B with org admin'
  const matterB_orgAdminNotInTeam = 'Matter B without org admin'

  before(() => {
    createOrganisation('Org A' + new Date().toISOString(), false).then(
      organisation => {
        orgA = organisation

        createOrganisation('Org B' + new Date().toISOString(), false).then(
          organisation => {
            orgB = organisation

            createUser('Org Admin A', undefined, false, {
              roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
            }).then(createdUser => {
              orgAdminA = createdUser
              sysadminAddUserToOrganisation(orgA.body, orgAdminA)

              createUser('Org User A', undefined, false, {
                roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
              }).then(createdUser => {
                orgUserA = createdUser
                sysadminAddUserToOrganisation(orgA.body, orgUserA)

                createUser('Org Admin B', undefined, false, {
                  roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
                }).then(createdUser => {
                  orgAdminB = createdUser
                  sysadminAddUserToOrganisation(orgB.body, orgAdminB)

                  createUser('Org User B', undefined, false, {
                    roles: ['ROLE_USER', 'ROLE_MATTER_CREATOR'],
                  }).then(createdUser => {
                    orgUserB = createdUser
                    sysadminAddUserToOrganisation(orgB.body, orgUserB)

                    createMatter(matterA_orgAdminInTeam, orgAdminA.username)
                    createMatter(matterA_orgAdminNotInTeam, orgUserA.username)
                    createMatter(matterB_orgAdminInTeam, orgAdminB.username)
                    createMatter(matterB_orgAdminNotInTeam, orgUserB.username)
                  })
                })
              })
            })
          }
        )
      }
    )
  })

  const USER = {
    STANDARD_USER: {
      username: 'matter.creator@juralio.com',
      password: 'Password2Password2$',
    },
  }

  describe('when there are two Orgs (A and B), two matters (A and B) in those orgs, both containing a matter with an org admin and a matter one without', () => {
    describe('when trying to list matters', () => {
      const URL = 'matters'
      describe('when signed in as an authenticated user', () => {
        before(() => {
          cy.login(USER.STANDARD_USER.username, USER.STANDARD_USER.password)
        })

        it('should return OK status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('as SysAdmin user', () => {
        const USER = {
          SYSADMIN_USER: {
            username: 'sysadmin@juralio.com',
            password: 'Password1Password1$',
          },
        }
        before(() => {
          cy.login(USER.SYSADMIN_USER.username, USER.SYSADMIN_USER.password)
        })

        it('should return forbidden status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })

    describe('when trying to list all matters of an organisation', () => {
      const URL = 'matters?allMatters=true'
      describe('when signed in as org admin A', () => {
        let matters, status
        before(() => {
          cy.login(orgAdminA.username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'GET',
          }).then(response => {
            status = response.status
            matters = response.body
          })
        })

        it('should return OK status', () => {
          expect(status).to.eq(HttpStatus.OK)
        })

        it('should have 2 matters', () => {
          expect(matters.length).to.equal(2)
        })

        it('should have the matters from Org A', () => {
          expect(matters[0].name).to.equal(matterA_orgAdminInTeam)
          expect(matters[1].name).to.equal(matterA_orgAdminNotInTeam)
        })

        it('should not have the matters from Org B', () => {
          matters.forEach(matter => {
            expect(matter.name).to.not.equal(matterB_orgAdminInTeam)
            expect(matter.name).to.not.equal(matterB_orgAdminNotInTeam)
          })
        })
      })

      describe('when signed in as org user A', () => {
        let matters, status
        before(() => {
          cy.login(orgUserA.username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'GET',
          }).then(response => {
            status = response.status
            matters = response.body
          })
        })

        it('should return FORBIDDEN status', () => {
          expect(status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      describe('when signed in as org admin B', () => {
        let matters, status
        before(() => {
          cy.login(orgAdminB.username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'GET',
          }).then(response => {
            status = response.status
            matters = response.body
          })
        })

        it('should return OK status', () => {
          expect(status).to.eq(HttpStatus.OK)
        })

        it('should have 2 matters', () => {
          expect(matters.length).to.equal(2)
        })

        it('should have the matters from Org B', () => {
          expect(matters[0].name).to.equal(matterB_orgAdminInTeam)
          expect(matters[1].name).to.equal(matterB_orgAdminNotInTeam)
        })

        it('should not have the matters from Org A', () => {
          matters.forEach(matter => {
            expect(matter.name).to.not.equal(matterA_orgAdminInTeam)
            expect(matter.name).to.not.equal(matterA_orgAdminNotInTeam)
          })
        })
      })

      describe('when signed in as org user B', () => {
        let matters, status
        before(() => {
          cy.login(orgUserB.username)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/${URL}`,
            method: 'GET',
          }).then(response => {
            status = response.status
            matters = response.body
          })
        })

        it('should return FORBIDDEN status', () => {
          expect(status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
