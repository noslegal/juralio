import {
  getAutocompleteInput,
  getMatterAccessSelect,
} from '../../../../../helpers/matterdetails/team_card_helper'
import {
  addTeamMember,
  createMatter,
  getMatters,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  getUsers,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('team_card_display.cy', () => {
  const matterCreator = {
    username: 'matter.creator@juralio.com',
  }

  before(() => {
    updateFTUE(matterCreator, { hasSeenMatterAdmin: true })
    createUser('nnn').then(user => {
      return createMatter().then(matter => {
        addTeamMember(matter.id, user.id)
      })
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
      visitHelpers.visitMatter(getMatters(0).id)
      cy.get('[data-test=matter-people]').click()
    })

    describe("the member's", () => {
      it('admin role checkbox is NOT disabled', () => {
        cy.get('[data-test=matter-content]').eq(1).click()
        cy.get('[data-test=full-access]').should('not.have.attr', 'disabled')
      })
    })

    describe("the creator's", () => {
      it('admin role checkbox is disabled', () => {
        cy.get('[data-test="overview"]').click({ force: true })
        cy.get('[data-test=matter-people]').click()
        cy.wait(3000)
        cy.get('[data-test=matter-content]').eq(0).click()
        cy.get('[data-test=view-edit-disabled]').should('exist')
        cy.get('[data-test=view-edit]').should('not.exist')
      })
    })

    describe('should display a header', () => {
      it('with the correct text', () => {
        cy.get('[data-test=matter-people-content]')
          .find('[data-test=panel-title]')
          .should('contain', 'People')
      })
    })

    it('should be show the Add Someone button', () => {
      getAutocompleteInput().should('be.visible')
    })
  })

  describe('given a matter that the user is a matter team member on', () => {
    before(() => {
      cy.login(getUsers(0).username)
      visitHelpers.visitMatter(getMatters(0).id)
    })

    it('should not display create project component', () => {
      cy.url().should('contains', '/404')
    })
  })

  describe('when a matter is closed', () => {
    let matterObject, loggedInUser
    loggedInUser = 'matter.creator@juralio.com'

    before(() => {
      createUser('Xb')
        .then(user => {
          return createMatter()
        })
        .then(matter => {
          matterObject = matter
          cy.login(loggedInUser)
          visitHelpers.visitMatter(matter.id)
        })
      createUser('Xa').then(user => {
        return addTeamMember(matterObject.id, user.id).then(() => {
          cy.get('[data-test=status-select-selection-dropdown]').click()
          cy.get('[data-test=status-select-off-option]').click()
          cy.get('[data-test=matter-people]').click()
        })
      })
    })
    it('should tell the user the project is closed', () => {
      cy.get('[data-test=projectClosedInfo]').should('be.visible')
    })
    it('should tell the user the project memberships cannot be altered', () => {
      cy.get('[data-test=teamClosedInfoText]').should(
        'have.text',
        'This matter is closed - members cannot be added or altered until the matter is reactivated. (Go to Admin summary)'
      )
    })
    it('should not show the search bar', () => {
      cy.get('[data-test="add-user-matter-button"]').should('not.exist')
    })
    it('should disable the members table', () => {
      cy.get('[data-test=matter-content]').eq(0).find('.Mui-disabled').should('exist')
    })
  })
})
