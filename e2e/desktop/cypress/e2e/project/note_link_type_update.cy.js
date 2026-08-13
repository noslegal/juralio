import { populateLinkDetails } from '../../../../helpers/links/task_content_links_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('note_link_type_update.cy', () => {
  let appPage, fixture, testUser
  const types = [
    'Word document',
    'Excel sheet',
    'Powerpoint',
    'Email',
    'Web link',
    'Document',
  ]
  before(() => {
    createUser()
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'A workstream',
                tasks: [{ name: 'task A' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
      })
  })
  describe('after creating a new post', () => {
    before(() => {
      cy.login(testUser)
      appPage.visitTaskByName('task A')

      for (let i = 0; i < 2; i++) {
        cy.get('[data-test=fab-button]').click()
        cy.wait(5000)
        cy.get('[data-test=create-post-fab-button]').click()
        cy.get('[data-test=web-link]').click()
        // cy.wait(3000)
        populateLinkDetails('New Link', 'https://' + i + '.com', 'link')
        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
          'postNote'
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postNote')
      }
      for (let i = 0; i < 2; i++) {
        cy.get('[data-test=fab-button]').click()
        cy.wait(5000)

        cy.get('[data-test=create-post-fab-button]').click()
        cy.get('[data-test=document-link]').click()
        // cy.wait(3000)
        populateLinkDetails('New Link', 'https://' + i + '.com', 'link')
        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/posts').as(
          'postNote'
        )
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postNote')
      }

      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)

      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=blank-note]').click()
      cy.wait(3000)

      cy.get('[data-test=fab-button]').click()
      cy.wait(5000)

      cy.get('[data-test=create-post-fab-button]').click()
      cy.get('[data-test=meeting-note]').click()

      cy.wait(3000)
      cy.get('[data-test=task-content-header-menu-close-button]').click({
        force: true,
      })
    })
    it('should make 6 posts', () => {
      cy.get('[data-test=note-list-item]').should('have.length', '6')
    })
    describe('when looking at a meeting note', () => {
      before(() => {
        cy.get('[data-test=note-list-item]').eq(0).click()
      })
      it('should not render the type dropdown', () => {
        cy.get('[data-test=link-type-dropdown]').should('not.exist')
      })
    })
    describe('when looking at a blank note', () => {
      before(() => {
        cy.get('[data-test=note-list-item]').eq(0).click({ force: true })
      })
      it('should not render the type dropdown', () => {
        cy.get('[data-test=link-type-dropdown]').should('not.exist')
      })
    })
    for (let i = 1; i < 5; i++) {
      describe('when looking at a link note', () => {
        before(() => {
          cy.get('[data-test=note-list-item]').eq(i).click({ force: true })
          cy.wait(1000)
        })
        it('should not render the type dropdown', () => {
          cy.get('[data-test=link-type-dropdown]').should('exist')
        })
        describe('picking a new type', () => {
          before(() => {
            cy.get('[data-test=link-type-dropdown]').click()
            cy.get('[data-test=link-type-option]')
              .eq(i - 1)
              .click({ force: true })
          })
          it('should update', () => {
            cy.get('[data-test=link-type-dropdown]').should(
              'contain.text',
              types[i - 1]
            )
          })
        })
      })
    }
  })
})
