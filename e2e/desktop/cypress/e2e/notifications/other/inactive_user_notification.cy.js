/* eslint-disable arrow-parens */
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { checkGlobalNotificationCount } from '../../../../../helpers/notifications/global-notification-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import { changeUserActiveStatus } from '../../../../../helpers/users/user_helper'

// The people table is keyed on its loaded flag (MatterPeopleTable), so it is
// thrown away and rebuilt every time the team / placeholder fetches settle. That
// detaches the row we are about to click and silently closes the matter content
// dropdown, which is what made this spec flaky. Wait for the table node to stop
// being replaced before touching it.
const waitForStablePeopleTable = (attempt = 0) => {
  cy.get('[data-test=team-content]').then($table => {
    cy.wait(1000)
    cy.get('[data-test=team-content]').then($tableAgain => {
      if ($table[0] !== $tableAgain[0]) {
        if (attempt >= 5) {
          throw new Error('The matter people table kept being remounted')
        }
        waitForStablePeopleTable(attempt + 1)
      }
    })
  })
}

// Cypress won't re-click on retry, so if a remount does close the dropdown the
// open has to be attempted again rather than just waited on.
const setMatterContentToAdminOnly = (index, attempt = 0) => {
  cy.get('[data-test=matter-content]').eq(index).click()
  cy.get('body').then($body => {
    if ($body.find('[role=listbox] [data-test=no-access]').length > 0) {
      cy.get('[role=listbox] [data-test=no-access]').click()
      return
    }
    if (attempt >= 4) {
      throw new Error('Could not open the matter content dropdown')
    }
    waitForStablePeopleTable()
    setMatterContentToAdminOnly(index, attempt + 1)
  })
}

describe('inactive_user_notification.cy', () => {
  let user1, user2, fixture, appPage
  const INITIAL_NOTIFICATION_COUNT = 0

  before(() => {
    createUser('x').then(createdUser => {
      user1 = createdUser
      updateFTUE(user1, { hasSeenMatterAdmin: true })
      createUser('z').then(createdUser => {
        user2 = createdUser
        const seed = {
          matter: {
            prefix: 'New Matter',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [{ name: 'Moon' }],
              },
              {
                name: 'Beta Project',
                tasks: [{ name: 'Sun' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })

  describe('when viewing the Home page after initial creation', () => {
    before(() => {
      cy.login(user2.username)
      appPage.visitHome()
    })

    describe('there should be 2 global inbox notifications', () => {
      checkGlobalNotificationCount(INITIAL_NOTIFICATION_COUNT)
    })
  })

  describe('when the second user is made inactive', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitOrgUsers()
      changeUserActiveStatus(user2)
      cy.wait(5000)
      cy.get('[role="columnheader"][aria-colindex="6"]').click()
    })

    it('they should be shown as inactive in user list', () => {
      cy.get('[data-test=user-status]').should('contain', 'Inactive')
    })
  })

  describe('when creating a matter team member added notification that the second user would have received', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitMatter()
      cy.backendRoute('/matter/*/team*').as('getPeopleTeam')
      cy.backendRoute('DELETE', '/admin/matter/*/teammembers/*').as(
        'removeEditor'
      )
      cy.get('[data-test=matter-people]').click()
      cy.wait('@getPeopleTeam')
      cy.get('[data-test=matter-content]').should('have.length', 3)
      waitForStablePeopleTable()
      setMatterContentToAdminOnly(0)
      cy.wait('@removeEditor')
    })

    it('the matter creator should no longer have matter content access', () => {
      cy.get('[data-test=matter-content]')
        .eq(0)
        .should('contain.text', 'Admin only')
    })

    describe('when the second user is made active again', () => {
      before(() => {
        cy.login(user1.username)
        appPage.visitOrgUsers()
        changeUserActiveStatus(user2, 'on')
      })

      it('they should be shown as active in user list', () => {
        cy.get('[data-test=user-status]').should('contain', 'Active')
      })

      describe('when the second user then logs in the Global inbox notifications should still show the same ammount of notifications as before inactive', () => {
        before(() => {
          cy.login(user2.username)
          appPage.visitHome()
        })

        checkGlobalNotificationCount(INITIAL_NOTIFICATION_COUNT)
      })
    })
  })
})
