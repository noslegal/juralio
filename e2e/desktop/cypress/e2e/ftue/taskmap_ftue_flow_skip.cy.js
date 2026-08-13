import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
    createUser,
    updateFTUE
} from '../../../../helpers/users/user_api_helper'

describe('taskmap_ftue_flow_skip.cy', () => {
  let user, fixture
  before(() => {
    createUser().then(createdUser => {
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
    })
  })

  describe('when taskmap is visited', () => {
    before(() => {
      cy.login(user.username)
      updateFTUE(user, { hasSeenTaskmap: false })
      cy.login(user.username) // log in again to refresh status.
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap/`
      )
      cy.wait(5000)
    })

    it('should display the taskmap FTUE', () => {
      cy.get('[data-test=taskmap-ftue]').should('be.visible')
    })

    describe('on clicking the skip button', () => {
      before(() => {
        cy.login(user.username)
        cy.get('body').type('{esc}')
        cy.get('[data-test=ftueSkipButton]').click()
      })

      it('should no longer display the taskmap FTUE', () => {
        cy.get('[data-test=taskmap-ftue]').should('not.exist')
      })

      describe('reloading the page', () => {
        before(() => {
          cy.login(user.username)
          cy.reload()
        })

        it('should not display the taskmap FTUE', () => {
          cy.get('[data-test=taskmap-ftue]').should('not.exist')
        })
      })
    })
  })
})
