import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../../helpers/users/user_api_helper'

describe('task_team_member_display.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user1, user2, user3
  let fixture, appPage

  before(() => {
    const createUser1 = () => {
      //Prefix is used to generate users in order to test ordering
      return createUser('Y').then(createdUser => (user1 = createdUser))
    }

    const createUser2 = () => {
      return createUser('F').then(createdUser => (user2 = createdUser))
    }

    const createUser3 = () => {
      return createUser('D').then(createdUser => (user3 = createdUser))
    }

    createUser1()
      .then(createUser2)
      .then(createUser3)
      .then(() => {
        updateFTUE(user1, { hasSeenMatterAdmin: true })
        const seed = {
          matter: {
            prefix: 'ttmDisplaySpec',
            teamMembers: [user1, user2, user3],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  {
                    name: 'Transfer Documents',
                    teamMembers: [user1, user2, user3],
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
  const teamMembersSelector = '[data-test=team-members-container]'

  before(() => {
    cy.login(user1.username)
    appPage.visitTaskByName('Transfer Documents')
  })

  describe('When navigating to a task that has 3 team members, including the current user', () => {
    it('should NOT display the zero-state', () => {
      cy.get('[data-test=task-team-members-zero-state]').should('not.exist')
    })

    it('should display 3 team members', () => {
      cy.get('[data-test=avatar-group]').children().should('have.length', 3)
    })

    it('should display remove buttons for each member', () => {
      cy.get('[data-test=avatar-group]').click()
      cy.get('[data-test=delete-icon]').should('have.length', 3)
    })
  })

  describe(
    'When navigating to a task that has 3 team members, and one is made not in this matter through being removed as an MTM',
    { retries: { runMode: 3, openMode: 1 } },
    () => {
      before(() => {
        cy.login(user1.username)
        visitHelpers.visitOrgUsers()
        // changeUserActiveStatus(user3, 'on')
        appPage.visitMatter()
        cy.wait(3000)
        cy.get('[data-test=matter-people]').click()
        cy.wait(3000)
        cy.get('[data-test=delete-button]').eq(2).click()
        cy.get('[data-test=action-dialog-button]').click()

        appPage.visitTaskByName('Transfer Documents')
        cy.get('[data-test=avatar-group]').click()
      })

      it("they should still be displayed but with text stating they're not in the matter", () => {
        cy.get('[data-test=user-list-item]', { timeout: 30000 }).should(
          'have.length',
          3
        )
      })
    }
  )
})
