import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

// The "+N" filtered-out pill counts all hidden descendants, and when the task
// is collapsed the pill is now clickable to drill in one level at a time.
describe('filtered_out_tasks_number.cy', () => {
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
                  name: 'Parent',
                  teamMembers: [adminUser],
                  tasks: [
                    {
                      name: 'Child-B',
                      tasks: [{ name: 'GC-C1' }, { name: 'GC-C2' }],
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

  describe('when collapsing the whole phase', () => {
    before(() => {
      cy.reload()
      cy.login(adminUser.username)
      appPage.visitTaskMap()
      cy.wait(1000)
      cy.get('[data-test=level-indicator1]').click({ force: true })
    })

    it('should show a +3 pill counting every hidden descendant', () => {
      cy.get('[data-test=filtered-out-subtasks]', { timeout: 30000 }).should(
        'have.length',
        1
      )
      cy.get('[data-test=filtered-out-subtasks]').should('contain.text', '+3')
    })
  })

  describe('when clicking the pill on the collapsed phase', () => {
    before(() => {
      cy.get('[data-test=filtered-out-subtasks]').click({ force: true })
      cy.wait(500)
    })

    it('should drill in one level, revealing Child-B with its own +2 pill', () => {
      cy.contains('Child-B').should('be.visible')
      cy.get('[data-test=filtered-out-subtasks]', { timeout: 30000 }).should(
        'have.length',
        1
      )
      cy.get('[data-test=filtered-out-subtasks]').should('contain.text', '+2')
      cy.contains('GC-C1').should('not.exist')
    })
  })

  describe('when clicking the pill again on Child-B', () => {
    before(() => {
      cy.get('[data-test=filtered-out-subtasks]').click({ force: true })
      cy.wait(500)
    })

    it('should fully expand, removing the pill and showing all 4 tasks', () => {
      cy.get('[data-test=filtered-out-subtasks]').should('not.exist')
      cy.contains('GC-C1').should('be.visible')
      cy.get('[data-test=options-dropdown]', { timeout: 30000 }).should(
        'have.length',
        4
      )
    })
  })
})
