import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_team_member_remove_recency.cy', () => {
  let user0, user1
  let fixture, appPage

  before(() => {
    // added prefix for sorting test
    const createUser0 = () =>
      createUser('autoTTM').then(createdUser => (user0 = createdUser))
    const createUser1 = () =>
      createUser('QWER_A').then(createdUser => (user1 = createdUser))

    createUser0()
      .then(createUser1)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'task_team_member_remove_recency.cy',
            teamMembers: [user0, user1],
            matterAdmins: [user0],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  {
                    name: 'Review Documents',
                  },
                  {
                    name: 'Read Contracts',
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
  describe('when interacting with a matter from a matter', () => {
    before(() => {
      cy.login(user1)
      appPage.visitTaskByName('Review Documents')
      cy.get('[data-test=zero-state-placeholder]').click()
      cy.get('[data-test=task-description]').type('test')
      // cy.get('body').click()
      cy.backendRoute('GET', '/tasks/recent').as('recents')
      cy.visit('/#/home')

      cy.get('[data-test=home-recently-viewed-tab]').click()
      cy.wait('@recents')
    })
    it('should show the recency', () => {
      cy.get('[data-test=juralio-chip-task]').should('have.length', 1)
    })
  })
})
