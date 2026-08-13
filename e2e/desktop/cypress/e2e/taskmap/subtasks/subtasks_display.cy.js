import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
    assertSubtaskCount,
    assertSubtaskText
} from '../../../../../helpers/tasks/task_subtasks_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('subtasks_display.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'subtaskTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'SubTaskDisplaySpec',
              tasks: [
                {
                  name: 'No subtasks',
                },
                {
                  name: 'Only Not Started subtasks',
                  tasks: [
                    {
                      name: 'Not started 1',
                    },
                    {
                      name: 'Not started 2',
                    },
                  ],
                },
                {
                  name: 'Only In progress subtasks',
                  tasks: [
                    {
                      name: 'In progress 1',
                      properties: {
                        status: 'in-progress',
                      },
                    },
                    {
                      name: 'In progress 2',
                      properties: {
                        status: 'in-progress',
                      },
                    },
                  ],
                },
                {
                  name: 'Only Done subtasks',
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
                  ],
                },
                {
                  name: 'All statuses of subtask',
                  tasks: [
                    {
                      name: 'Not Started',
                    },
                    {
                      name: 'in-progress',
                      properties: {
                        status: 'in-progress',
                      },
                    },
                    {
                      name: 'done',
                      properties: {
                        status: 'done',
                      },
                    },
                  ],
                },
                {
                  name: 'Max subtasks',
                  tasks: [
                    { name: '1' },
                    { name: '2' },
                    { name: '3' },
                    { name: '4' },
                    { name: '5' },
                    { name: '6' },
                    { name: '7' },
                    { name: '8' },
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

  describe('When opening a task which has no subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('No subtasks')
    })

    it('the status groups should not be visible', () => {
      cy.get('[data-test="done-tasks"]').should('not.exist')
      cy.get('[data-test="in-progress-tasks"]').should('not.exist')
      cy.get('[data-test="not-started-tasks"]').should('not.exist')
    })
  })

  describe('When opening a task with only "Not started" subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Only Not Started subtasks')
    })

    describe('the "Not started" group', () => {
      it('should be visible', () => {
        cy.get('[data-test="not-started-tasks"]').should('be.visible')
      })

      it('should have 2 subtasks', () => {
        assertSubtaskCount('not-started-tasks', 2)
      })

      it('should have "Not started 1" as the first subtask', () => {
        assertSubtaskText('not-started-tasks', 0, 'Not started 1')
      })

      it('should have "Not started 2" as the second subtask', () => {
        assertSubtaskText('not-started-tasks', 1, 'Not started 2')
      })
    })

    it('the "Done" group and"In progress" group are NOT visible', () => {
      cy.get('[data-test="in-progress-tasks"]').should('not.exist')
      cy.get('[data-test="done-tasks"]').should('not.exist')
    })
  })

  describe('When opening a task with only "In progress" subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Only In progress subtasks')
    })

    describe('the "In progress" group', () => {
      it('should be visible', () => {
        cy.get('[data-test="in-progress-tasks"]').should('be.visible')
      })

      it('should have 2 subtasks', () => {
        assertSubtaskCount('in-progress-tasks', 2)
      })

      it('should have "In progress 1" as the first subtask', () => {
        assertSubtaskText('in-progress-tasks', 0, 'In progress 1')
      })

      it('should have "In progress 2" as the second subtask', () => {
        assertSubtaskText('in-progress-tasks', 1, 'In progress 2')
      })
    })

    it('the "Not started" group & "Done" group is NOT visible', () => {
      cy.get('[data-test="not-started-tasks"]').should('not.exist')
      cy.get('[data-test="done-tasks"]').should('not.exist')
    })
  })

  describe('When opening a task with only "Done" subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Only Done subtasks')
    })

    describe('the "Done" group', () => {
      it('should be visible', () => {
        cy.get('[data-test="done-tasks"]').should('be.visible')
      })

      it('should have 2 subtasks', () => {
        assertSubtaskCount('done-tasks', 2)
      })

      it('should have "Done 1" as the first subtask', () => {
        assertSubtaskText('done-tasks', 0, 'Done 1')
      })

      it('should have "Done 2" as the second subtask', () => {
        assertSubtaskText('done-tasks', 1, 'Done 2')
      })
    })

    it('the "Not started" group & "In progress" group are NOT visible', () => {
      cy.get('[data-test="not-started-tasks"]').should('not.exist')
      cy.get('[data-test="in-progress-tasks"]').should('not.exist')
    })
  })

  describe('When opening a task with subtasks of all statuses', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('All statuses of subtask')
    })

    describe('the "Done" group', () => {
      it('should be visible', () => {
        cy.get('[data-test="done-tasks"]').should('be.visible')
      })

      it('should have 1 subtasks', () => {
        assertSubtaskCount('done-tasks', 1)
      })
    })

    describe('the "In progress" group', () => {
      it('should be visible', () => {
        cy.get('[data-test="in-progress-tasks"]').should('be.visible')
      })

      it('should have 1 subtasks', () => {
        assertSubtaskCount('in-progress-tasks', 1)
      })
    })

    describe('the "Not started" group', () => {
      it('should be visible', () => {
        cy.get('[data-test="not-started-tasks"]').should('be.visible')
      })

      it('should have 1 subtasks', () => {
        assertSubtaskCount('not-started-tasks', 1)
      })
    })
  })

  describe('When opening a task with max subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Max subtasks')
    })

    it('should be visible', () => {
      cy.get('[data-test=not-started-tasks]').should('be.visible')
    })

    it('should have 8 subtasks', () => {
      assertSubtaskCount('not-started-tasks', 8)
    })

    it('should shown max subtasks help message', () => {
      cy.get('[data-test=maximum-subtasks-message]')
        .scrollIntoView()
        .should('be.visible')
    })
  })
})
