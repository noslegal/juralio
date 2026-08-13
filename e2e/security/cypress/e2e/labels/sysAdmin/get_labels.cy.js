import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_labels.cy', () => {
  let teamMember, fixture
  before(() => {
    createUser()
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember],
            matterAdmins: [teamMember],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task' }, { name: 'Task 2' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('as a sysadmin', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
    })
    it('should allow me to read the system level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/labels/system`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(10)
      })
    })
    it('should not allow me to read org level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/11/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
    it('should not allow me to read matter level labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.UNAUTHORIZED)
      })
    })
  })
})
