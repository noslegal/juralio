import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createOrganisation,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'

describe('get_projects.cy', () => {
  let matterAdminAndTeamMember,
    matterAdmin,
    teamMember,
    nonTeamMember,
    matter,
    matterCreator,
    project

  before(() => {
    createOrganisation('', false)
      .then(o => {
        org = o.body
        createUser('', true, false, {
          roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterAdminAndTeamMember = u
          sysadminAddUserToOrganisation(org, matterAdminAndTeamMember)

          createUser('', true, false, {
            roles: ['ROLE_MATTER_CREATOR'],
          }).then(u => {
            matterAdmin = u
            sysadminAddUserToOrganisation(org, matterAdmin)
          })
          createUser('', true, false, {
            roles: ['ROLE_MATTER_CREATOR'],
          }).then(u => {
            nonTeamMember = u
            sysadminAddUserToOrganisation(org, nonTeamMember)
          })
          createUser('', true, false, {
            roles: ['ROLE_MATTER_CREATOR'],
          }).then(u => {
            teamMember = u
            sysadminAddUserToOrganisation(org, teamMember)
          })
          createUser('', true, false, {
            roles: ['ROLE_MATTER_CREATOR'],
          }).then(u => {
            matterCreator = u
            sysadminAddUserToOrganisation(org, matterCreator)
          })
        })
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
        createMatter('1', matterCreator.username).then(m => {
          matter = m
          addTeamMember(m.id, matterAdminAndTeamMember.id, matterCreator)
          addMatterAdmin(m.id, matterAdminAndTeamMember.id, matterCreator)
          addMatterAdmin(m.id, matterAdmin.id, matterCreator)
          createProject(m.id, 'P1').then(p => {
            project = p
          })
          // addTeamMember(m.id, teamMember, matterCreator)
        })
      })
  })

  describe('when trying to list matter projects', () => {
    describe('for org users', () => {
      describe('as a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(matterAdminAndTeamMember.username)
        })

        it('should return OK status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              matter.id
            }/workstreams`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(nonTeamMember.username)
        })

        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              matter.id
            }/workstreams`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('as a MATTER ADMIN who is NOT a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(matterAdmin.username)
        })

        it('should return OK status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              matter.id
            }/workstreams`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('as a MATTER ADMIN and a MATTER TEAM MEMBER', () => {
        before(() => {
          cy.login(matterAdminAndTeamMember.username)
        })

        it('should return OK status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              matter.id
            }/workstreams`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('as users from a DIFFERENT ORGANISATION', () => {
        getDummyOrgUserProperties().forEach(c => {
          it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
            const url = `${Cypress.env('serverBaseUrl')}/matter/${
              matter.id
            }/workstreams`
            cy.login(otherOrgUsers[c.name].username)
            cy.apiSpecRequest({
              url,
              method: 'GET',
            }).then(response => {
              expect(response.status).to.eq(HttpStatus.FORBIDDEN)
            })
          })
        })
      })
    })
  })

  describe('when trying to get details for a specific project', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            matter.id
          }/workstreams/${project.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            matter.id
          }/workstreams/${project.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            matter.id
          }/workstreams/${project.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN and a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            matter.id
          }/workstreams/${project.id}`,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          const url = `${Cypress.env('serverBaseUrl')}/matter/${
            matter.id
          }/workstreams/${project.id}`
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
