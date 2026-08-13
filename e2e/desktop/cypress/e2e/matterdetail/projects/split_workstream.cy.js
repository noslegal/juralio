import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'

const {
  createUser,
  updateFTUE,
} = require('../../../../../helpers/users/user_api_helper')

describe('split_workstream.cy', () => {
  let user, fixture, appPage
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'split_workstream.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'pro1',
              tasks: [{ name: 'T1' }],
            },
            {
              name: 'pro2',
              tasks: [{ name: 'T2' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when visiting the matter admin page', () => {
    before(() => {
      cy.login(user)
      appPage.visitMatter()
      cy.wait(3000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
    })
    it('should show 2 options', () => {
      cy.get('[data-test=split-workstream]').should('be.visible')
      cy.get('[data-test=blank-workstream]').should('be.visible')
    })
  })
  describe('when creating a workstream from existing tasks', () => {
    before(() => {
      cy.get('[data-test=split-workstream]').click()
    })
    it('should open a dialog', () => {
      cy.get('[data-test=dialog-header-title-text]').should(
        'contain.text',
        'Create a workstream'
      )
    })

    describe('when picking a workstream to split', () => {
      before(() => {
        cy.get('[data-test=split-workstream-select]').click()
      })
      it('should have 3 options', () => {
        cy.get('li')
          .eq(3)
          .should('contain.text', 'Select a workstream to split')
        cy.get('li').eq(4).should('contain.text', 'pro1')
        cy.get('li').eq(5).should('contain.text', 'pro2')
        cy.get('li').eq(4).click()
      })
      it('should validate the workstream name', () => {
        cy.get('[data-test=workstream-name]')
          .find('input')
          .clear()
          .type('pro1{enter}')
        cy.get('p').should(
          'contain.text',
          'Workstream name must be unique within the matter.'
        )
      })

      describe('when picking the tasks to split off', () => {
        before(() => {
          cy.get('[data-test=workstream-name]')
            .find('input')
            .clear()
            .type('new workstream{enter}')

          cy.wait(5000) // Detached DOM.

          cy.get('[data-test=task-cell-test]')
            .eq(0)
            .click({ timeout: 10000, force: true })

          cy.backendRoute('POST', 'matter/*/workstreams/*/task/*/move').as(
            'workstreamSplit'
          )
          cy.get('[data-test=confirm-selection-button]').click()
          cy.wait('@workstreamSplit', { timeout: 10000 })
        })
        it('should create the new workstream', () => {
          cy.get('[data-test=task-cell-test]').should('have.length', 1)
        })
        describe('when visiting the original workstream', () => {
          before(() => {
            cy.login(user)
            appPage.visitTaskMap()
            // cy.get('body').click()
          })
          it('should create the new workstream', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 0)
          })
        })
      })
    })
  })
})
