import {
    addTaskChain, getNewProject
} from '../../../../../helpers/matterprojects/fixture_data_builder_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

function getSubtaskNavigationProjectData() {
  let project = getNewProject(['task1 A'])
  addTaskChain(project.tasks[0], ['task2 B', 'task3 C', 'task4 D'])
  return project.parent
}

describe('subtasks_navigation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'subtaskNavigationTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getSubtaskNavigationProjectData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When opening a task which has subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('task1 A')
    })

    it('the top level task should be displayed', () => {
      taskDetailPage.get.taskDetailName().should('have.text', 'task1 A')
    })

    describe('when the sub task is clicked', () => {
      before(() => {
        clickSubTask()
      })

      it('the task details for that subtask should be displayed', () => {
        checkTaskName('task2 B')
      })

      describe('when the sub task is clicked', () => {
        before(() => {
          clickSubTask()
        })

        it('the task details for that subtask should be displayed', () => {
          checkTaskName('task3 C')
        })

        describe('when the sub task is clicked', () => {
          before(() => {
            clickSubTask()
          })

          it('the task details for that subtask should be displayed', () => {
            checkTaskName('task4 D')
          })

          describe('when the browser Back button is pressed', () => {
            before(() => {
              cy.go('back')
            })

            it('the task details for the previous subtask should be displayed', () => {
              checkTaskName('task3 C')
            })

            describe('when the browser Back button is pressed', () => {
              before(() => {
                cy.go('back')
              })

              it('the task details for the previous subtask should be displayed', () => {
                checkTaskName('task2 B')
              })
            })
            describe('when the browser Back button is pressed', () => {
              before(() => {
                cy.go('back')
              })

              it('the task details for the previous subtask should be displayed', () => {
                checkTaskName('task1 A')
              })
            })
          })
        })
      })
    })
  })

  function clickSubTask(index) {
    taskDetailPage.get
      .subTasks()
      .eq(index ? index : 0)
      .click()
  }

  function checkTaskName(name) {
    taskDetailPage.get.taskDetailName().should('have.text', name)
  }
})
