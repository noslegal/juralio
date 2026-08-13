import { createMatter } from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createSystemLevelTemplate,
  createTemplate,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let user1, user2, org, project
const visitHelpers = new VisitHelpers()
describe('template_gallery_filter_display.cy', () => {
  before(() => {
    createUser(
      undefined,
      true,
      false,
      {
        roles: ['ROLE_KNOWLEDGE_MANAGER', 'ROLE_MATTER_CREATOR'],
      },
      false,
      false,
      false,
      true
    )
      .then(user => (user1 = user))
      .then(() => createOrganisation('', false))
      .then(o => {
        org = o.body
        createUser('', true, false).then(u2 => {
          sysadminAddUserToOrganisation(org, user1)
          sysadminAddUserToOrganisation(org, u2)
          user2 = u2
        })
      })
  })
  describe('as a knowlegde manager', () => {
    before(() => {
      cy.login(user1)
      createMatter('test', user1).then(matter => {
        createProject(matter.id, 'prioj').then(p => {
          project = p
          createTemplate('T1', project.id).then(t => {
            publishTemplate(t.id)
          })
          createTemplate('T2', project.id).then(t => {
            publishTemplate(t.id)
          })
          createSystemLevelTemplate('system template').then(st => {
            publishTemplate(st.id)
          })
          cy.login(user1)
          createTemplate('T4', project.id)
          visitHelpers.visitTemplates()
          cy.get('[data-test=close-icon]').click()
          cy.get('[data-test=ftueSkipButton]').click()
        })
      })
    })

    it('should allow me to filter by all templates', () => {
      cy.get('[data-test=template]').should('have.length', 4)
    })
    describe('when filtering by org templates', () => {
      before(() => {
        cy.get('[data-test=template-filter-button]').click()
        cy.get('[data-test=template-filter-organisation]').click()
      })
      it('should allow me to filter by organisation templates', () => {
        cy.get('[data-test=template]').should('have.length', 3)
      })
    })
    describe('when filtering by community templates', () => {
      before(() => {
        cy.get('[data-test=template-filter-button]').click()
        cy.get('[data-test=template-filter-community]').click()
      })
      it('should allow me to filter by community templates', () => {
        cy.get('[data-test=template]').should('have.length', 1)
      })
    })
    describe('when filtering by draft templates', () => {
      before(() => {
        cy.get('[data-test=template-filter-button]').click()
        cy.get('[data-test=template-filter-drafts]').click()
      })
      it('should allow me to filter by draft templates', () => {
        cy.get('[data-test=template]').should('have.length', 1)
      })
    })
  })
  describe('as a regular user', () => {
    before(() => {
      cy.login(user2)
      visitHelpers.visitTemplates()
      cy.get('[data-test=close-icon]').click()
      cy.get('[data-test=ftueSkipButton]').click()
    })

    it('should allow me to filter by all templates', () => {
      cy.get('[data-test=template]').should('have.length', 3)
    })
    describe('when filtering by org templates', () => {
      before(() => {
        cy.get('[data-test=template-filter-button]').click()
        cy.get('[data-test=template-filter-organisation]').click()
      })
      it('should allow me to filter by organisation templates', () => {
        cy.get('[data-test=template]').should('have.length', 2)
      })
    })
    describe('when filtering by community templates', () => {
      before(() => {
        cy.get('[data-test=template-filter-button]').click()
        cy.get('[data-test=template-filter-community]').click()
      })
      it('should allow me to filter by community templates', () => {
        cy.get('[data-test=template]').should('have.length', 1)
      })
    })
    describe('when filtering by draft templates', () => {
      before(() => {
        cy.get('[data-test=template-filter-button]').click()
      })
      it('should not  allow me to filter by draft templates', () => {
        cy.get('[data-test=template-filter-drafts]').should('not.exist')
      })
    })
  })
  describe('when usign the search filter', () => {
    before(() => {
      cy.login(user2)
      visitHelpers.visitTemplates()

      cy.get('[data-test=search-filter]').find('input').type('T2')
    })
    it('should filter the templates', () => {
      cy.get('[data-test=template]').should('have.length', 1)
    })
  })
})
