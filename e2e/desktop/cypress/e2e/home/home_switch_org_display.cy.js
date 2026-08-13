import { visitGlobalUsers } from '../../../../helpers/admin/admin_visit_helpers'
import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'

const { createUser } = require('../../../../helpers/users/user_api_helper')

describe('home_switch_org_display.cy', () => {
  let user, fixture, appPage, org_1
  before(() => {
    createUser('', true, true, {}, true, false, false)
      .then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefex: 'home_switch_org_display.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'task1', teamMembers: [user] }],
              },
              {
                name: 'Project 2',
                tasks: [
                  { name: 'task2', teamMembers: [user] },
                  { name: 'task3' },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => createOrganisation('test', false))
      .then(o => {
        org_1 = o.body
      })
      .then(createOrganisation)
      .then(o => {
        org_2 = o.body
      })
  })
  describe('when logged in as a user', () => {
    before(() => {
      cy.login(user)

      appPage.visitHome()
    })
    it('should show my matters', () => {
      cy.get('[data-test=workstream-chip-title]').should('have.length', 2)
      cy.get('[data-test=workstream-chip-title]')
        .eq(0)
        .should('have.text', 'Project 1')
      cy.get('[data-test=workstream-chip-title]')
        .eq(1)
        .should('have.text', 'Project 2')
    })
    describe('when looking at templates', () => {
      before(() => {
        cy.login(user)
        createTemplate('P1', fixture.projects[0].id)
        createTemplate('P2', fixture.projects[1].id)
        appPage.visitTemplates()
      })
      it('should show my templates', () => {
        cy.get('[data-test=template-name]').eq(0).should('have.text', 'P2')
        cy.get('[data-test=template-name]').eq(1).should('have.text', 'P1')
      })
      describe('when moved between orgs', () => {
        before(() => {
          cy.logoutServerSide()
          cy.reload()
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          visitGlobalUsers()
          cy.get('[data-test=search-button]', { timeout: 30000 }).click()
          cy.get('[data-test=Search]').type(user.username)
          cy.get('[data-test=table-user-column]').eq(0).click()
          cy.get('[data-test=organisation-selector]').click()
          cy.get(`[data-test=organisation-selection-${org_1.id}]`).click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(5000)
          cy.logoutServerSide()
          cy.reload()
        })
        describe('when logged in as a user', () => {
          before(() => {
            cy.login(user).then(() => {
              cy.reload()
              appPage.visitHome(false)
            })
          })
          it('should not show my matters', () => {
            cy.get('[data-test=workstream-chip-title]').should('have.length', 0)
          })
          describe('when looking at templates', () => {
            before(() => {
              cy.login(user)
              appPage.visitTemplates()
            })
            it('should not show my templates', () => {
              cy.get('[data-test=template-name]').should('have.length', 0)
            })
          })
        })
      })
    })
  })
})
