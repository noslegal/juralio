import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('update_matter_details.cy', () => {
  let user, user2, fixture
  before(() => {
    createUser().then(createdUser => {
      user2 = createdUser
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
                tasks: [{ name: 'Important task' }],
              },
              {
                name: 'Project 2',
                tasks: [{ name: 'Not so important task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })

  describe('when trying to update matter details', () => {
    describe('as a MATTER ADMIN', () => {
      beforeEach(() => {
        cy.login(user.username)
      })

      describe('with valid parameters', () => {
        it('should return OK status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }`,
            method: 'PATCH',
            body: { name: 'new name' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('with missing parameters', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }`,
            method: 'PATCH',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  describe('when trying to update matter details', () => {
    describe('when not a MATTER ADMIN', () => {
      beforeEach(() => {
        cy.login(user2.username)
      })

      describe('with valid parameters', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }`,
            method: 'PATCH',
            body: { name: 'new name' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })

      describe('with missing parameters', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }`,
            method: 'PATCH',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
  describe('when trying to update matter details', () => {
    const SYSADMIN_USER = {
      username: 'sysadmin@juralio.com',
      password: 'Password1Password1$',
    }
    describe('when logged in as sysadmin', () => {
      beforeEach(() => {
        cy.login(SYSADMIN_USER.username, SYSADMIN_USER.password)
      })

      describe('with valid parameters', () => {
        it('should return FORBIDDEN status', () => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }`,
            method: 'PATCH',
            body: { name: 'new name' },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
