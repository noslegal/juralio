import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_subtask_ordering.cy', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'task_subtask_ordering.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'A0',
                  properties: {
                    status: 'in-progress',
                  },
                  tasks: [
                    {
                      name: 'Done 1',
                      properties: {
                        status: 'done',
                      },
                    },
                    {
                      name: 'Done 2',
                      properties: {
                        status: 'done',
                      },
                    },
                    {
                      name: 'In Progress 1',
                      properties: {
                        status: 'in-progress',
                      },
                    },
                    {
                      name: 'In Progress 2',
                      properties: {
                        status: 'in-progress',
                      },
                    },
                    {
                      name: 'Not Started 1',
                      properties: {
                        status: 'not-started',
                      },
                    },
                    {
                      name: 'Not Started 2',
                      properties: {
                        status: 'not-started',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When visiting task details for the parent task', () => {
    before(() => {
      cy.login(user.username)
      cy.backendRoute('/matter/*').as('matterFetch')
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
      )
      cy.wait('@matterFetch')
    })

    it('should show the subtasks in their initial expected order', () => {
      cy.get('[data-test=task-cell-test]', { timeout: 30000 })
        .eq(0)
        .should('contain', 'Done 1')
      cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'Done 2')
      cy.get('[data-test=task-cell-test]')
        .eq(2)
        .should('contain', 'In Progress 1')
      cy.get('[data-test=task-cell-test]')
        .eq(3)
        .should('contain', 'In Progress 2')
      cy.get('[data-test=task-cell-test]')
        .eq(4)
        .should('contain', 'Not Started 1')
      cy.get('[data-test=task-cell-test]')
        .eq(5)
        .should('contain', 'Not Started 2')
    })

    describe("when dragging the last done subtask into the first done subtask's position", () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
          'updateTasks'
        )
        cy.dragAndDrop( "[data-test=task-cell-test]", "[data-test=task-cell-test]",0,1)
        cy.wait('@updateTasks')
      
      
      })

      it('should show the done subtasks in the expected order after drag & drop', () => {
        cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'Done 2')
        cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'Done 1')
      })
    })

    describe("when dragging the last in progress subtask into the first in progress subtask's position", () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
          'updateTasks'
        )
        cy.dragAndDrop( "[data-test=task-cell-test]", "[data-test=task-cell-test]",2,3)
        cy.wait('@updateTasks')
      })

      it('should show the in progress subtasks in the expected order after drag & drop', () => {
        cy.get('[data-test=task-cell-test]')
          .eq(2)
          .should('contain', 'In Progress 2')
        cy.get('[data-test=task-cell-test]')
          .eq(3)
          .should('contain', 'In Progress 1')
      })
    })

    describe("when dragging the last not started subtask into the first not started subtask's position", () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
          'updateTasks'
        )

        cy.dragAndDrop( "[data-test=task-cell-test]", "[data-test=task-cell-test]",4,5)
        cy.wait('@updateTasks')
      })

      it('should show the not started subtasks in the expected order after drag & drop', () => {
        cy.get('[data-test=task-cell-test]')
          .eq(4)
          .should('contain', 'Not Started 2')
        cy.get('[data-test=task-cell-test]')
          .eq(5)
          .should('contain', 'Not Started 1')
      })

      // adding this test case for bug JUR-13911
      it('should NOT have any inactive user', () => {
        cy.get('[data-test=inactive-user-avatar]').should('have.length', 0)
      })
    })

    describe('when refreshing the page', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()
      })

      it('should have persisted the subtasks in their new order', () => {
        cy.get('[data-test=task-cell-test]').eq(0).should('contain', 'Done 2')
        cy.get('[data-test=task-cell-test]').eq(1).should('contain', 'Done 1')
        cy.get('[data-test=task-cell-test]')
          .eq(2)
          .should('contain', 'In Progress 2')
        cy.get('[data-test=task-cell-test]')
          .eq(3)
          .should('contain', 'In Progress 1')
        cy.get('[data-test=task-cell-test]')
          .eq(4)
          .should('contain', 'Not Started 2')
        cy.get('[data-test=task-cell-test]')
          .eq(5)
          .should('contain', 'Not Started 1')
      })
    })
  })
})
