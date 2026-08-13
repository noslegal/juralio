import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('get_label_usage_part2.cy', () => {
  let user, user2, fixture, fixture2
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
        const seed2 = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user2],
            matterAdmins: [user2],
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
        fixture2 = generateFixture(seed2)
      })
    })
  })

  describe('when accessing label usage as MA on separate matter', () => {
    let label
    let label2

    before(() => {
      cy.login(user.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {
          name: 'M1 label',
          type: 'workflow',
        },
      }).then(response => {
        label = response.body
        cy.login(user2.username)
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
          method: 'POST',
          body: {
            name: 'M2 label',
            type: 'workflow',
          },
        }).then(response => {
          label2 = response.body
        })
      })
    })

    describe('as a MATTER member of matter 1', () => {
      it('should allow me to read label1 usage', () => {
        cy.login(user.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/${label.id}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
      it('should NOT allow me to read label2 usage', () => {
        cy.login(user.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture2.matter.id
            }/labels/${label2.id}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })

    describe('as a MATTER member of matter 2', () => {
      it('should allow me to read label2 usage', () => {
        cy.login(user2.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture2.matter.id
            }/labels/${label2.id}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })
      it('should NOT allow me to read label1 usage', () => {
        cy.login(user2.username).then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/${label.id}`,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })
  })
})
