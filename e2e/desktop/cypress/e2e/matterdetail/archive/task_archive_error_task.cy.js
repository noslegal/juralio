import { archiveTaskById } from '../../../../../helpers/matterdetails/archive_task_helpers'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import {
  createSubTask,
  createTask,
} from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visit_helpers = new VisitHelpers()

describe('task_archive_error_task.cy', () => {
  let userHasBothRole,
    matter,
    project,
    firstLevelATask,
    lastSubTask,
    aLevelATask

  describe('When attempting to restore a task to a project ', () => {
    before(() => {
      createUser()
        .then(user => {
          userHasBothRole = user
          updateFTUE(userHasBothRole, { hasSeenMatterAdmin: true })
          return createMatter()
        })
        .then(m => {
          matter = m
          addMatterAdmin(matter.id, userHasBothRole.id)
          addTeamMember(matter.id, userHasBothRole.id).then(() => {
            cy.login(userHasBothRole.username)
            createProject(matter.id, 'project2')
            createProject(matter.id, 'project1').then(createdProject => {
              project = createdProject
              createTask(matter.id, project.id, 'not-started', 'first task')
                .then(levelAtask => {
                  firstLevelATask = levelAtask
                  for (let i = 1; i < 9; i++) {
                    createSubTask(
                      matter.id,
                      project.id,
                      'not-started',
                      'subtaskB' + i,
                      levelAtask.id
                    ).then(subtask => {
                      lastSubTask = subtask
                    })
                  }
                })
                .then(() => {
                  for (let i = 0; i < 15; i++) {
                    createTask(
                      matter.id,
                      project.id,
                      'not-started',
                      'task' + i + 1
                    ).then(task => {
                      aLevelATask = task
                    })
                  }
                  createSubTask(
                    matter.id,
                    project.id,
                    'not-started',
                    'subtaskC',
                    lastSubTask.id
                  )
                    .then(parentTask => {
                      createSubTask(
                        matter.id,
                        project.id,
                        'not-started',
                        'subtaskD',
                        parentTask.id
                      )
                    })
                    .then(parentTask => {
                      createSubTask(
                        matter.id,
                        project.id,
                        'not-started',
                        'subtaskE',
                        parentTask.id
                      )
                    })
                    .then(parentTask => {
                      createSubTask(
                        matter.id,
                        project.id,
                        'not-started',
                        'subtaskF',
                        parentTask.id
                      )
                    })
                })
            })
          })
        })
    })

    describe('When the parent task has also been archived ', () => {
      before(() => {
        cy.login(userHasBothRole.username)
        archiveTaskById(matter.id, project.id, lastSubTask.id)
        archiveTaskById(matter.id, project.id, firstLevelATask.id)

        visit_helpers.visitArchiveTable(userHasBothRole, matter.id)
        cy.get(`[data-test=Restore${lastSubTask.id}]`).click()
        cy.get('[data-test=radio-prev]').click({ force: true })
        cy.get('[data-test=action-dialog-button]').click({ force: true })
      })

      it('should show an error message', () => {
        cy.get('[data-test=dialog-content]').should(
          'contain',
          'The original location is not available'
        )
      })

      after(() => {
        // cy.get('[data-test=cancel-dialog-button]').click()
      })
    })

    describe('When a project is closed ', () => {
      before(() => {
        cy.login(userHasBothRole.username)
        visit_helpers.visitArchiveTable(userHasBothRole, matter.id)
        cy.get('[data-test=projects]').click()
        cy.get('[data-test=status-select-selection-dropdown]').eq(2).click()
        cy.get('[data-test=status-select-off-option]').click()
        cy.get('[data-test=status-select-selection-dropdown]')
          .eq(2)
          .should('contain', 'Closed')
        cy.get('[data-test=archive]').click()
        cy.get(`[data-test=Restore${firstLevelATask.id}]`).should('not.exist')
      })

      it('Should not show closed project in destination project drop down', () => {
        cy.get('[data-test=search-result-list-item]').should('not.exist')
      })

      after(() => {
        cy.get('[data-test=projects]').click()
        cy.get('[data-test=status-select-selection-dropdown]').eq(2).click()
        cy.get('[data-test=status-select-on-option]').click()
        cy.get('[data-test=status-select-selection-dropdown]')
          .eq(2)
          .should('contain', 'Active')
        cy.get('[data-test=archive]').click()
        cy.get(`[data-test=Restore${firstLevelATask.id}]`).click()
        cy.get('[data-test=radio-prev]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=snackbar-dismiss]').click()
        cy.get(`[data-test=Restore${lastSubTask.id}]`).click()
        cy.get(`[data-test=Restore${lastSubTask.id}]`).click()
        cy.get('[data-test=radio-prev]').click()
        cy.get('[data-test=action-dialog-button]').click()
      })
    })

    describe('When the destination parent task is at the deepest level (Level F)', () => {
      before(() => {
        cy.login(userHasBothRole.username)
        archiveTaskById(matter.id, project.id, aLevelATask.id)
        visit_helpers.visitArchiveTable(userHasBothRole, matter.id)
        cy.get(`[data-test=Restore${aLevelATask.id}]`).click({ force: true })
        cy.get('[data-test=radio-new]').click()
        cy.get('[data-test=project-select-container]')
          .click()
          .find('input')
          .type('project1')

        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=destination-selection-dropdown]').click()
        cy.get('[data-test=destination-subtask-of]').click()
        cy.get('[data-test=task-select-base]')
          .click()
          .find('input')
          .type('subtaskF')
        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('Should show an error message', () => {
        cy.get('[data-test=dialog-content]').should(
          'contain',
          'Selected parent task is at level F, the lowest possible level in a project.'
        )
      })
    })

    describe('When the destination parent task has 8 subtasks', () => {
      before(() => {
        cy.login(userHasBothRole.username)
        visit_helpers.visitArchiveTable(userHasBothRole, matter.id)
        cy.get(`[data-test=Restore${aLevelATask.id}]`).click({ force: true })
        cy.get('[data-test=radio-new]').click()
        cy.get('[data-test=project-select-container]')
          .click()
          .find('input')
          .type('project1')

        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=destination-selection-dropdown]').click()
        cy.get('[data-test=destination-subtask-of]').click()
        cy.get('[data-test=task-select-base]')
          .click()
          .find('input')
          .type('first task')
        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('Should show an error message', () => {
        cy.get('[data-test=dialog-content]').should(
          'contain',
          'Selected parent task already has 8 sub tasks, the maximum possible.'
        )
      })
    })

    describe('When there is not enough space on the task map for the tasks to be restored', () => {
      before(() => {
        cy.login(userHasBothRole.username)
        archiveTaskById(matter.id, project.id, firstLevelATask.id)
        visit_helpers.visitArchiveTable(userHasBothRole, matter.id)
        cy.get(`[data-test=Restore${firstLevelATask.id}]`).click({
          force: true,
        })
        cy.get('[data-test=radio-new]').click()
        cy.get('[data-test=project-select-container]')
          .click()
          .find('input')
          .type('project1')

        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=destination-selection-dropdown]').click()
        cy.get('[data-test=destination-subtask-of]').click()
        cy.get('[data-test=task-select-base]')
          .click()
          .find('input')
          .type('task01')
        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('Should show an error message', () => {
        cy.get('[data-test=dialog-content]').should(
          'contain',
          'The task has too many levels of sub task to fit under the selected parent task. Only 6 levels are allowed in a project.'
        )
      })

      after(() => {
        cy.get('[data-test=cancel-dialog-button]').click()
        cy.get(`[data-test=Restore${firstLevelATask.id}]`).click()
        cy.get('[data-test=radio-prev]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=snackbar-dismiss]').click()
        cy.get(`[data-test=Restore${aLevelATask.id}]`).click()
        cy.get(`[data-test=Restore${aLevelATask.id}]`).click()
        cy.get('[data-test=radio-prev]').click()
        cy.get('[data-test=action-dialog-button]').click()
      })
    })

    describe('When the project has 16 level A tasks', () => {
      before(() => {
        cy.login(userHasBothRole.username)
        archiveTaskById(matter.id, project.id, lastSubTask.id)
        visit_helpers.visitArchiveTable(userHasBothRole, matter.id)
        cy.get(`[data-test=Restore${lastSubTask.id}]`).click({ force: true })
        cy.get('[data-test=radio-new]').click()
        cy.get('[data-test=project-select-container]')
          .click()
          .find('input')
          .type('project1')

        cy.get('[data-test=search-result-list-item]').eq(0).click()
        cy.get('[data-test=destination-selection-dropdown]').click()
        cy.get('[data-test=destination-level-a]').click()
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('Should show an error message', () => {
        cy.get('[data-test=dialog-content]').should(
          'contain',
          'There are already 16 level A tasks, the maximum possible.'
        )
      })
    })
  })
})
