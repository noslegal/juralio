import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('authors_private_post.cy', () => {
  let teamMember, anotherTeamMember, nonTeamMember, fixture
  let org2, org2Admin, otherOrgUser1

  before(() => {
    createUser().then(createdUser => {
      anotherTeamMember = createdUser
      createUser()
        .then(createdUser => {
          nonTeamMember = createdUser
        })
        .then(createUser)
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [teamMember, anotherTeamMember],
              matterAdmins: [teamMember],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [{ name: 'Task' }],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })

    const setupOrg1Data = () => {
      const createOrg1 = () =>
        createOrganisation('test', false).then(
          response => (org2 = response.body)
        )
      const createOrgAdmin1 = () =>
        createUser(undefined, true, false, { roles: ['ROLE_ORG_ADMIN'] }).then(
          response => (org2Admin = response)
        )
      const assignOrgAdminToOrg1 = () =>
        sysadminAddUserToOrganisation(org2, org2Admin)
      const createStandardUser1 = () =>
        createUser(undefined, true, false).then(
          response => (otherOrgUser1 = response)
        )

      const assignStandardUser1ToOrg1 = () =>
        sysadminAddUserToOrganisation(org2, otherOrgUser1)

      createOrg1()
        .then(createOrgAdmin1)
        .then(assignOrgAdminToOrg1)
        .then(createStandardUser1)
        .then(assignStandardUser1ToOrg1)
    }

    setupOrg1Data()
  })

  describe('when trying to update a private note on a Task', () => {
    let note

    const getRemoveUrl = (taskIndex = 0) =>
      `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}/task/${
        fixture.tasks[taskIndex].id
      }/post/${note.id}/authors/`

    before(() => {
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'Notey note', description: 'A test note.' }
      ).then(result => {
        note = result

        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/post/${note.id}`,
          method: 'PATCH',
          body: { privatePost: true },
        })
      })
    })

    describe('When removing an author by non-author', () => {
      it('should return FORBIDDEN for a MTM', () => {
        cy.login(anotherTeamMember.username)
        cy.apiSpecRequest({
          url: `${getRemoveUrl()}${teamMember.id}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN for a non-TM', () => {
        cy.login(nonTeamMember.username)
        cy.apiSpecRequest({
          url: `${getRemoveUrl()}${teamMember.id}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })

      it('should return FORBIDDEN for a non-Org member', () => {
        cy.login(otherOrgUser1.username)
        cy.apiSpecRequest({
          url: `${getRemoveUrl()}${teamMember.id}`,
          method: 'DELETE',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
