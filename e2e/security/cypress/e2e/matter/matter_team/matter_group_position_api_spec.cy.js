import HttpStatus from 'http-status-codes'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  updateUser,
} from '../../../../../helpers/users/user_api_helper'

describe('matter_group_position_api_spec', () => {
  let orgAdminUser, matterCreatorUser, teamMemberUser, groupMemberUser
  let org, matter, group, position

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
          createUser('', true, false, {
            roles: ['ROLE_USER'],
          }).then(u => {
            teamMemberUser = u
            sysadminAddUserToOrganisation(org, teamMemberUser)
            createUser('', true, false, {
              roles: ['ROLE_USER'],
            }).then(u => {
              groupMemberUser = u
              sysadminAddUserToOrganisation(org, groupMemberUser)

              // Create the group and read positions as the org admin.
              cy.login(orgAdminUser).then(() => {
                cy.request({
                  url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
                  method: 'GET',
                }).then(res => {
                  position = Array.isArray(res.body) ? res.body[0] : res.body
                })
                cy.request({
                  url: `${Cypress.env('serverBaseUrl')}/organisations/${
                    org.id
                  }/group`,
                  method: 'POST',
                  body: { name: 'MGP Test Group', isInternal: true },
                }).then(res => {
                  group = res.body
                })
              })

              // Put the group member into the new group so that adding them to
              // the matter creates a MatterGroupPosition for that group.
              // (updateUser logs in as sysadmin, so keep it out of the org-admin
              // scoped requests above.)
              cy.then(() => {
                updateUser({
                  id: groupMemberUser.id,
                  group: { id: group.id },
                })
              })

              // Build the matter team as the matter creator.
              cy.login(matterCreatorUser).then(() => {
                createMatter('mgp', matterCreatorUser.username).then(m => {
                  matter = m
                  addMatterAdmin(m.id, orgAdminUser.id, matterCreatorUser)
                  addTeamMember(
                    m.id,
                    teamMemberUser.id,
                    matterCreatorUser.username,
                    Cypress.env('defaultPassword')
                  )
                  // Adding a member of MGP Test Group attaches that group to
                  // the matter (creates the deletable MatterGroupPosition).
                  addTeamMember(
                    m.id,
                    groupMemberUser.id,
                    matterCreatorUser.username,
                    Cypress.env('defaultPassword')
                  )
                })
              })
            })
          })
        })
      })
    })
  })

  describe('When listing matter group positions as a cross-org user', () => {
    it('Should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([
          HttpStatus.UNAUTHORIZED,
          HttpStatus.FORBIDDEN,
        ])
      })
    })
  })

  describe('When updating matter group positions as a non-admin team member', () => {
    it('Should not be allowed', () => {
      cy.login(teamMemberUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition`,
        method: 'PATCH',
        body: { groupId: group?.id, positionId: position?.id },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('When updating matter group positions with missing body fields as a matter admin', () => {
    it('Should fail with BAD_REQUEST', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition`,
        method: 'PATCH',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('When updating matter group positions as a matter admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition`,
        method: 'PATCH',
        body: { groupId: group?.id, positionId: position?.id },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When updating matter group positions as a cross-org user', () => {
    it('Should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition`,
        method: 'PATCH',
        body: { groupId: group?.id, positionId: position?.id },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([
          HttpStatus.UNAUTHORIZED,
          HttpStatus.FORBIDDEN,
        ])
      })
    })
  })

  describe('When deleting a matter group position as a non-admin team member', () => {
    it('Should not be allowed', () => {
      cy.login(teamMemberUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition/${group?.id}`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('When deleting a matter group position as a cross-org user', () => {
    it('Should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition/${group?.id}`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([
          HttpStatus.UNAUTHORIZED,
          HttpStatus.FORBIDDEN,
        ])
      })
    })
  })

  describe('When deleting a matter group position as a matter admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          matter.id
        }/matterGroupPosition/${group?.id}`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
