import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('team_card_update_role.cy', () => {
  let matterId, returnedUser
  const matterCreator = {
    username: 'matter.creator@juralio.com',
  }

  before(() => {
    updateFTUE(
      { username: 'matter.creator@juralio.com' },
      { hasSeenMatterAdmin: true }
    )
    cy.login('matter.creator@juralio.com').then(() =>
      cy
        .window()
        .then(
          win =>
            (matterCreator.id = JSON.parse(
              win.localStorage.userData
            ).details.id)
        )
    )
  })
  describe('verify add/remove Matter Admin', () => {
    before(() => {
      createUser('Z')
        .then(user => {
          returnedUser = user
          return createMatter()
        })
        .then(matter => {
          matterId = matter.id
          addTeamMember(matter.id, returnedUser.id)
        })
    })

    describe('login and navigate to matter details', () => {
      before(() => {
        cy.login('matter.creator@juralio.com')
        visitHelpers.visitMatter(matterId)
        cy.get('[data-test=matter-people]').click()
      })

      it('the admin check box for the current logged in user should be disabled', () => {
        cy.get('[data-test=matter-content]').eq(0).click()
        cy.get('[data-test=view-edit-disabled]').should('exist')
        cy.get('[data-test=view-edit]').should('not.exist')
      })

      describe('a non-admin user can have admin permission added', () => {
        it('the initial value is unchecked', () => {
          cy.get('[data-test="overview"]').click({ force: true })
          cy.get('[data-test=matter-people]').click()
          cy.wait(3000)
          cy.get('[data-test=matter-content]').eq(1).click()
          cy.get('[data-test=full-access]').should('exist')
        })

        describe('on changing the matter content to Full access', () => {
          before(() => {
            cy.get('[data-test=full-access]').click()
          })

          it('the checkbox should be checked', () => {
            cy.get('[data-test="overview"]').click({ force: true })
            cy.get('[data-test=matter-people]').click()
            cy.wait(3000)
            cy.get('[data-test=matter-content]')
              .eq(1)
              .should('contain.text', 'View + Edit + Admin')
          })

          it('after a page refresh the matter content is still Full access', () => {
            cy.reload()
            cy.login('matter.creator@juralio.com')
            visitHelpers.visitMatter(matterId)
            cy.get('[data-test=matter-people]').click()
            cy.get('[data-test=matter-content]')
              .eq(1)
              .should('contain.text', 'View + Edit + Admin')
          })

          describe('the admin permission can now be removed', () => {
            before(() => {
              cy.get('[data-test=matter-content]').eq(1).click()
              cy.get('[data-test=view-edit-disabled]').should('not.exist')
              cy.get('[data-test=view-edit]').should('exist')
              cy.get('[data-test=view-edit]').click()
            })

            it('the checkbox should be unchecked', () => {
              cy.get('[data-test=matter-content]')
                .eq(1)
                .should('contain.text', 'View + Edit')
            })

            it('after a page refresh the matter content is still View and edit', () => {
              cy.reload()
              cy.login('matter.creator@juralio.com')
              visitHelpers.visitMatter(matterId)
              cy.get('[data-test=matter-people]').click()
              cy.get('[data-test=matter-content]')
                .eq(1)
                .should('contain.text', 'View + Edit')
            })
          })
        })
      })
    })
  })

  describe('verify add/remove Team Member', () => {
    before(() => {
      createUser('Z')
        .then(user => {
          returnedUser = user
          return createMatter()
        })
        .then(matter => {
          matterId = matter.id
          addMatterAdmin(matter.id, returnedUser.id)
        })
    })

    describe('a non-team-member user can have team member permission added', () => {
      before(() => {
        cy.login('matter.creator@juralio.com')
        visitHelpers.visitMatter(matterId)
        cy.get('[data-test=matter-people]').click()
        changeMemberRole(0, 2)
      })

      it('the initial value is unchecked', () => {
        cy.wait(1000)
        cy.get('[data-test=matter-content]')
          .eq(1)
          .should('contain', 'Admin only')
      })

      describe('team member permission can be added', () => {
        before(() => {
          changeMemberRole(1, 0)
        })

        it('the checkbox should be checked', () => {
          cy.wait(1000)
          cy.get('[data-test=matter-content]')
            .eq(1)
            .should('contain', 'View + Edit')
        })

        it('after a page refresh the box is still checked', () => {
          cy.reload()
          cy.login('matter.creator@juralio.com')
          visitHelpers.visitMatter(matterId)
          cy.get('[data-test=matter-people]').click()
          cy.wait(1000)
          cy.get('[data-test=matter-content]')
            .eq(1)
            .should('contain', 'View + Edit')
        })

        describe('the team member permission can now be removed', () => {
          before(() => {
            changeMemberRole(1, 2)
          })

          it('the checkbox should be unchecked', () => {
            cy.wait(1000)
            cy.get('[data-test=matter-content]')
              .eq(1)
              .should('contain', 'Admin only')
          })

          it('after a page refresh the box is still unchecked', () => {
            cy.reload()
            cy.login('matter.creator@juralio.com')
            visitHelpers.visitMatter(matterId)
            cy.get('[data-test=matter-people]').click()
            cy.wait(1000)
            cy.get('[data-test=matter-content]')
              .eq(1)
              .should('contain', 'Admin only')
          })
        })
      })
    })
  })

  describe('verify cannot uncheck both boxes', () => {
    describe('cannot uncheck team member if its the only checked box', () => {
      before(() => {
        createUser('Z')
          .then(user => {
            returnedUser = user
            return createMatter()
          })
          .then(matter => {
            matterId = matter.id
            addTeamMember(matter.id, returnedUser.id)
          })
      })

      describe('login and navigate to matter details', () => {
        before(() => {
          cy.login('matter.creator@juralio.com')
          visitHelpers.visitMatter(matterId)
          cy.get('[data-test=matter-people]').click()
        })

        describe('where only team member is checked, cannot uncheck team member', () => {
          it('confirm the checkbox is checked', () => {
            cy.wait(1000)
            cy.get('[data-test=matter-content]')
              .eq(1)
              .should('contain', 'View + Edit')
          })
        })
      })
    })
  })
})

const changeMemberRole = (user, role) => {
  cy.wait(1000)
  cy.get('[data-test=matter-content]').eq(user).click()
  //cy.wait(1000)
  if (role === 0) {
    return cy.get('[data-test=view-edit]').click()
  } else if (role === 1) {
    return cy.get('[data-test=view-only]').click()
  } else if (role === 3) {
    return cy.get('[data-test=full-access]').click()
  } else if (role === 4) {
    return cy.get('[data-test=view-admin]').click()
  } else {
    return cy.get('[data-test=no-access]').click()
  }
}
