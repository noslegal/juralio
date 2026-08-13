import faker from 'faker'
import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('matter-placeholder-create-spec', () => {
  let user, user2, fixture, resource, p1, p2
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
            matterAdmins: [user2],
            projects: [],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('as a matter editor', () => {
    before(() => {
      cy.login(user.username)
    })
    it('should let me create a placeholder', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not let me create a bad placeholder', () => {
      cy.login(user.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
  describe('as a matter admin', () => {
    before(() => {
      cy.login(user2.username)
    })
    it('should let me create a placeholder', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should not let me create a bad placeholder', () => {
      cy.login(user2.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body: {},
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})

