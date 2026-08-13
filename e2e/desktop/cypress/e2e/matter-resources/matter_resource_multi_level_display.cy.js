//view workstream from matter
//view matter from workstream
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

describe('matter_resource_multi_level_display.cy', () => {
  let user, user2, fixture, resource
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser('other user', undefined, false).then(createdUser => {
      user2 = createdUser
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
      createUser().then(createdUser => {
        user = createdUser
        updateFTUE(user, { hasSeenMatterAdmin: true })
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user],
            matterAdmins: [user, user2],
            projects: [{ name: 'a' }],
          },
        }
        fixture = generateFixture(seed)
      })
    })
  })
  describe('when visiting with no resorces', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.get('[data-test=menuItem]', { timeout: 30000 }).eq(2).click()
    })
    it('shold show the zero state', () => {
      cy.get('[data-test=resource-count]').should('have.text', '0 Resources')
      cy.get('[data-test=info-icon]').should('be.visible')
    })
    describe('when adding a resource', () => {
      before(() => {
        cy.get('[data-test=add-resource-button]').click()
        cy.get('[data-test=add-resource-name]')
          .find('input')
          .type('test resource')
        cy.get('[data-test=link-url]').find('input').type('https://google.com')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(5000)
      })
      it('should add the resource', () => {
        cy.get('[data-test=card-carousel]').should('have.length', 2)
        cy.get('[data-test=card-carousel]')
          .eq(1)
          .find('[data-test=card]')
          .should('have.length', 1)
        cy.get('[data-test=card-carousel]')
          .eq(1)
          .find('[data-test=card]')
          .find('[data-test=card-name]')
          .should('have.text', 'test resource')
        cy.get('[data-test=card-carousel]')
          .eq(1)
          .find('[data-test=card]')
          .find('[data-test=card-url]')
          .should('have.text', 'https://google.com')
      })
      describe('when splitting the single workstream', () => {
        before(() => {
          cy.get('[data-test=go-to-matter-admin]').click()
          cy.get('[data-test=create-new-workstream]').click()
          cy.wait(1000)
          cy.get('[data-test=workstream-name]').eq(0).find('input').type('1')
          cy.wait(1000)
          cy.get('[data-test=workstream-name]').eq(1).find('input').type('2')
          cy.wait(1000)
          cy.get('[data-test=blank-workstream]').click()
          cy.wait(1000)

          cy.get('[data-test=action-dialog-button]').click()
          cy.login(user.username)
          visitHelpers.visitMatterOverview(fixture.matter.id)
          cy.get('[data-test=menuItem]', { timeout: 30000 }).eq(2).click()
        })
        it('should keet it as a matter resource', () => {
          cy.get('[data-test=card-carousel]').should('have.length', 2)
          cy.get('[data-test=card-carousel]')
            .eq(1)
            .find('[data-test=card]')
            .should('have.length', 1)
          cy.get('[data-test=card-carousel]')
            .eq(1)
            .find('[data-test=card]')
            .find('[data-test=card-name]')
            .should('have.text', 'test resource')
          cy.get('[data-test=card-carousel]')
            .eq(1)
            .find('[data-test=card]')
            .find('[data-test=card-url]')
            .should('have.text', 'https://google.com')
        })
        it('should not offer workstream resources', () => {
          cy.get('[data-test=documents-panel-switch]').should('not.exist')
        })
        describe('when visiting the workstream', () => {
          before(() => {
            cy.login(user.username)
            visitHelpers.visitProjectOverview(
              fixture.matter.id,
              fixture.projects[0].id
            )
            cy.get('[data-test=menuItem]', { timeout: 30000 }).eq(2).click()
          })

          it('should have the matter view toggle', () => {
            cy.get('[data-test=documents-panel-switch]').should('exist')
          })
          describe('when clicking the toggle', () => {
            before(() => {
              cy.get('[data-test=documents-panel-switch]').click()
            })
            it('should show the matter resources', () => {
              cy.get('[data-test=card]').should('have.length', 1)
            })
            describe('when adding a workstream resource', () => {
              before(() => {
                cy.get('[data-test=add-resource-button]').click()
                cy.get('[data-test=add-resource-name]')
                  .find('input')
                  .type('workstream resource')
                cy.get('[data-test=link-url]')
                  .find('input')
                  .type('https://google.com')
                cy.get('[data-test=action-dialog-button]').click()
                cy.login(user.username)
                visitHelpers.visitMatterOverview(fixture.matter.id)
                cy.get('[data-test=menuItem]', { timeout: 30000 }).eq(2).click()
                cy.get('[data-test=documents-panel-switch]').click()
              })
              it('should be viewable at the matter level', () => {
                cy.get('[data-test=card]').should('have.length', 3)
              })
            })
          })
        })
      })
    })
  })
})
