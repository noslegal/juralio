import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { getTaskPathItems } from '../../../../../../helpers/tasks/task_path_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_description_state_reset_on_navigation.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskDescriptionTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Name Editing Spec',
              tasks: [
                {
                  name: 'Initial Task Name',
                  properties: {
                    description: 'Initial task description',
                  },
                  tasks: [
                    {
                      name: 'Second task',
                      tasks: [
                        {
                          name: 'Third task',
                          tasks: [
                            {
                              name: 'Fourth task',
                            },
                          ],
                        },
                      ],
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

  describe('when opening a task and starting to edit a description', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Third task')
      getZeroStatePlaceholder().click()
    })

    it('the zero state placeholder should not be displayed', () => {
      getZeroStatePlaceholder().should('not.exist')
    })

    describe('when navigating to another task using the Task path', () => {
      it(
        'the description should be displayed in read-only mode',
        { retries: { runMode: 3, openMode: 1 } },
        () => {
          getTaskPathItems().eq(0).click()
          getReadField(0).should('have.text', 'Initial task description')
        }
      )
    })

    describe('when editing task description and navigating to another task using sub tasks', () => {
      before(() => {
        taskdetailPage.get.descriptionField().click()
        cy.get('[data-test=task-cell-test]').eq(0).click()
        cy.wait(5000) // DOM Detach Issue
      })

      it('the description placeholder', () => {
        getZeroStatePlaceholder().should('be.visible')
      })
    })
  })
})

function getReadField(lineNumber) {
  return taskdetailPage.get
    .descriptionField()
    .find(`[data-test="raw-text-line${lineNumber}"]`)
}

const getZeroStatePlaceholder = () =>
  taskdetailPage.get.descriptionZeroStatePlaceholder()
