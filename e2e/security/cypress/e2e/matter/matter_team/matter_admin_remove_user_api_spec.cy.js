import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('matter_admin_remove_user_api_spec', () => {
  let standardUser, matterAdmin, orgAdmin, targetUser, fixture

  before(() => {
    createUser().then(createdUser => {
      targetUser = createdUser
      createUser().then(createdUser => {
        matterAdmin = createdUser
        createUser().then(createdUser => {
          orgAdmin = createdUser
          createUser('', true, false).then(createdUser => {
            standardUser = createdUser
            sysadminAddUserToOrganisation(
              { id: DEFAULT_ORGANISATION_ID },
              standardUser
            )

            const seed = {
              matter: {
                prefix: 'removeUserMatter',
                teamMembers: [standardUser, orgAdmin, targetUser],
                matterAdmins: [matterAdmin],
                projects: [
                  {
                    name: 'Project 1',
                    tasks: [{ name: 'task a' }],
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

  describe('when removing a user as a non-admin team member', () => {
    before(() => {
      cy.login(standardUser.username)
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/removeUser`,
        method: 'DELETE',
        body: { userId: targetUser.id, matterId: fixture.matter.id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when removing a user with missing body fields as a matter admin', () => {
    before(() => {
      cy.login(matterAdmin.username)
    })

    it('should fail with BAD_REQUEST', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/removeUser`,
        method: 'DELETE',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })

  describe('when removing a user as a matter admin', () => {
    before(() => {
      cy.login(matterAdmin.username)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/removeUser`,
        method: 'DELETE',
        body: { userId: targetUser.id, matterId: fixture.matter.id },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when removing a user as a cross-org user', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
    })

    it('should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/removeUser`,
        method: 'DELETE',
        body: { userId: orgAdmin.id, matterId: fixture.matter.id },
      }).then(response => {
        expect(response.status).to.be.oneOf([
          HttpStatus.UNAUTHORIZED,
          HttpStatus.FORBIDDEN,
        ])
      })
    })
  })

  describe('when removing a user as a sysadmin', () => {
    const SYSADMIN_USER = {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    }
    before(() => {
      cy.login(SYSADMIN_USER.username, SYSADMIN_USER.password)
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/removeUser`,
        method: 'DELETE',
        body: { userId: orgAdmin.id, matterId: fixture.matter.id },
      }).then(response => {
        expect(response.status).to.be.oneOf([
          HttpStatus.UNAUTHORIZED,
          HttpStatus.FORBIDDEN,
        ])
      })
    })
  })
})
