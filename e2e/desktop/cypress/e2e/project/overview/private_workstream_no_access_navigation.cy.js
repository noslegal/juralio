import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
    createDefaultOrgTestUsers,
    createPopulatedDummyOrg
} from '../../../../../helpers/organisation/organisation_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_no_access_navigation.cy', () => {
  let orgUsers, otherOrgUsers, fixture

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'no access to workstream',
            teamMembers: [
              orgUsers.matterAdmin,
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'private workstream ',
                properties: {
                  isPrivate: true,
                },
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to visit a workstream', () => {
    before(() => {
      cy.login(orgUsers.teamMember)
      visitHelpers.visitProjectOverview(
        fixture.matter.id,
        fixture.projects[0].id
      )
    })
    it('should show the bad route page', () => {
      cy.get('[data-test=zero-state-text]').should('exist')
    })
  })
})
