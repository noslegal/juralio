import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

describe('matter_admin_remove_self.cy', () => {
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
        updateFTUE(user1, { hasSeenMatterAdmin: true })
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })
  const teamMembersSelector = '[data-test=team-members-container]'

  before(() => {
    cy.login(user1.username)
    appPage.visitTaskByName('Transfer Documents')
  })

  describe('When trying to remove matter admin from self', () => {
    before(() => {
      cy.login(user1.username)
      visitHelpers.visitOrgUsers()
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=matter-people]').click()
      cy.wait(2000)
      cy.get('[data-test=matter-content]').eq(3).click()
      cy.wait(2000)
      cy.get('[data-test=view-edit]').click()
    })

    it('it should show dialog when trying to remove admin', () => {
      cy.get('[data-test=dialog-prompt-text]').should(
        'contain',
        'If you proceed, you’ll no longer be able to administer this matter. Only another matter admin or an organisation admin can re-add you.'
      )
    })
  })

  describe('When trying to remove self from matter admin', () => {
    before(() => {
      cy.login(user1.username)
      visitHelpers.visitOrgUsers()
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=matter-people]').click()
      cy.wait(2000)
      cy.get('[data-test=delete-button]').eq(3).click()
    })

    it('it should show dialog when trying to remove self', () => {
      cy.get('[data-test=dialog-prompt-text]').should(
        'contain',
        'If you proceed, you’ll no longer be able to administer this matter. Only another matter admin or an organisation admin can re-add you.'
      )
    })
  })

  describe('When trying to remove self from matter admin', () => {
    before(() => {
      cy.login(user1.username)
      visitHelpers.visitOrgUsers()
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=matter-people]').click()
      cy.wait(2000)
      cy.get('[data-test=delete-button]').eq(3).click()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('it should navigate the user to the homescreen', () => {
      cy.get('[data-test=desktop-home-zero-state]').should('exist')
    })
  })
})
