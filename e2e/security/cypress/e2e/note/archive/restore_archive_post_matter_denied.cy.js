/*
Purpose: Tests Posts are protected cross-matter and organisation.

Test flow:  Create two orgs, one with archived post and then attempt to unarchive from the other.


Date created: 07/12/2021
*/
import HttpStatus from 'http-status-codes'
import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import {
    addNoteToTask,
    archivePost,
    restorePost
} from '../../../../../helpers/matterprojects/task_api_helper'

describe('restore_archive_post_matter_denied.cy', () => {
  let organisation1, orgAdminUser1, orgMC1, fixture1, post1
  let organisation2, orgAdminUser2, orgMC2, fixture2

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
      )
        .then(result => {
          post1 = result

          archivePost(
            fixture1.matter.id,
            fixture1.projects[0].id,
            fixture1.tasks[0].id,
            post1.id
          )
        })
        .then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
    })
    setupOrganisationWithMatter(true, [{ name: 'task 2' }]).then(result => {
      organisation2 = result.organisationLabels
      orgAdminUser2 = result.orgAdminUser
      orgMC2 = result.orgMC
      fixture2 = result.fixture
    })
  })

  describe('When another organisation user attempts to restore the archived post to a new location', () => {
    before(() => {
      cy.login(orgMC2.username)
    })

    it('denies the restore', () => {
      const newLocation = {
        matterId: fixture2.matter.id,
        projectId: fixture2.projects[1].id,
        taskId: fixture2.tasks[1].id,
      }
      restorePost(fixture2.matter.id, post1.id, newLocation, true).then(
        response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        }
      )
    })
  })

  describe('When another organisation user attempts to restore the archived post to the previous location', () => {
    before(() => {
      cy.login(orgMC2.username)
    })

    it('denies the restore', () => {
      const newLocation = {
        matterId: fixture1.matter.id,
        projectId: fixture1.projects[0].id,
        taskId: fixture1.tasks[0].id,
      }
      restorePost(fixture2.matter.id, post1.id, newLocation, false).then(
        response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        }
      )
    })
  })

  describe('When another organisation user attempts to restore the archived post to a new location', () => {
    before(() => {
      cy.login(orgAdminUser2.username)
    })

    it('denies the restore', () => {
      const newLocation = {
        matterId: fixture2.matter.id,
        projectId: fixture2.projects[1].id,
        taskId: fixture2.tasks[1].id,
      }
      restorePost(fixture2.matter.id, post1.id, newLocation, true).then(
        response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        }
      )
    })
  })

  describe('When another organisation admin attempts to restore the archived post to the previous location', () => {
    before(() => {
      cy.login(orgAdminUser2.username)
    })

    it('denies the restore', () => {
      const newLocation = {
        matterId: fixture1.matter.id,
        projectId: fixture1.projects[0].id,
        taskId: fixture1.tasks[0].id,
      }
      restorePost(fixture2.matter.id, post1.id, newLocation, false).then(
        response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        }
      )
    })
  })
})
