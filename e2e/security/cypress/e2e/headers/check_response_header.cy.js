import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../helpers/organisation/organisation_api_helper'

describe('check_response_header.cy', () => {
  let orgUsers, fixture, otherOrgUsers

  before(() => {
    createDefaultOrgTestUsers()
      .then(createdUsers => {
        orgUsers = createdUsers
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when a user makes a request to the server', () => {
    before(() => {
      cy.login(orgUsers.teamMember.username)
    })

    it('should return a response with a header saying cache-control: no-store', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams`,
        method: 'GET',
      }).then(response => {
        expect(Object.keys(response.headers)).contains('cache-control')
        expect(response.headers['cache-control']).to.eq(
          'private, no-cache, no-store, must-revalidate, pre-check=0, post-check=0, max-age=0, s-maxage=0, no-transform'
        )
      })
    })
  })
})
