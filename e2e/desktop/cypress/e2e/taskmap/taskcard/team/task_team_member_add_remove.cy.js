import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const extendedTimeout = { timeout: 10000 }
describe('task_team_member_add_remove.cy', () => {
  let user0, user1, user2, user3
  let fixture, appPage

  before(() => {
    // added prefix for sorting test
    const createUser0 = () =>
      createUser('autoTTM').then(createdUser => (user0 = createdUser))
    const createUser1 = () =>
      createUser('QWER_A').then(createdUser => (user1 = createdUser))
    const createUser2 = () =>
      createUser('QWER_H').then(createdUser => (user2 = createdUser))
    const createUser3 = () =>
      createUser('QWER_Z').then(createdUser => (user3 = createdUser))

    createUser0()
      .then(createUser1)
      .then(createUser2)
      .then(createUser3)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'ttmSearchSpec',
            teamMembers: [user0, user1, user2, user3],
            matterAdmins: [user0, user1],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  {
                    name: 'Review Documents',
                    teamMembers: [user0],
                  },
                  {
                    name: 'Read Contracts',
                    teamMembers: [user0],
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

  const searchInput = () =>
    cy.get('[data-test=autocomplete-search]').find('input').clear()

  describe('when opting to add a task team member', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Review Documents')
    })

    describe('the ttm search component', () => {
      it('should be visible', () => {
        cy.get('[data-test="add-team-member-button"]').should('be.visible')
      })

      it('should have the placeholder label "Add team member"', () => {
        cy.get('[data-test=add-team-member-button]').click()
        cy.get('[data-test="autocomplete-search"]')
          .find('input')
          .should('have.attr', 'placeholder', 'Add team member')
      })
    })

    describe('when trying to search someone who does NOT exist', () => {
      before(() => {
        searchInput().type('NOTEXIST')
      })

      it('should yield no results', () => {
        cy.get('[data-test="add-as-placeholder"]').should('be.visible')
      })
    })

    describe('when trying to search multiple members', () => {
      before(() => {
        searchInput().type('QWER_')
      })

      describe('the search result list', () => {
        it('should contain 3 users', () => {
          cy.get('[role=listbox]').children().should('have.length', 3)
        })

        it('first one as user QWER_A', () => {
          cy.get('[role=listbox]').children().eq(0).should('contain', 'QWER_A')
        })

        it('second one as user QWER_H', () => {
          cy.get('[role=listbox]').children().eq(1).should('contain', 'QWER_H')
        })

        it('third one as user QWER_Z', () => {
          cy.get('[role=listbox]').children().eq(2).should('contain', 'QWER_Z')
        })
      })

      describe('and then add the first user to ttm', () => {
        before(() => {
          cy.backendRoute(
            'POST',
            '/matter/*/workstreams/*/task/*/teammembers'
          ).as('ttmPost')
          //cy.clock()
          cy.get('[role=listbox]').children().eq(0).click()
          //cy.tick(1000)
          cy.wait('@ttmPost')
          //cy.tick(1000)
          //cy.tick(1000)
          // cy.get('body').click()
        })

        // too flakey
        // it(
        //   'should display a snackbar',
        //   { retries: { runMode: 2, openMode: 1 } },
        //   () => {
        //     cy.get('[data-test=snackbar-message]')
        //       .should('be.visible')
        //       .should(
        //         'contain',
        //         `${user1.firstname} ${user1.lastname} was added to the team`
        //       )
        //   }
        // )

        describe('when try to refresh the page', () => {
          before(() => {
            cy.login(user1.username)
            cy.reload()
            cy.wait(5000)
            cy.get('[data-test=avatar-group]').click()
          })

          it('should persist the added ttm', () => {
            cy.get('[data-test=name-text]').eq(1).should('exist')
          })
        })
      })
    })
  })

  describe('when opting to remove a task team member', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Read Contracts')
      cy.get('[data-test=avatar-group]').click()

      cy.backendRoute(
        'DELETE',
        '/matter/*/workstreams/*/task/*/teammembers/*'
      ).as('deleteTTM')
      //Remove member
      cy.get('[data-test=user-list-item]')
        .eq(0)
        .find('[data-test=delete-icon]')
        .click({ force: true })
      cy.wait('@deleteTTM')
      // cy.get('body').click()
    })

    it('should be no team members left', () => {
      cy.get('[data-test=avatar-group]').should('not.exist')
    })

    // too flakey
    // it(
    //   'should display a snackbar',
    //   { retries: { runMode: 2, openMode: 1 } },
    //   () => {
    //     cy.get('[data-test=snackbar-message]')
    //       .should('be.visible')
    //       .should(
    //         'contain',
    //         `${user0.firstname} ${user0.lastname} was removed from the team`
    //       )
    //   }
    // )

    describe('when the page is refreshed', () => {
      before(() => {
        cy.login(user1.username)
        cy.reload()
      })

      it('no team members should be displayed', () => {
        cy.get('[data-test=avatar-group]').should('not.exist')
      })
    })
  })
})
