//as a matter editor
//as not a matter editor
import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../../helpers/users/user_api_helper'

describe('matter_resource.cy', () => {
  let user, user2, fixture, resource
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
            matterAdmins: [user, user2],
            projects: [],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('as matter editor', () => {
    before(() => {
      cy.login(user.username)
    })

    it('should let me read the resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/resources`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should let me add a resources', () => {
      cy.login(user.username).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/resources`,
            method: 'POST',
            body: { name: 'a', url: 'https://test.com', image: '' },
          })
          .then(response => {
            resource = response.body
            expect(response.status).to.eq(HttpStatus.OK)
          })
      )
    })
    it('should let me update a resources', () => {
      cy.login(user.username).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/resources/${resource.id}`,
            method: 'PATCH',
            body: { name: 'b' },
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
      )
    })
    it('should let me deleta a resources', () => {
      cy.login(user.username).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/resources/${resource.id}`,
            method: 'DELETE',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
      )
    })
  })
  describe('as not matter editor', () => {
    before(() => {
      cy.login(user2.username)
    })

    it('should let me read the resources', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/resources`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
    it('should let me add a resources', () => {
      cy.login(user2.username).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/resources`,
            method: 'POST',
            body: { name: 'a', url: 'https://test.com', image: '' },
          })
          .then(response => {
            resource = response.body
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
      )
    })
    it('should let me update a resources', () => {
      cy.login(user2.username).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/resources/${resource.id}`,
            method: 'PATCH',
            body: { name: 'b' },
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
      )
    })
    it('should let me delete a resources', () => {
      cy.login(user2.username).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/resources/${resource.id}`,
            method: 'DELETE',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
      )
    })
  })
})
