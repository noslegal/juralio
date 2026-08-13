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

const MV_TTM = 0
const ADMIN_MTM = 1
const REG_MTM = 2

describe('workstream_overview_content_task_user_role_display.cy', () => {
  const users = []
  let fixture, appPage

  before(() => {
    createUser('A').then(createdUser => {
      users.push(createdUser)

      createUser('B').then(createdUser => {
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
                  ],
                },
                {
                  name: 'Coffee pot',
                  tasks: [
                    {
                      name: 'Make coffee.',
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

  describe('When on the Matter Overview page', () => {
    before(() => {
      cy.login(users[ADMIN_MTM].username)
      appPage.visitMatterOverview(fixture.matter.id)
    })

    describe('When viewing the TTMs on the workstream content page', () => {
      before(() => {
        cy.get('[data-test=workstream-content]', { timeout: 30000 }).click()
        cy.get('[data-test=task-tab]').eq(0).click()
      })

      it('should show the TTMs in the expected order', () => {
        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        ).should('have.length', 4)

        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        )
          .eq(1)
          .find(getUserAvatarDataTest(users[ADMIN_MTM]))
        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        )
          .eq(0)
          .find(getUserAvatarDataTest(users[MV_TTM]))
        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        )
          .eq(3)
          .find(getUserAvatarDataTest(users[ADMIN_MTM]))
        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        )
          .eq(2)
          .find(getUserAvatarDataTest(users[MV_TTM]))
      })

      describe('When clicking on the TTM list', () => {
        before(() => {
          cy.get(
            '[data-test=project-content-container] [data-test=users-control]'
          )
            .eq(0)
            .click()
        })

        it('should show the TTMs under their respective headers', () => {
          getMatterEditorHeader().should('exist')
          getMatterEditorListItems().should('have.length', 1)

          getMatterViewerHeader().should('exist')
          getMatterViewerListItems().should('have.length', 1)

          getEditorListItem().eq(0).should('have.text', 'You')
          assertUserListName(getViewerListItem(), 0, users[MV_TTM])
        })
      })
    })
  })
})
