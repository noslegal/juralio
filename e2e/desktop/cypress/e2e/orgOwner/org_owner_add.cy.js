//user can be marked as org owner
//shows up in the table
//remove role
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createDefaultOrgTestUsers } from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../helpers/users/user_api_helper'

let orgUsers, otherOrgUsers, fixture, externalUser
const visitHelpers = new VisitHelpers()

describe('org_owner_add.cy', () => {
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.matterAdmin,
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'workstream',
                properties: {},
              },
              {
                name: 'public workstream',
                tasks: [{ name: 'new task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('when an org admin', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createUser('externalUser', true, false, {
        organisation: { id: DEFAULT_ORGANISATION_ID },
        isExternal: true,
      }).then(u2 => {
        externalUser = u2
      })
      cy.login(orgUsers.matterAdmin.username)

      visitHelpers.visitOrgUsers()
      cy.get('[data-rowindex=1] [data-colindex=0]', {
        timeout: 30000,
      }).click()
    })
    it('should not offer org owner', () => {
      cy.get('[data-test=org-owner-checkbox]').should('not.exist')
    })
  })
  describe('when an sys admin', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.visit('/#/')
      cy.get('[data-test=accounts]').click()
      cy.get('[data-test=search-button]').click()
      cy.get('[data-test=Search]')
        .type(orgUsers.matterAdmin.username)
      cy.get('[data-rowindex=0] [data-colindex=0]', {
        timeout: 3000,
      }).click()
    })
    it('should offer org owner', () => {
      cy.get('[data-test=org-owner-checkbox]').should('exist')
    })
    describe('when setting an org owner', () => {
      before(() => {
        cy.get('[data-test=org-owner-checkbox]').click()
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should update the table', () => {
        cy.get('[data-test=user-name-text]').should('contain.text', '(owner)')
      })
      describe('when removing the owner', () => {
        before(() => {
          cy.get('[data-rowindex=0] [data-colindex=0]', {
            timeout: 3000,
          }).click()
          cy.get('[data-test=org-owner-checkbox]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should update the table', () => {
          cy.get('[data-test=user-name-text]').should(
            'not.contain.text',
            '(owner)'
          )
        })
      })
    })
    describe('when trying to add an external user as on org owner', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.visit('/#/')
        cy.get('[data-test=accounts]').click()
        cy.get('[data-test=search-button]').click()
        cy.get('[data-test=Search]')
          .type(externalUser.username)
        cy.get('[data-rowindex=0] [data-colindex=0]', {
          timeout: 3000,
        }).click()
      })
      it('should not offer org owner', () => {
        cy.get('[data-test=org-owner-checkbox]').should('not.exist')
      })
    })
  })
})
