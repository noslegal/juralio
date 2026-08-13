import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
    createUser,
    updateFTUE
} from '../../../../helpers/users/user_api_helper'

describe('home_ftue_flow_skip.cy', () => {
  let user, fixture
  before(() => {
    createUser('', true, true, {}, false, false, false, true).then(
      createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'taskmap',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'P1',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      }
    )
  })

  describe('when home is visited', () => {
    before(() => {
      cy.login(user.username)
      updateFTUE(user, { hasSeenTaskmap: false })
      cy.login(user.username) // log in again to refresh status.
      cy.visit('/#/home')
      cy.wait(5000)
    })

    it('should display the home FTUE', () => {
      cy.get('[data-test=home-ftue]').should('be.visible')
    })

    describe('on clicking the skip button', () => {
      before(() => {
        cy.login(user.username)
        cy.get('body').type('{esc}')
        cy.get('[data-test=ftueSkipButton]').click()
      })

      it('should no longer display the taskmap FTUE', () => {
        cy.get('[data-test=home-ftue]').should('not.exist')
      })

      describe('reloading the page', () => {
        before(() => {
          cy.login(user.username)
          cy.reload()
        })

        it('should not display the taskmap FTUE', () => {
          cy.get('[data-test=home-ftue]').should('not.exist')
        })
      })
    })
  })
})
