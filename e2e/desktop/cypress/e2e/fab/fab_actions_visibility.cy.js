import {
    generateFixture, getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('fab_actions_visibility.cy', () => {
  let fixture, user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'fab_actions_contextual.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [],
        },
      }
      fixture = generateFixture(seed)
      getWrapper(fixture)
    })
  })

  describe('when the global FAB button is clicked', () => {
    function clickGlobalFab() {
      cy.login(user.username)
      cy.visit('/#/home')
      cy.get('[data-test=fab-button]').click()
    }

    before(() => {
      clickGlobalFab()
    })

    it('the FAB actions should be displayed', () => {
      cy.get('[data-test=fab-actions]').should('be.visible')
    })

    describe('when the user clicks another part of the page', () => {
      before(() => {// cy.get('body').click())

      it('the actions should close and NOT be displayed', () => {
        cy.get('[data-test=fab-actions]').should('not.be.visible')
      })
    })

    describe('when the user clicks one of the actions', () => {
      before(() => {
        // cy.get('body').click()

        clickGlobalFab()
        cy.wait(5000)
        cy.get('[data-test=create-task-button]', { timeout: 30000 }).click()
      })

      it('the actions should close and NOT be displayed', () => {
        cy.get('[data-test=fab-actions]').should('not.be.visible')
      })
    })
  })
})
})