import {
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const matterCreator = {
  username: 'matter.creator@juralio.com',
}
const visitHelpers = new VisitHelpers()

describe('team_card_remove_members.cy', () => {
  let returnedMatter, returnedUser

  before(() => {
    createUser('nimble')
      .then(user => {
        returnedUser = user
        return createMatter()
      })
      .then(matter => {
        returnedMatter = matter
        updateFTUE(matterCreator, { hasSeenMatterAdmin: true })
        addTeamMember(returnedMatter.id, returnedUser.id)
      })
  })

  describe('given a matter that the user is a matter admin on', () => {
    before(() => {
      cy.login(matterCreator.username).then(() =>
        cy
          .window()
          .then(
            win =>
              (matterCreator.id = JSON.parse(
                win.localStorage.userData
              ).details.id)
          )
      )
      visitHelpers.visitMatter(returnedMatter.id)
      cy.get('[data-test=matter-people]').click()
    })

    it('the delete button is visible and NOT disabled for the created user', () => {
      cy.get('[data-rowindex=1]')
        .find('[data-test=delete-button]')
        .should('be.visible')
        .should('not.have.attr', 'disabled')
    })

    it('the delete button is not visible for the current user', () => {
      cy.get('[data-rowindex=0]')
        .find('[data-test=delete-button]')
        .should('not.exist')
    })

    it('should not display the add member helper as multiple users are present', () => {
      cy.get('[data-test=team-helper]').should('not.exist')
    })
  })

  describe('when clicking the delete button', () => {
    before(() => {
      cy.get('[data-rowindex=1]')
        .find('[data-test=delete-button]')
        .click()

      cy.get('[data-test=action-dialog-button]').click()
    })

    it('should remove the related user from the list', () => {
      cy.get('[data-rowindex=1]').should('have.length', 0)
    })

    it('should display the add member helper as only one user is present', () => {
      cy.get('[data-test=team-helper]').should(
        'contain',
        'Search for someone in your organisation to add them to this matter'
      )
    })

    it('user should still be removed after refreshing the page', () => {
      cy.login(matterCreator.username)
      cy.reload()
      visitHelpers.visitMatter(returnedMatter.id)
      cy.get('[data-rowindex=1]').should('have.length', 0)
    })
  })

  describe('When visiting a matter that the user is a matter team member on', () => {
    before(() => {
      cy.reload()
      cy.login(returnedUser.username)
      visitHelpers.visitMatter(returnedMatter.id)
    })

    it('the matter screen is not shown', () => {
      cy.url().should('contains', '/404')
    })
  })
})
