import { createMatter } from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

describe('team_card_add_members.cy', () => {
  let matterUrl, returnedUser, matterObject, loggedInUser
  loggedInUser = 'matter.creator@juralio.com'

  before(() => {
    createUser('Xb')
      .then(user => {
        returnedUser = user

        return createMatter()
      })
      .then(matter => {
        matterUrl = `/#/matteradmin/${matter.id}`
        matterObject = matter
      })
    createUser('Xa').then(user => {
      // return addTeamMember(matterObject.id, user.id)
    })
    createUser('Xc').then(user => {
      // return addTeamMember(matterObject.id, user.id)
    })
  })

  describe('given a matter that the user is a matter admin on', () => {
    before(() => {
      updateFTUE({ username: loggedInUser }, { hasSeenMatterAdmin: true })
      cy.login(loggedInUser)
      cy.visit(matterUrl)
      cy.get('[data-test=matter-people]', { timeout: 30000 }).click()
    })

    it('should have 1 users', { retries: 3 }, () => {
      cy.get('[data-test=user-list-item]').should('have.length', 1)
    })

    describe('when click Add Someone button', () => {
      before(() => {
        cy.get('[data-test=add-user-matter-button]').click()
      })

      it('should default to not assigning any role', () => {
        cy.get('[data-test=matter-access]').should('contain', '')
      })

      it('should should a dialog with the expected title', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'have.text',
          'Add people to this matter'
        )
      })

      describe('when open user drop down menu', () => {
        before(() => {
          cy.get('.MuiAutocomplete-endAdornment').click()
          cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        })

        it('should have 1 user selected to add', { retries: 3 }, () => {
          cy.get('[data-test=add-user-flow-autocomplete-user-chip]', {
            timeout: 10000,
          }).should('have.length', 1)
        })
      })

      describe('when open user drop down menu and adding another user', () => {
        before(() => {
          cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        })

        it('should have 2 users selected to add', () => {
          cy.get('[data-test=add-user-flow-autocomplete-user-chip]').should(
            'have.length',
            2
          )
        })
      })

      describe('when delete a selected user', () => {
        before(() => {
          cy.get('[data-test=juralio-chip-delete]').eq(0).click()
        })

        it('should have 1 user selected to add', () => {
          cy.get('[data-test=add-user-flow-autocomplete-user-chip]').should(
            'have.length',
            1
          )
        })
      })

      describe('when open user drop down menu and re-adding another user', () => {
        before(() => {
          cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
        })

        it('should have 2 users selected to add', () => {
          cy.get('[data-test=add-user-flow-autocomplete-user-chip]').should(
            'have.length',
            2
          )
        })
      })

      describe('changing the access settings', () => {
        before(() => {
          cy.get('.MuiAutocomplete-endAdornment').click()
          cy.get('[data-test=matter-access]').click()
          cy.get('[data-test=full-access]').click()
        })
      })

      describe('when click Add', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click({ force: true })
        })

        it(
          'should add the 2 users to the matter, so there should be 3 users now',
          { retries: 3 },
          () => {
            cy.get('[data-test=user-list-item]').should('have.length', 3)
          }
        )
      })
    })
  })
})
