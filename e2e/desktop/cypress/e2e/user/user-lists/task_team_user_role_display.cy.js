import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  assertUserListName,
  getEditorListItem,
  getMatterEditorHeader,
  getMatterEditorListItems,
  getMatterViewerHeader,
  getMatterViewerListItems,
  getUserAvatarDataTest,
  getViewerListItem,
} from '../../../../../helpers/users/user_list_helper'

const clickAwayFromPopUp = () =>
  cy.get('[data-test=read-field]').eq(0).click({ force: true })

const MV_TTM = 0
const ADMIN_MTM = 1
const REG_MTM = 2

describe('task_team_user_role_display.cy', () => {
  const users = []
  let fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      users.push(createdUser)
      createUser().then(createdUser => {
        users.push(createdUser)

        createUser('Z').then(createdUser => {
          users.push(createdUser)

          const seed = {
            matter: {
              prefix: 'User Role',
              teamMembers: [users[ADMIN_MTM], users[REG_MTM]],
              matterViewer: [users[MV_TTM]],
              matterAdmins: [users[ADMIN_MTM]],
              workstreams: [
                {
                  name: 'Teapot',
                  tasks: [
                    {
                      name: 'Make tea.',
                      teamMembers: [users[ADMIN_MTM], users[MV_TTM]],
                    },
                    {
                      name: 'Make more tea.',
                      teamMembers: [users[ADMIN_MTM], users[MV_TTM]],
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
    })
  })

  describe('when at home screen and Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(users[ADMIN_MTM].username)
    })

    describe('When viewing the TTMs on the task details page', () => {
      before(() => {
        appPage.visitTaskByName('Make tea.')
      })

      it('should show the TTMs in the expected order', () => {
        cy.get('[data-test=visible-user-avatar]').should('have.length', 2)

        cy.get('[data-test=visible-user-avatar]')
          .eq(1)
          .find(getUserAvatarDataTest(users[ADMIN_MTM]))
        cy.get('[data-test=visible-user-avatar]')
          .eq(0)
          .find(getUserAvatarDataTest(users[MV_TTM]))
      })

      describe('When clicking on the TTM list', () => {
        before(() => {
          cy.get('[data-test=users-control]').click()
          cy.get('[data-test=users-list]').eq(0).click('left', { force: true })
        })

        it('should show the TTMs under their respective headers', () => {
          cy.get('[data-test=delete-icon]').should('have.length', 2)

          getMatterEditorHeader().should('exist')
          getMatterEditorListItems().should('have.length', 1)

          getMatterViewerHeader().should('exist')
          getMatterViewerListItems().should('have.length', 1)

          getEditorListItem().eq(0).should('have.text', 'You')
          assertUserListName(getViewerListItem(), 0, users[MV_TTM])
        })

        after(() => {
          clickAwayFromPopUp()
        })
      })

      describe('When adding a MTM to the TTMs', () => {
        before(() => {
          cy.wait(2000)
          cy.get('[data-test=add-team-member-button]').click()

          cy.get('[data-test=autocomplete-search]')
            .find('input')
            .type(users[REG_MTM].username)

          cy.get('[data-test=options-label]').eq(0).click()
          clickAwayFromPopUp()
        })

        describe('When clicking on the TTM list', () => {
          before(() => {
            cy.get('[data-test=users-control]').click()
            cy.get('[data-test=users-control]').click()
            cy.get('[data-test=users-list]')
              .eq(0)
              .click('left', { force: true })
          })

          it('should show the TTMs in the expected order', () => {
            cy.get('[data-test=visible-user-avatar]').should('have.length', 3)
            cy.get('[data-test=visible-user-avatar]')
              .eq(1)
              .find(getUserAvatarDataTest(users[ADMIN_MTM]))
            cy.get('[data-test=visible-user-avatar]')
              .eq(2)
              .find(getUserAvatarDataTest(users[REG_MTM]))
            cy.get('[data-test=visible-user-avatar]')
              .eq(0)
              .find(getUserAvatarDataTest(users[MV_TTM]))
          })

          it('should show the 3 TTMs under their respective headers', () => {
            cy.get('[data-test=delete-icon]').should('have.length', 3)

            getMatterEditorListItems().should('have.length', 2)
            getEditorListItem().eq(1).should('have.text', 'You')
            assertUserListName(getEditorListItem(), 0, users[REG_MTM])

            getMatterViewerListItems().should('have.length', 1)
            assertUserListName(getViewerListItem(), 0, users[MV_TTM])
          })
        })

        describe('When the last matter viewer is removed from the TT', () => {
          before(() => {
            cy.get('[data-test=delete-icon]').last().click()
          })

          it('should show the remaining 2 TTMs under their respective headers', () => {
            getMatterEditorHeader().should('exist')
            getMatterEditorListItems().should('have.length', 2)

            getMatterViewerHeader().should('not.exist')
            getMatterViewerListItems().should('have.length', 0)
          })

          describe('When the pop-up list is closed', () => {
            before(() => {
              clickAwayFromPopUp()
            })

            it('should show the TTMs in the expected order', () => {
              cy.get('[data-test=visible-user-avatar]').should('have.length', 2)
              cy.get('[data-test=visible-user-avatar]')
                .eq(0)
                .find(getUserAvatarDataTest(users[ADMIN_MTM]))
              cy.get('[data-test=visible-user-avatar]')
                .eq(1)
                .find(getUserAvatarDataTest(users[REG_MTM]))
            })
          })
        })
      })
    })
  })
})
