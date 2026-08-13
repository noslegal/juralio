import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('task_siblings.cy', () => {
  let teamMember, nonTeamMember, fixture

  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

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
                  tasks: [{ name: 'Task' }],
                },
                {
                  name: 'Other Project',
                  tasks: [],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })

  describe('teamMember - when getting a tasks siblings', () => {
    it('should return OK status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/siblings`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('teamMember - when getting a tasks siblings with wrong project id', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}1234/task/${
          fixture.tasks[0].id
        }/siblings`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('teamMember - when getting a tasks siblings with wrong task id', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }1234/siblings`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('nonTeamMember - when getting a tasks siblings', () => {
    it('should return FORBIDDEN status', () => {
      cy.login(nonTeamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/siblings`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })

  describe('when attempting other verbs on the get matter parties endpoint', () => {
    const verbs = ['POST', 'PUT', 'PATCH', 'DELETE']

    let url

    beforeEach(() => {
      cy.login(teamMember.username)
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[0].id
      }/siblings`
    })

    verbs.forEach(verb =>
      it(`should return METHOD_NOT_ALLOWED status for ${verb}`, () => {
        cy.apiSpecRequest({
          url,
          method: verb,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
        })
      })
    )
  })
})
