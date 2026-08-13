import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('add_private_workstream_member.cy', () => {
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
            prefix: 'importantMatter',
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
            projects: [{ name: 'template source project', tasks: [] }],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to add a user to a private workstream', () => {
    let url

    const getProjectPayload = () => ({ users: [] })

    before(() => {
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/teammembers`
    })

    describe('as a MATTER ADMIN', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { users: [orgUsers.teamMember.id] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER and MATTER ADMIN', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { users: [orgUsers.knowledgeManager.id] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return BAD_REQUEST status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { users: [orgUsers.matterAdminAndTeamMember.id] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return BAD_REQUEST status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { users: [orgUsers.matterAdminAndTeamMember.id] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return BAD_REQUEST status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: { users: [orgUsers.matterAdminAndTeamMember.id] },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })
  })
})
