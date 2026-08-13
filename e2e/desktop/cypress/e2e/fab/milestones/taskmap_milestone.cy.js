import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('taskmap_milestone.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'rick and morty',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'belch',
              tasks: [
                {
                  name: 'task',
                  properties: {
                    isMilestone: true,
                    plannedEndDate: '2018-07-08T12:00:00.000Z',
                  },
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('should display the milestone task correctly', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
    })

    it('should display the correct fields on the chip', () => {
      cy.get('[data-test=milestone-icon]', { timeout: 30000 }).should('exist')

      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .should('contain.text', 'Milestone planned for')
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .should('not.contain.text', 'Plan:')
    })
  })
})
