import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../helpers/users/user_api_helper'

let externalUser, fixture, orgUsers, otherOrgUsers, template, post

describe('external_user_connversion_role_dropoff.cy', () => {
  const visitHelper = new VisitHelpers()
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
    createUser('', true, false, { isExternal: false }).then(u => {
      externalUser = u
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, u).then(
        () => {
          const seed = {
            matter: {
              prefix: 'Matter',
              teamMembers: [
                orgUsers.teamMember,
                orgUsers.matterAdminAndTeamMember,
                orgUsers.knowledgeManager,
              ],
              matterAdmins: [
                orgUsers.matterAdmin,
                orgUsers.matterAdminAndTeamMember,
              ],
              projects: [
                {
                  name: 'Project',
                  tasks: [{ name: 'task 1' }, { name: 'task 2' }],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        }
      )
    })
  })

  describe('when converting an internal user to extenral with no roles', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelper.visitHome(false)
      cy.get('[data-test=accounts]').click()
      cy.get('[data-test=search-button]').click()
      cy.get('[data-test=Search]').type(externalUser.username)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=external-radio-button]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
    })
    it('should work first time', () => {
      cy.get('[data-test=form-dialog-title]').should('not.exist')
    })
  })
  describe('when converting an unternal user to external when they have some roles', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelper.visitHome(false)
      cy.get('[data-test=accounts]').click()
      cy.get('[data-test=search-button]').click()
      cy.get('[data-test=Search]').type(externalUser.username)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=internal-radio-button]').click()
      cy.get('[data-test=org-admin-checkbox]').click()
      cy.get('[data-test=matter-creator-checkbox]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=external-radio-button]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
    })
    it('should show a confirmatio ndialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'have.text',
        'Change from Full to Limited'
      )
    })
    describe('when confirming', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').eq(1).click()
        cy.wait(5000)
      })
      it('should work first time', () => {
        cy.get('[data-test=form-dialog-title]').should('not.exist')
      })
    })
  })
  describe('when converting an internal user to external when they have some roles', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelper.visitHome(false)
      cy.get('[data-test=accounts]').click()
      cy.get('[data-test=search-button]').click()
      cy.get('[data-test=Search]').type(externalUser.username)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=internal-radio-button]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
      //add to a matter

      cy.login('sysadmin@juralio.com', 'Password1Password1$')

      cy.reload()
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelper.visitHome(false)
      cy.get('[data-test=accounts]').click()
      cy.get('[data-test=search-button]').click()
      cy.get('[data-test=Search]')
        .type(orgUsers.matterAdmin.username)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=external-radio-button]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
    })
    it('should show a confirmatio ndialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'have.text',
        'Change from Full to Limited'
      )
    })
    describe('when confirming', () => {
      before(() => {
        cy.get('[data-test=action-dialog-button]').eq(1).click()
        cy.wait(5000)
      })
      it('should work first time', () => {
        cy.get('[data-test=form-dialog-title]').should('not.exist')
      })
    })
  })
})
