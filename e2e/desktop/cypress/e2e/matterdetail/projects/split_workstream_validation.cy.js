import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'

const {
  createUser,
  updateFTUE,
} = require('../../../../../helpers/users/user_api_helper')

describe('split_workstream_validation.cy', () => {
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
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.wait(2000)
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=split-workstream]').click()
    })
    describe('when filling in the name field, without selecting a workstream', () => {
      before(() => {
        cy.get('[data-test=workstream-name]')
          .find('input')
          .clear()
          .type('pro1{enter}')
      })
      it('should have the create button disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })
      after(() => {
        cy.get('[data-test=workstream-name]').find('input').clear()
      })
    })

    describe('when selecting a workstream, and filling in the name field with the name of an existing workstream', () => {
      before(() => {
        cy.get('[data-test=workstream-name]').find('input').type('pro1')
        cy.get('[data-test=split-workstream-select]').click()
        cy.get('li').eq(5).click()
      })
      it('should have the create button enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.enabled')
      })
      describe('when clicking create', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should validate the workstream name', () => {
          cy.get('p').should(
            'contain.text',
            'Workstream name must be unique within the matter.'
          )
        })
      })
      after(() => {
        cy.get('[data-test=workstream-name]').find('input').clear()
      })
    })
    describe('when selecting a workstream, and filling in the name field with a unique workstream name', () => {
      before(() => {
        cy.get('[data-test=workstream-name]')
          .find('input')
          .type('new workstream')
      })
      it('should not show the validation message anymore', () => {
        cy.get('p').should(
          'not.contain.text',
          'Workstream name must be unique within the matter.'
        )
      })
      it('should have the create button enabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.enabled')
      })
    })
  })
})
