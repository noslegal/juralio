import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

describe('matter_admin_add_custom_message_display.cy', () => {
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
        const seed = {
          matter: {
            prefix: 'ttmDisplaySpec',
            teamMembers: [user1],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  {
                    name: 'Transfer Documents',
                    teamMembers: [],
                  },
                ],
              },
            ],
          },
        }
        updateFTUE(user1, { hasSeenMatterAdmin: true })
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })
  describe('when visiting the add user screen', () => {
    before(() => {
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=matter-people]').click()
      cy.wait(2000)
      cy.get('[data-test=add-user-matter-button]').click()
    })
    it('should show the checkbox', () => {
      cy.get('[data-test=send-email-checkbox]').should('be.visible')
    })
    it('should show a disabled editor', () => {
      cy.get('[data-test=add-user-email-message-wrapper]').should('not.exist')
    })
    describe('when checking the box', () => {
      before(() => {
        cy.get('[data-test=send-email-checkbox]').click()
      })
      it('should enable the editor', () => {
        cy.get('[data-test=add-user-email-message-wrapper]').should(
          'be.visible'
        )
      })
    })
  })
})
