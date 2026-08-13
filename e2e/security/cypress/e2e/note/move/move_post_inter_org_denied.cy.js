/*
Purpose: Tests that post cannot be moved between orgs.

Test flow:  Create two orgs, one with post and attempt to move.


Date created: 07/12/2021
*/
import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'

describe('move_post_inter_org_denied.cy', () => {
  let organisation1, orgAdminUser1, orgMC1, fixture1, post1
  let organisation2, orgAdminUser2, orgMC2, fixture2
  let url, note

  before(() => {
    setupOrganisationWithMatter(true, [{ name: 'task 1' }]).then(result => {
      organisation1 = result.organisationLabels
      orgAdminUser1 = result.orgAdminUser
      orgMC1 = result.orgMC
      fixture1 = result.fixture
      cy.login(orgMC1.username)
      addNoteToTask(
        fixture1.matter.id,
        fixture1.projects[0].id,
        fixture1.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result
        url = `${Cypress.env('serverBaseUrl')}/matter/${
          fixture1.matter.id
        }/workstreams/${fixture1.projects[0].id}/task/${
          fixture1.tasks[0].id
        }/post/${note.id}/move`
      })
    })
    setupOrganisationWithMatter(true, [{ name: 'task 2' }]).then(result => {
      organisation2 = result.organisationLabels
      orgAdminUser2 = result.orgAdminUser
      orgMC2 = result.orgMC
      fixture2 = result.fixture
    })
  })

  describe('When moving a post to another task', () => {
    it('returns 200', () => {
      cy.login(orgMC1.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: {
          newTaskId: fixture1.tasks[0].id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When moving a post to another organisations task', () => {
    it('returns 403', () => {
      cy.login(orgMC1.username)
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: {
          newTaskId: fixture2.tasks[1].id,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
