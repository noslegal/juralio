import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../../helpers/users/user_api_helper'
import faker from 'faker'

describe('matter_placeholders_delete_spec.cy', () => {
  let user, user2, fixture, p1
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
      cy.login(user2)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
      }).then(res => {
        p1 = res.body
        cy.login(user.username)
      })
      it('should not let me delete placeholders', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/placeholders/${p1.id}`,
          method: 'DELETE',
          body: {
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
    describe('as a matter admin', () => {
      before(() => {
        cy.login(user2.username)
      })

      it('should not let me delete placeholders with a bad id', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/placeholders/${-1}`,
          method: 'DELETE',
          body: {
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
      it('should let me delete placeholders', () => {
        cy.login(user2.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/placeholders/${p1.id}`,
          method: 'DELETE',
          body: {
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          expect(response.body.enabled).to.eq(false)
        })
      })
    })
  })
})
