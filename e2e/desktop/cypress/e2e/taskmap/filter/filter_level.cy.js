import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

// The level indicators no longer "filter to a level" - they collapse/expand
// every task at or below the chosen level. A multi-branch tree is used so that
// collapse-to-level (which collapses ALL tasks at a level across branches) is
// genuinely exercised rather than behaving like the old single-chain filter.
describe('filter_level.cy', () => {
  let adminUser, fixture, appPage

  const createUser1 = () =>
    createUser().then(createdUser => (adminUser = createdUser))

  before(() => {
    createUser1().then(() => {
      const seed = {
        matter: {
          prefix: 'task_status_event',
          teamMembers: [adminUser],
          matterAdmins: [adminUser],
          projects: [
            {
              name: 'Law Project',
              tasks: [
                {
                  name: 'Alpha',
                  teamMembers: [],
                  tasks: [
                    {
                      name: 'Alpha-B1',
                      tasks: [{ name: 'Alpha-B1-C1' }],
                    },
                    {
                      name: 'Alpha-B2',
                      tasks: [{ name: 'Alpha-B2-C1' }],
                    },
                  ],
                },
                {
                  name: 'Beta',
                  teamMembers: [],
                  tasks: [
                    {
                      name: 'Beta-B1',
                      tasks: [{ name: 'Beta-B1-C1' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when on the task map', () => {
    before(() => {
      cy.reload()
      cy.login(adminUser.username)
      appPage.visitTaskMap()
    })

    it('should show all 8 tasks across both branches', () => {
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        8
      )
      cy.get('[data-test=level-indicator1]').should('exist')
      cy.get('[data-test=level-indicator2]').should('exist')
      cy.get('[data-test=level-indicator3]').should('exist')
    })

    it('should collapse every level B task (5 visible) when collapsing to level B', () => {
      cy.get('[data-test=level-indicator2]').click({ force: true })
      // Alpha, Beta (phases) + the three collapsed level B tasks
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        5
      )
      // The three level B tasks now render the collapsed summary
      cy.get('[data-test=collapse-task-content]').should('have.length', 3)
    })

    it('should expand all 8 tasks again when expanding from the end indicator', () => {
      cy.get('[data-test=indicator-text2]').click({ force: true })
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        8
      )
      cy.get('[data-test=collapse-task-content]').should('not.exist')
    })

    it('should collapse to just the two phases when collapsing to level A', () => {
      cy.get('[data-test=level-indicator1]').click({ force: true })
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        2
      )
      cy.get('[data-test=collapse-task-content]').should('have.length', 2)
    })

    it('should expand all 8 tasks again from the end indicator', () => {
      cy.get('[data-test=indicator-text2]').click({ force: true })
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        8
      )
    })
  })
})
