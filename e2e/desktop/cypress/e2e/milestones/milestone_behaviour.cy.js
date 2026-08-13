import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  clickHoverButton,
  getTaskCellByTaskName,
  triggerHoverButtons,
} from '../../../../helpers/taskmap/task-map-helper'
import { enterTaskName } from '../../../../helpers/tasks/task_create_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

/*
Purpose: Check milestones behave as expected - no subtasks, can be subtasks of standard tasks, one date, two statuses (not yet reached and reached).

Test flow: 
  1. Check milestones can't have subtasks
    1.1 By attempting to create a task as a subtask on a milestone via FAB.
    1.2 By attempting to create a task as a subtask on a milestone via taskmap task cell hover buttons.
    1.3 By attempting to create a milestone as a subtask on a milestone via FAB.
    1.4 By attempting to move a milestone to a subtask of another milestone via drag and drop.
    1.5 By attempting to move a milestone to a subtask of another milestone via FAB.
  2. Check milestones can be subtasks of standard tasks
    2.1 By attempting to create a milestone as a subtask on a standard task via FAB.
  3. Check milestones have a single date
    3.1 Should have two states, planned and actual.
  4. Check milestones have two statuses
    4.1 Should have two statuses, Not yet reached and Reached


Date created: 22/11/21
*/

const taskCellColours = {
  'not-started': 'rgb(252, 251, 232)',
  done: 'rgb(209, 229, 230)',
}

describe('milestone_behaviour.cy', () => {
  let user, fixture

  const MILESTONE_NAME_LEVEL_A = 'i am a milestone at level a'
  const MILESTONE_NAME_SUBTASK = 'i am a milestone at subtask level'
  const TASK_NAME = 'i am a task'

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'milestone_behaviour',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'workstream',
              tasks: [
                {
                  name: MILESTONE_NAME_LEVEL_A,
                  properties: {
                    isMilestone: true,
                    status: 'done',
                  },
                },
                {
                  name: TASK_NAME,
                  tasks: [
                    {
                      name: MILESTONE_NAME_SUBTASK,
                      properties: {
                        isMilestone: true,
                      },
                    },
                  ],
                },
                {
                  name: 'another task',
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  const showDoneTasks = () => {
    cy.get('[data-test=minimised-filters]').click({ force: true })
    cy.get('[data-test=done-checkbox]').click()
    cy.wait(2000)
    cy.get('body').click()
  }

  describe('when trying to add a subtask to a milestone', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      showDoneTasks()
    })

    describe('when attempting to create a task as a subtask on a milestone via FAB', () => {
      before(() => {
        enterTaskName('i am a new task')
        cy.get('[data-test=destination-type-selection-dropdown]').click()
        cy.get('[data-test=destination-subtask-of]').click()
        cy.get('[data-test=auto-complete-search-term]')
          .eq(1)
          .find('input')
          .type('milestone')
      })

      it('should filter out the milestone tasks from the list', () => {
        cy.get('[data-test=no-results-search]').should('be.visible')

        // Sanity check - search for a task should return results
        cy.get('[data-test=auto-complete-search-term]')
          .eq(1)
          .find('input')
          .clear()
          .type('task')
        cy.get('[data-test=no-results-search]').should('not.exist')
      })

      after(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
        cy.get('[data-test=cancel-dialog-button]').click()
      })
    })

    describe('attempting to create a task as a subtask on a milestone via taskmap task cell hover buttons', () => {
      before(() => {
        triggerHoverButtons(MILESTONE_NAME_LEVEL_A)
        clickHoverButton('[data-test=hover-button-right]')
      })

      it('should not create a subtask', () => {
        cy.get('[data-test=edit-name-field]').should('not.exist')
        cy.get('[data-test=task-cell-test]').should('have.length', 4)
      })

      it('should display a tooltip explaining why a subtask cannot be created', () => {
        cy.get('[role=tooltip]').should(
          'have.text',
          'Milestones can not have children tasks'
        )
      })

      after(() => {
        cy.reload()
        cy.login(user.username)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        showDoneTasks()
      })
    })

    describe('when attempting to move a milestone to a subtask of another milestone via FAB', () => {
      before(() => {
        cy.get('[data-test=options-dropdown]').eq(0).click()
        cy.get('[data-test=task-card-option-menu-more]').click()
        cy.get('[data-test=task-card-option-menu-move]').click()
        cy.get('[data-test=destination-selection-dropdown]').click()
        cy.get('[data-test=destination-subtask-of]').click()
        cy.get('[data-test=auto-complete-search-term]')
          .eq(0)
          .find('input')
          .type('milestone')
      })

      it('should not have move buttons on the milestones', () => {
        cy.get('[data-test=no-results-search]').should('be.visible')
      })
    })
  })

  describe('when checking milestones have a single date', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      showDoneTasks()
    })

    it('should have two states, planned and actual', () => {
      getTaskCellByTaskName(MILESTONE_NAME_SUBTASK).should(
        'contains.text',
        'Set planned end'
      )
      getTaskCellByTaskName(MILESTONE_NAME_LEVEL_A).should(
        'contains.text',
        'Milestone reached on'
      )
    })
  })

  describe('when check milestones have two statuses, Not yet reached and Reached', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      showDoneTasks()
    })

    it('should have two statuses, Not yet reached and Reached', () => {
      // Reached, same as Done
      cy.get('[data-test=options-dropdown]').eq(0).click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu]').should(
        'contains.text',
        'Reached'
      )
      cy.get('[data-test=task-card-option-menu]').should(
        'contains.text',
        'Set to not yet reached'
      )
      cy.get('body').trigger('keydown', { keyCode: 27 })
      cy.wait(500)
      cy.get('body').trigger('keyup', { keyCode: 27 })
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .should('have.css', 'background-color')
        .and('eq', taskCellColours['done'])
      // Not yet reached, same as Not started
      cy.get('[data-test=options-dropdown]').eq(2).click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu]').should(
        'contains.text',
        'Not yet reached'
      )
      cy.get('[data-test=task-card-option-menu]').should(
        'contains.text',
        'Set to reached'
      )
      cy.get('[data-test=task-cell-test]')
        .eq(2)
        .should('have.css', 'background-color')
        .and('eq', taskCellColours['not-started'])
    })
  })
})
