import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('post_iframe_notes_display.cy', () => {
  let user, fixture, appPage, template
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser('', true, true, {}, true).then(u => {
      user = u
      const seed = {
        matter: {
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Task 1' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when in a draft iframe post', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=web-link]').click()
      cy.get('[data-test=text-prompt-text-field]')
        .eq(0)
        .find('input')
        .type('iframe link')
      cy.get('[data-test=link-url]')
        .find('input')
        .type(
          'https://docs.google.com/document/d/14_ZGZlPJVgTezFBfHDuD6k7tQqMRSOa0QkpzhIeDDpA/edit'
        )
      cy.get('[data-test=action-dialog-button]').click()
    })
    it('should show the toggle', () => {
      cy.get('[data-test=show-notes-toggle]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
    describe('when published with no notes', () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
          'finalise'
        )
        cy.get('[data-test=finalise-button]').click()
        cy.wait('@finalise')
      })
      it('should not show the toggle', () => {
        cy.get('[data-test=show-notes-toggle]').should('not.exist')
      })
      describe('when published with notes', () => {
        before(() => {
          cy.get('[data-test=finalise-button]').click()
          cy.get('[data-test=show-notes-toggle]').click()
          cy.wait(5000)
          cy.get('[data-test=notes-content-edit-field]')
            .find('[contenteditable]')
            .type('notes!')
          cy.get('[data-test=finalise-button]').click()
        })
        it('should show the toggle', () => {
          cy.get('[data-test=show-notes-toggle]').should('be.visible')
        })
      })
    })
  })
  describe('when in a template draft iframe post', () => {
    before(() => {
      cy.login(user)

      createTemplate('template', fixture.projects[0].id).then(t => {
        template = t
        visitHelpers.visitTemplateTaskDetails(t.id, t.tasks[0].id)
        cy.get('[data-test=create-post-button]').click()
        cy.get('[data-test=web-link]').click()
        cy.get('[data-test=text-prompt-text-field]')
          .eq(0)
          .find('input')
          .type('iframe link')
        cy.get('[data-test=link-url]')
          .find('input')
          .type(
            'https://docs.google.com/document/d/14_ZGZlPJVgTezFBfHDuD6k7tQqMRSOa0QkpzhIeDDpA/edit'
          )
        cy.get('[data-test=action-dialog-button]').click()
      })
    })
    it('should show the toggle', () => {
      cy.get('[data-test=show-notes-toggle]').should('be.visible')
    })
    describe('when published with no notes', () => {
      before(() => {
        cy.backendRoute('PATCH', '/projecttemplates/*/tasks/*/posts/*').as(
          'finalise'
        )
        cy.get('[data-test=finalise-button]').click()
        cy.wait('@finalise')
      })
      it('should not show the toggle', () => {
        cy.get('[data-test=show-notes-toggle]').should('not.exist')
      })
      describe('when published with notes', () => {
        before(() => {
          cy.get('[data-test=finalise-button]').click()
          cy.get('[data-test=show-notes-toggle]').click()
          cy.wait(5000)
          cy.get('[data-test=notes-content-edit-field]')
            .find('[contenteditable]')
            .type('notes!')
          cy.get('[data-test=finalise-button]').click()
        })
        it('should show the toggle', () => {
          cy.get('[data-test=show-notes-toggle]').should('be.visible')
        })
      })
    })
  })
})
