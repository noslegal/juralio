import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { addMatterViewer } from '../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { sysadminAddUserToOrganisation } from '../../../../helpers/organisation/organisation_api_helper'
import {
  createUser,
  DEFAULT_ORGANISATION_ID,
} from '../../../../helpers/users/user_api_helper'

const clickAndWaitForResourceAdd = () => {
  cy.backendRoute('POST', '/matter/*/resources').as('resourceAdd')
  cy.get('[data-test=action-dialog-button]').click()
  cy.wait('@resourceAdd')
  cy.wait(3000)
}

describe('matter_resources_display.cy', () => {
  let user, user2, fixture, resource
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser('other user', undefined, false).then(createdUser => {
      user2 = createdUser
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
      createUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user],
            matterAdmins: [user, user2],
            projects: [{ name: 'a' }, { name: 'b' }],
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
      cy.get('[data-test=menuItem]', { timeout: 100000 }).eq(2).click()
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
        clickAndWaitForResourceAdd()
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
      describe('after viewing a resource', () => {
        before(() => {
          cy.get('[data-test=add-resource-button]').click()
          cy.get('[data-test=add-resource-name]')
            .find('input')
            .type('test resource 2')
          cy.get('[data-test=link-url]')
            .find('input')
            .type('https://google.com')
          clickAndWaitForResourceAdd()
          cy.backendRoute('POST', '/matter/*/resources/*').as('resourceClick')
          cy.get('[data-test=card-carousel]')
            .eq(1)
            .find('[data-test=card]')
            .eq(0)
            .click()
          cy.wait('@resourceClick')
          cy.login(user.username)
          visitHelpers.visitMatterOverview(fixture.matter.id)
          cy.wait(2000)
          cy.get('[data-test=menuItem]', { timeout: 100000 }).eq(2).click()
          cy.wait(5000)
        })
        it('should order by visit', () => {
          cy.get('[data-test=card-carousel]')
            .eq(1)
            .find('[data-test=card]')
            .eq(1)
            .find('[data-test=card-name]')
            .should('have.text', 'test resource')
          cy.get('[data-test=card-carousel]')
            .eq(1)
            .find('[data-test=card]')
            .eq(0)
            .find('[data-test=card-name]')
            .should('have.text', 'test resource 2')
        })
        describe('when filtering the resource list by name', () => {
          before(() => {
            cy.get('[data-test=resource-search]')
              .find('input')
              .type('resource 2')
          })
          it('should filter the list', () => {
            cy.get('[data-test=card-carousel]')
              .eq(1)
              .find('[data-test=card]')
              .should('have.length', 1)
          })
          describe('when filtering the resource list by url', () => {
            before(() => {
              cy.get('[data-test=resource-search]')
                .find('input')
                .clear()
                .type('https://google.com')
            })
            it('should filter the list', () => {
              cy.get('[data-test=card-carousel]')
                .eq(1)
                .find('[data-test=card]')
                .should('have.length', 2)
            })
            describe('as a matter viewer', () => {
              before(() => {
                addMatterViewer(fixture.matter.id, user2.id, user.username)
                cy.login(user2.username)
                visitHelpers.visitMatterOverview(fixture.matter.id)
                cy.wait(2000)
                cy.get('[data-test=menuItem]', { timeout: 100000 })
                  .eq(2)
                  .click()
              })
              it('should show the links but disable the add button', () => {
                cy.get('[data-test=card-carousel]').should('have.length', 2)
              })
            })
          })
        })
      })
    })
  })
})
