import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers, createPopulatedDummyOrg
} from '../../../../../helpers/organisation/organisation_api_helper'

describe('users_search_matters.cy', () => {
  let orgUsers, otherOrgUsers, fixture

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

  describe('When a MTM is logged in and posts a valid Matter id', () => {
    before(() => {
      cy.login(orgUsers.teamMember.username)
    })

    it('should return OK status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/users/search`,
        method: 'POST',
        body: { matters: [fixture.matter.id] },
      }).then(response => {
        const users = response.body

        expect(response.status).to.eq(HttpStatus.OK)
        expect(users.length).to.eq(3)

        expect(users[0].id).to.be.a('number')
        expect(users[0].firstname).to.be.a('string')
        expect(users[0].lastname).to.be.a('string')
        expect(users[0].username).to.be.a('string')

        expect(users[1].firstname).to.be.a('string')
        expect(users[1].lastname).to.be.a('string')
        expect(users[1].username).to.be.a('string')
      })
    })

    describe('When a non-MTM is logged in', () => {
      before(() => {
        cy.login(otherOrgUsers.teamMember.username)
      })

      it('should return a FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'POST',
          body: { matters: [fixture.matter.id] },
        }).then(response => {
          const users = response.body
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('When a MTM is logged in and posts a invalid Matter id', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/users/search`,
          method: 'POST',
          body: { matters: [999999999999999] },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
