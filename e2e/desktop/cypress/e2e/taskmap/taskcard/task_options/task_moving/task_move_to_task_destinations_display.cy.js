import { getTaskDestinationProjects } from '../../../../../../../helpers/data/task_operations_test_project_data'
import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { checkTaskMapLevelAndDepthCounts } from '../../../../../../../helpers/taskmap/task-map-helper'
import {
    checkListOfTasks,
    openTaskMoveToNewParentTask
} from '../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_move_to_task_destinations_display.cy', () => {
  let user, appPage, fixture
  let { moveDialog } = taskDetailPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveNewParentDestinationTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getTaskDestinationProjects(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the taskmap is initially rendered', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    checkTaskMapLevelAndDepthCounts([
      { depth: 1, expectedCount: 4 },
      { depth: 2, expectedCount: 3 },
      { depth: 3, expectedCount: 1 },
      { depth: 4, expectedCount: 1 },
      { depth: 5, expectedCount: 1 },
      { depth: 6, expectedCount: 1 },
    ])
  })

  describe('When the Move dialog is opened', () => {
    let list = [
      ['Swan', '2'],
      ['Dog', '4'],
      ['Bear', '5'],
      ['Giraffe', '6'],
      ['Swallow', '7'],
      ['Spider', '8'],
      ['Beetle', '9'],
      ['Ant', '10'],
      ['Amoeba', '11'],
    ]
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Crow')
      openTaskMoveToNewParentTask()
    })

    it('should display a list of valid destination tasks', () => {
      checkListOfTasks(list)
    })

    it('level 6 task should be disabled/greyed out', () => {
      cy.get('[data-test=search-result-list-item]')
        .eq(list.length - 1)
        .should('have.attr', 'aria-disabled', 'true')
    })

    it('other tasks should be enabled/not greyed out', () => {
      for (let i = 0; i < list.length - 1; i++) {
        cy.get('[data-test=search-result-list-item]')
          .eq(i)
          .should('not.have.attr', 'aria-disabled')
      }
    })
  })

  describe('When the Move dialog is opened for deepest task', () => {
    let list = [
      ['Panda', '1'],
      ['Swan', '2'],
      ['Crow', '3'],
      ['Dog', '4'],
      ['Bear', '5'],
      ['Giraffe', '6'],
      ['Swallow', '7'],
      ['Spider', '8'],
      ['Beetle', '9'],
    ]

    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Amoeba')
      openTaskMoveToNewParentTask()
    })

    it('should display a list of valid destination tasks', () => {
      checkListOfTasks(list)
    })

    it('should display all destinations as available', () => {
      for (let i = 0; i < list.length; i++) {
        cy.get('[data-test=search-result-list-item]')
          .eq(i)
          .should('not.have.attr', 'aria-disabled')
      }
    })

    describe('When the User enters text', () => {
      before(() => {
        moveDialog.get.destinationTextField().type('a')
      })

      it('should filter list of tasks', () => {
        checkListOfTasks([
          ['Panda'],
          ['Swan'],
          ['Bear'],
          ['Giraffe'],
          ['Swallow'],
        ])
      })
    })

    describe('When the User selects an item', () => {
      before(() => {
        cy.get('[data-test=task-item-name-2]').contains('A. Bear').click()
      })

      it('should show selection in the Textbox', () => {
        moveDialog.get
          .destinationTextField()
          .should('have.value', 'A. Bear - #5')
      })

      it('the pop-up list no longer be shown', () => {
        cy.get('[data-test=task-search-item]').should('not.exist')
      })
    })
  })
})
