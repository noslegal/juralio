import HttpStatus from 'http-status-codes'
import { addHashtagToTask } from '../../../../../helpers/labels/add-label-to-task'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'

describe('labels_merge_api.cy', () => {
  let organisation, orgAdminUser, orgMC
  let fixture, appPage

  before(() => {
    setupOrganisationWithMatter(true, [
      { name: 'task 1', tasks: [{ name: 'task 3' }] },
      { name: 'task 2' },
    ]).then(result => {
      organisation = result.organisationLabels
      orgAdminUser = result.orgAdminUser
      orgMC = result.orgMC
      fixture = result.fixture
      appPage = result.appPage
    })
  })

  describe('when an admin', () => {
    before(() => {
      cy.login(orgAdminUser)
      appPage.visitTaskByName('task 1')

      addHashtagToTask('Ahashtag')
    })
    it('should return METHOD_NOT_ALLOWED', () => {
      cy.login(orgAdminUser).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/merge`,
            method: 'GET',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
      )
    })
    it('should return METHOD_NOT_ALLOWED', () => {
      cy.login(orgAdminUser).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/merge`,
            method: 'PUT',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
      )
    })
    it('should return METHOD_NOT_ALLOWED', () => {
      cy.login(orgAdminUser).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/merge`,
            method: 'PATCH',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
      )
    })
    it('should return METHOD_NOT_ALLOWED', () => {
      cy.login(orgAdminUser).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/merge`,
            method: 'DELETE',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
          })
      )
    })
    it('should return BAD_REQUEST', () => {
      cy.login(orgAdminUser).then(() =>
        cy
          .apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/labels/merge`,
            method: 'POST',
          })
          .then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
      )
    })
  })
})
