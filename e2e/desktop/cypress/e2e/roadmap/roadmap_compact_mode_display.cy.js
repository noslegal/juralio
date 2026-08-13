import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('roadmap_compact_mode_display.cy', () => {
  let user, appPage, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'detailed_display',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Alpha Project',
              tasks: [
                {
                  name: 'Moon',
                },
                { name: 'Stars' },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when there are labels', () => {
    before(() => {
      cy.login(user.username).then(() => {
        cy.wait(3000)
        visitHelpers.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
        cy.wait(3000)
        cy.get('[data-test=minimap-view-menu]').click({ force: true })
        cy.get('[data-test=compact-view-filter]').click({ force: true })
      })
    })
    it('should be able to enable compact view', () => {
      cy.get('[data-test="compact-task-cell-content"]').should('exist')
      cy.get('[data-test="compact-task-cell-content"]').should('have.length', 2)
    })
  })
})
