import HttpStatus from 'http-status-codes'

const {
  generateFixture,
} = require('../../../../helpers/matterprojects/fixture_helper')
const { createUser } = require('../../../../helpers/users/user_api_helper')
const {
  createOrganisation,
  sysadminAddUserToOrganisation,
} = require('../../../../helpers/organisation/organisation_api_helper')

// Matter history (the new MatterEvent-backed admin log) is restricted to matter
// admins. These endpoints must return 200 for an admin and 403 for everyone else.
describe('get_matter_history.cy', () => {
  let matterAdmin
  let teamMember
  let outsider
  let crossOrgUser
  let fixture

  const historyUrl = matterId =>
    `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}/history`

  before(() => {
    createUser().then(admin => {
      matterAdmin = admin
      createUser().then(member => {
        teamMember = member
        createUser().then(other => {
          outsider = other
          // A user who belongs to a different organisation entirely (not the
          // matter's org) — the genuine cross-org denial case.
          createOrganisation(
            'HistoryCrossOrg' + new Date().toISOString(),
            false
          ).then(org => {
            createUser('HistoryCrossOrg', undefined, false, {
              roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
            }).then(user => {
              crossOrgUser = user
              sysadminAddUserToOrganisation(org.body, crossOrgUser)
            })
          })
          const seed = {
            matter: {
              prefix: 'HISTORY',
              teamMembers: [matterAdmin, teamMember],
              matterAdmins: [matterAdmin],
              projects: [{ name: 'history+spec', tasks: [{ name: 'task 1' }] }],
            },
          }
          fixture = generateFixture(seed)
        })
      })
    })
  })

  describe('as a matter admin', () => {
    beforeEach(() => cy.login(matterAdmin))

    it('can list the matter history', () => {
      cy.apiSpecRequest({
        url: historyUrl(fixture.matter.id),
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.property('items')
        expect(response.body.items).to.be.an('array')
        // Every returned event must belong to the requested matter - guards
        // against the matter.id scoping ever being dropped from the query.
        response.body.items.forEach(item => {
          expect(item.matterEvent.matterId).to.eq(fixture.matter.id)
        })
      })
    })

    it('can read the available filters', () => {
      cy.apiSpecRequest({
        url: `${historyUrl(fixture.matter.id)}/filters`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.property('categories')
        expect(response.body).to.have.property('people')
      })
    })

    it('can export the history as CSV', () => {
      cy.apiSpecRequest({
        url: `${historyUrl(fixture.matter.id)}/export`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('as a non-admin team member', () => {
    beforeEach(() => cy.login(teamMember))

    it('is forbidden from listing the history', () => {
      cy.apiSpecRequest({
        url: historyUrl(fixture.matter.id),
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('is forbidden from reading the filters', () => {
      cy.apiSpecRequest({
        url: `${historyUrl(fixture.matter.id)}/filters`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('is forbidden from exporting the CSV', () => {
      cy.apiSpecRequest({
        url: `${historyUrl(fixture.matter.id)}/export`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('as an unrelated user in the same organisation', () => {
    beforeEach(() => cy.login(outsider))

    it('is forbidden from listing the history', () => {
      cy.apiSpecRequest({
        url: historyUrl(fixture.matter.id),
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('as a user in a different organisation', () => {
    beforeEach(() => cy.login(crossOrgUser))

    it('is forbidden from listing the history', () => {
      cy.apiSpecRequest({
        url: historyUrl(fixture.matter.id),
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('is forbidden from reading the filters', () => {
      cy.apiSpecRequest({
        url: `${historyUrl(fixture.matter.id)}/filters`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })

    it('is forbidden from exporting the CSV', () => {
      cy.apiSpecRequest({
        url: `${historyUrl(fixture.matter.id)}/export`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
