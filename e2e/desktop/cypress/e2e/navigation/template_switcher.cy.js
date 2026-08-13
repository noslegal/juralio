import { createMatter } from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let kmUser, regularUser, org, project
let publishedTemplate, draftTemplate
const visitHelpers = new VisitHelpers()

describe('template_switcher.cy', () => {
  before(() => {
    createUser(
      undefined,
      true,
      false,
      { roles: ['ROLE_KNOWLEDGE_MANAGER', 'ROLE_MATTER_CREATOR'] },
      false,
      false,
      false,
      true
    )
      .then(user => (kmUser = user))
      .then(() => createOrganisation('', false))
      .then(o => {
        org = o.body
        return sysadminAddUserToOrganisation(org, kmUser)
          .then(() =>
            createUser('', true, false, {}, false, false, false, true)
          )
          .then(u => {
            regularUser = u
            return sysadminAddUserToOrganisation(org, regularUser)
          })
      })
      .then(() => {
        cy.login(kmUser)
        return createMatter('test', kmUser)
          .then(matter => createProject(matter.id, 'proj'))
          .then(p => {
            project = p
            return createTemplate('Org Template A', project.id)
              .then(t => {
                publishedTemplate = t
                return publishTemplate(t.id)
              })
              .then(() => createTemplate('Org Draft Template', project.id))
              .then(t => {
                draftTemplate = t
              })
          })
      })
  })

  describe('as a knowledge manager', () => {
    before(() => {
      cy.login(kmUser)
      visitHelpers.visitHome()
      cy.get('[data-test=close-icon]').click()
      cy.get('[data-test=ftueSkipButton]').click()
    })

    it('should open the template switcher when clicking the nav button', () => {
      cy.get('[data-test=template-switcher-button]').click()
      cy.get('[data-test=template-switcher-mask]').should('be.visible')
      cy.get('[data-test=template-switcher-list]').should('be.visible')
    })

    it('should display all templates in the list', () => {
      cy.get('[data-test=template-switcher-template-item]').should(
        'have.length',
        2
      )
    })

    it('should show the draft chip on unpublished templates', () => {
      cy.get('[data-test=template-switcher-template-item]')
        .filter(':contains("Org Draft Template")')
        .should('contain.text', 'Draft')
    })

    it('should show the create template button', () => {
      cy.get('[data-test=create-new-template-card]').should('be.visible')
    })

    describe('when filtering by organisation type', () => {
      before(() => {
        cy.login(kmUser)
        cy.get('[data-test=template-switcher-type-filter]').click()
        cy.get('[data-test=template-type-filter-organisation]').click()
      })

      it('should show only org templates', () => {
        cy.get('[data-test=template-switcher-template-item]').should(
          'have.length',
          2
        )
      })
    })

    describe('when filtering by community type', () => {
      before(() => {
        cy.get('[data-test=template-switcher-type-filter]').click()
        cy.get('[data-test=template-type-filter-community]').click()
      })

      it('should show only community templates', () => {
        cy.get('[data-test=template-switcher-template-item]').should(
          'have.length',
          0
        )
      })
    })

    describe('when resetting to all templates', () => {
      before(() => {
        cy.get('[data-test=template-switcher-type-filter]').click()
        cy.get('[data-test=template-type-filter-all]').click()
      })

      it('should show all templates again', () => {
        cy.get('[data-test=template-switcher-template-item]').should(
          'have.length',
          2
        )
      })
    })

    describe('when using the search filter', () => {
      before(() => {
        cy.get('[data-test=template-switcher-filter]')
          .find('input')
          .type('Org Template A')
      })

      it('should filter templates by name', () => {
        cy.get('[data-test=template-switcher-template-item]').should(
          'have.length',
          1
        )
        cy.get('[data-test=template-switcher-template-item]').should(
          'contain.text',
          'Org Template A'
        )
      })

      after(() => {
        cy.get('[data-test=template-switcher-filter]').find('input').clear()
      })
    })

    describe('when clicking a template', () => {
      before(() => {
        cy.get('[data-test=template-switcher-template-item]').first().click()
      })

      it('should navigate to the template overview and close the switcher', () => {
        cy.url().should('include', '/template/')
        cy.url().should('include', '/overview')
        cy.get('[data-test=template-switcher-mask]').should('not.exist')
      })
    })

    describe('when clicking the go to gallery link', () => {
      before(() => {
        cy.login(kmUser)
        visitHelpers.visitHome()
        cy.get('[data-test=template-switcher-button]').click()
        cy.get('[data-test=template-switcher-go-to-gallery]').click()
      })

      it('should navigate to the templates gallery and close the switcher', () => {
        cy.url().should('include', '/templates')
        cy.get('[data-test=template-switcher-mask]').should('not.exist')
      })
    })

    describe('when clicking the mask', () => {
      before(() => {
        cy.login(kmUser)
        visitHelpers.visitHome()
        cy.get('[data-test=template-switcher-button]').click()
        cy.get('[data-test=template-switcher-mask]').click({ force: true })
      })

      it('should close the template switcher', () => {
        cy.get('[data-test=template-switcher-mask]').should('not.exist')
      })
    })

    describe('when pressing escape', () => {
      before(() => {
        cy.login(kmUser)
        visitHelpers.visitHome()
        cy.get('[data-test=template-switcher-button]').click()
        cy.get('[data-test=template-switcher-mask]').should('be.visible')
        cy.get('body').type('{esc}')
      })

      it('should close the template switcher', () => {
        cy.get('[data-test=template-switcher-mask]').should('not.exist')
      })
    })
  })

  describe('as a regular user', () => {
    before(() => {
      cy.login(regularUser)
      visitHelpers.visitHome()
      cy.get('[data-test=close-icon]').click()
      cy.get('[data-test=ftueSkipButton]').click()
      cy.get('[data-test=template-switcher-button]').click()
    })

    it('should open the template switcher', () => {
      cy.get('[data-test=template-switcher-mask]').should('be.visible')
    })

    it('should not show the create template button', () => {
      cy.get('[data-test=create-new-template-card]').should('not.exist')
    })

    it('should not show draft templates from other users', () => {
      cy.get('[data-test=template-switcher-template-item]').should(
        'have.length',
        1
      )
    })
  })
})
