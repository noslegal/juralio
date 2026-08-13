import HttpStatus from 'http-status-codes'

const {
  generateFixture,
} = require('../../../../helpers/matterprojects/fixture_helper')
const { createUser } = require('../../../../helpers/users/user_api_helper')

describe('task_status_change.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'LABELS',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'task_stattus_change+spec',
              tasks: [
                { name: 'change to done' },
                { name: 'change to not-required' },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when changing a task status to done', () => {
    before(() => {
      cy.login(user)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/labels`,
        method: 'POST',
        body: { labelId: 1 },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(1)
      })

      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { status: 'in-progress' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`,
        method: 'PATCH',
        body: { status: 'done' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should remove all risk and workflow labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(0)
      })
    })
  })
  describe('when changing a task status to not-required', () => {
    before(() => {
      cy.login(user)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/labels`,
        method: 'POST',
        body: { labelId: 1 },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(1)
      })

      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[1].id}`,
        method: 'PATCH',
        body: { status: 'in-progress' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${fixture.tasks[1].id}`,
        method: 'PATCH',
        body: { status: 'task-not-required' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('should remove all risk and workflow labels', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/labels`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body).to.have.length(0)
      })
    })
  })
})
