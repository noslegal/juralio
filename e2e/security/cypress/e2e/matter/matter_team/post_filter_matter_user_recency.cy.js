import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../../helpers/users/user_api_helper'

describe('post_filter_matter_user_recency.cy', () => {
  let organisation2, orgAdminUser2, orgMC2, fixture2

  let user, user2, fixture
  before(() => {
    createUser('other user', undefined, false).then(createdUser => {
      user2 = createdUser
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
      createUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task 1' }],
              },
              {
                name: 'Project 2',
                tasks: [{ name: 'Task 2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        setupOrganisationWithMatter(true, [{ name: 'task 2' }]).then(result => {
          organisation2 = result.organisationLabels
          orgAdminUser2 = result.orgAdminUser
          orgMC2 = result.orgMC
          fixture2 = result.fixture
        })
      })
    })
    cy.logoutServerSide()
  })

  describe('when signed in as an authenticated user', () => {
    before(() => {
      cy.login(user2.username)
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/search/users/${user.id}`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  
  describe('when signed in as an authenticated user not on matter', () => {
    before(() => {
      cy.login(user2.username)
    })

    it('should return FORBIDDEN status', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/search/users/${user2.id}`,
        method: 'POST',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when trying to post task filter user recency', () => {
    describe('when NOT signed in as an authenticated user', () => {
      it('should return UNAUTHORIZED status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/search/users/${user2.id}`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
        })
      })
    })
  })

  describe('when trying to store task filter user recency', () => {
    describe('when signed in as an authenticated user', () => {
      before(() => {
        cy.login(user.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/search/users/${user2.id}`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('when signed in as an authenticated user in another Org', () => {
      before(() => {
        cy.login(orgMC2.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture2.matter.id
          }/search/users/${user2.id}`,
          method: 'POST',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })

  describe('when attempting other verbs', () => {
    const verbs = ['GET', 'PUT', 'PATCH', 'DELETE']

    beforeEach(() => {
      cy.login(user.username)
    })
    verbs.forEach(verb =>
      it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/search/users/${user2.id}`,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    )
  })
})
