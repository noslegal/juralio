import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

describe('user_without_name_interaction.cy', () => {
  let user, notLoggedInUser, appPage, fixture
  const visitHelper = new VisitHelpers()
  before(() => {
    createUser().then(u => {
      user = u
      updateFTUE(user, { hasSeenMatterAdmin: true })
      createUser('', true, true, {}, false, false, true).then(u2 => {
        notLoggedInUser = u2
        const seed = {
          matter: {
            prefix: 'user_without_name_interaction.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'P1',
                tasks: [{ name: 'Task 1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })
  describe('when trying to add a user without a name to a matter', () => {
    before(() => {
      cy.login(user.username)
      visitHelper.visitMatter(fixture.matter.id)
      cy.get('[data-test=matter-people]').click()
      cy.get('[data-test=add-user-matter-button]').click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]')
        .find('input')
        .click()
      cy.get('[data-test=add-user-flow-autocomplete-text-field]')
        .find('input')
        .type(notLoggedInUser.username)
      cy.get('[data-test=add-user-flow-autocomplete-option]').eq(0).click()
      cy.get('[data-test=matter-access]').click()
      cy.get('[data-test="full-access"]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(5000)
    })
    it('should show the users in the matter', () => {
      cy.get('[data-test=user-name-text]')
        .eq(0)
        .should('contain.text', notLoggedInUser.username)
    })

    describe('when trying to add the user to a task', () => {
      before(() => {
        cy.login(user.username)
        visitHelper.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
        cy.get('[data-test=add-team-member-button]').click()
        cy.get('[data-test=autocomplete-search]')
          .find('input')
          .type(notLoggedInUser.username)
      })
      it('should show the user', () => {
        cy.get('[data-test=options-label]')
          .eq(0)
          .should('contain.text', notLoggedInUser.username)
      })
      describe('when trying to add the user to a post', () => {
        before(() => {
          cy.get('[data-test=options-label]').eq(0).click()
          cy.get('[data-test=create-post-button]').click()
          cy.backendRoute('POST', '**/matter/*/workstreams/*/task/*/posts').as(
            'new-note'
          )
          cy.get('[data-test=blank-note]').click()
          cy.wait('@new-note')

          cy.get('[data-test=post-people-add-people-button]', {
            timeout: 12000,
          }).click()
          cy.get('[data-test=auto-complete-search-term]')
            .eq(0)
            .find('input')
            .type(notLoggedInUser.username)
        })
        it('should show the user', () => {
          cy.get('[data-test=search-result-list-item]')
            .eq(0)
            .should('contain.text', notLoggedInUser.username)
        })
        describe('when adding the user to the post', () => {
          before(() => {
            cy.get('[data-test=search-result-list-item]').eq(0).click()
          })
          it('should add the user to the post', () => {
            cy.get('[data-test=user-avatar]').should('exist')
          })
        })
      })
    })
  })
})
