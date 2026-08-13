import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('task_map_compact_mode_display.cy', () => {
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

  describe('when there are tasks', () => {
    before(() => {
      cy.login(user.username).then(() => {
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=icicle-minimap-minimized]').click({ force: true })
        cy.get('[data-test=minimap-view-menu]').click({ force: true })
        cy.get('[data-test=compact-view-filter]').click({ force: true })
      })
    })
    it('should be able to enable compact view', () => {
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .should('have.css', 'min-height')
        .and('eq', '24px')
    })
  })
})
