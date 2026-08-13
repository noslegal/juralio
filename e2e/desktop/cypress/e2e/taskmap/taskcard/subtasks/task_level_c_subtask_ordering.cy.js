import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

const patchUrl = '/matter/*/workstreams/*/tasks'

describe('task_level_c_subtask_ordering.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'project_task_subtask_ordering.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'A0',
                  tasks: [
                    {
                      name: 'B1',
                      tasks: [{ name: 'C1' }, { name: 'C2' }, { name: 'C3' }],
                    },
                  ],
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

  describe('When visiting task details for a template task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('B1')
    })

    it('should have 1 level tree info', () => {
      taskDetailPage.get.taskLevels().should('have.length', 1)
    })

    it('should show the tasks in their initial expected order', () => {
      cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'C1')
      cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'C2')
      cy.get('[data-test=task-cell-test]').eq(2).should('contain', 'C3')
    })

    describe("when dragging the last subtask into the first subtask's position", () => {
      before(() => {
        cy.backendRoute('PATCH', patchUrl).as('updateTasks')
        cy.dragAndDrop( "[data-test=task-cell-test]", "[data-test=task-cell-test]",2,0)

        cy.wait('@updateTasks')
      })

      it('should show the tasks in the expected order after drag & drop', () => {
        cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'C3')
        cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'C1')
        cy.get('[data-test=task-cell-test]').eq(2).should('contain', 'C2')
      })

      it('should have 1 level tree info', () => {
        taskDetailPage.get.taskLevels().should('have.length', 1)
      })

      describe('when refreshing the page', () => {
        before(() => {
          cy.login(user.username)
          cy.reload()
        })

        it('the order should be maintained', () => {
          cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'C3')
          cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'C1')
          cy.get('[data-test=task-cell-test]').eq(2).should('contain', 'C2')
        })

        it('should have 1 level tree info', () => {
          taskDetailPage.get.taskLevels().should('have.length', 1)
        })
      })
    })
  })
})
