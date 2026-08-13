import HttpStatus from 'http-status-codes'
import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createMatter } from '../../../../helpers/matterprojects/matter_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('access_control_checks', () => {
  let testUser, fixture, appPage, otherOrgUser, firstOrg, viewer, om

  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
      createUser().then(cu2 => {
        viewer = cu2
        const seed = {
          matter: {
            prefix: 'directroute',
            matterViewer: [cu2],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'P1',
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
    createUser(
      '',
      true,
      false,
      { roles: ['ROLE_MATTER_CREATOR'] },
      false,
      false
    )
      .then(user => {
        otherOrgUser = user
      })
      .then(() =>
        createOrganisation('', false).then(o => {
          firstOrg = o.body

          return sysadminAddUserToOrganisation(firstOrg, otherOrgUser)
        })
      )
  })
  describe('as an org admin in another org', () => {
    before(() => {
      cy.login(otherOrgUser.username)
      createMatter('', otherOrgUser.username).then(res => {
        om = res
        console.log(res)
      })
    })
    it('should not be allowed to delete a viewer in another orgs matter', () => {
      cy.login(otherOrgUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${om.id}/viewers/${
          viewer.id
        }`,
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
