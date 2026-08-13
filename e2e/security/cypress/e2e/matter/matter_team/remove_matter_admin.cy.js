import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addMatterAdmin } from '../../../../../helpers/matterprojects/matter_api_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('remove_matter_admin.cy', () => {
  let standardUser, matterAdmin, orgAdmin, guineaPigUser, fixture
  before(() => {
    createUser().then(createdUser => {
      guineaPigUser = createdUser
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
                prefix: 'importantMatter',
                teamMembers: [standardUser, orgAdmin, guineaPigUser],
                matterAdmins: [matterAdmin],
                projects: [
                  {
                    name: 'Project 1',
                    tasks: [{ name: 'task a' }],
                  },
                  {
                    name: 'Project 2',
                    tasks: [{ name: 'task b' }],
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

  describe('when trying to remove an existing matter admin', () => {
    let matterAdminId
    describe('as a MATTER ADMIN', () => {
      before(() => {
        addMatterAdmin(fixture.matter.id, guineaPigUser.id).then(res => {
          matterAdminId = res[0].id
        })
        cy.login(matterAdmin.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/matters/${matterAdminId}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a TEAM MEMBER', () => {
      before(() => {
        addMatterAdmin(fixture.matter.id, guineaPigUser.id).then(res => {
          matterAdminId = res[0].id
        })
        cy.login(standardUser.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/matters/${matterAdminId}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as an ORG_ADMIN', () => {
      before(() => {
        cy.login(orgAdmin.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/matters/${matterAdminId}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as SYS ADMIN', () => {
      const SYSADMIN_USER = {
        username: 'sysadmin@juralio.com',
        password: 'Password1Password1$',
      }
      before(() => {
        addMatterAdmin(fixture.matter.id, orgAdmin.id).then(res => {
          matterAdminId = res[0].id
        })
        cy.login(SYSADMIN_USER.username, SYSADMIN_USER.password)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/matters/${matterAdminId}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
