import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
    createUser,
    updateFTUE
} from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('roadmap_ftue_flow_finish.cy', () => {
  let user, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'directroute',
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

  describe('when timeline is visited', () => {
    before(() => {
      cy.login(user.username)
      updateFTUE(user, { hasSeenRoadmap: false })
      cy.login(user.username) // log in again to refresh status.
      visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
    })

    it('should display the timeline FTUE', () => {
      cy.get('[data-test=Roadmap-ftue]').should('be.visible')
    })

    describe('on clicking the finish button', () => {
      before(() => {
        cy.login(user.username)
        cy.get('body').type('{esc}')
        cy.get('[data-test=ftueFinishButton]').click()
      })

      it('should no longer display the roadmap FTUE', () => {
        cy.get('[data-test=Roadmap-ftue]').should('not.exist')
      })

      describe('reloading the page', () => {
        before(() => {
          cy.reload()
          cy.login(user.username)
          visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
        })

        it('should not display the roadmap FTUE', () => {
          cy.get('[data-test=Roadmap-ftue]').should('exist')
        })
      })
    })
  })
})
