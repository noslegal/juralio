import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { getUserAvatarDataTest } from '../../../../../helpers/users/user_list_helper'

const MV_TTM = 0
const ADMIN_MTM = 1
const REG_MTM = 2

describe('post_author_overview_content_display.cy', () => {
  const users = []
  let fixture, appPage

  const addPostToWorkstreamTask = (taskIndex, note) => {
    addNoteToTask(
      fixture.matter.id,
      fixture.projects[0].id,
      fixture.tasks[taskIndex].id,
      note
    )
  }

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

      addPostToWorkstreamTask(0, {
        name: 'This is a note.',
        finalised: false,
        privateNote: false,
        description: '<p>Just some text. You know, already.</p>',
      })
      cy.wait(5000)
      appPage.visitMatterOverview(fixture.matter.id)
    })

    describe('When viewing the TTMs on the workstream content page', () => {
      before(() => {
        cy.get('[data-test=workstream-content]', { timeout: 30000 }).click()
        cy.get('[data-test=post-tab]').eq(0).click()
      })

      it('should show the TTMs in the expected order', () => {
        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        ).should('have.length', 1)

        cy.get(
          '[data-test=project-content-container] [data-test=visible-user-avatar]'
        )
          .eq(0)
          .find(getUserAvatarDataTest(users[ADMIN_MTM]))
      })
    })
  })
})
