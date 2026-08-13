import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { openMenuForSubtask } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

let { moveDialog } = taskDetailPage

describe('subtasks_menu.cy', () => {
  let teamMember, matterAdminAndTeamMember, fixture, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        matterAdminAndTeamMember = createdUser
        const seed = {
          matter: {
            prefix: 'subtaskTest',
            teamMembers: [teamMember, matterAdminAndTeamMember],
            matterAdmins: [matterAdminAndTeamMember],
            projects: [
              {
                name: 'SubTaskMenuSpec',
                tasks: [
                  {
                    name: 'Root',
                    tasks: [
                      {
                        name: 'To Rename',
                      },
                      {
                        name: 'To Archive',
                      },
                      {
                        name: 'To Move',
                      },
                      {
                        name: 'To Copy',
                      },
                      {
                        name: 'To Change Status',
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

  const selectMenuOptionForSubtask = (subtaskName, option) => {
    openMenuForSubtask(subtaskName)
    cy.get('[data-test=task-card-option-menu-more]').click()
    cy.get('[data-test=task-card-option-menu] [role=menuitem]')
      .contains(option)
      .click()
  }

  describe('When opening the root task as a TEAM MEMBER', () => {
    before(() => {
      cy.login(teamMember.username)
      appPage.visitTaskByName('Root')
    })

    it('should have the expected subtask layout', () => {
      cy.get('[data-test="done-tasks"]').should('not.exist')
      cy.get('[data-test="in-progress-tasks"]').should('not.exist')
      cy.get('[data-test="not-started-tasks"]').should('be.visible')
    })

    it('should show the expected menu options', () => {
      openMenuForSubtask('To Change Status')
      cy.get('[data-test=task-card-option-menu-more]').click()
      const menuItems = () =>
        cy.get('[data-test=task-card-option-menu] [role=menuitem]')
      menuItems().should('have.length', 12)
      menuItems().eq(0).should('contain', 'Not started')
      menuItems().eq(1).should('contain', 'Set to in progress')
      menuItems().eq(2).should('contain', 'Set to done')
      menuItems().eq(3).should('contain', 'Set to not required')
      menuItems().eq(4).should('contain', 'Rename')
      menuItems().eq(7).should('contain', 'Move')
      menuItems().eq(8).should('contain', 'Copy')
      menuItems().eq(6).should('contain', 'Archive')
      menuItems().eq(5).should('contain', 'Adjust dates')
      menuItems().eq(9).should('contain', 'Convert to Milestone')
      menuItems().eq(0).click()
    })

    describe('When changing the status of a subtask to done and canceling', () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks').as(
          'patchTasks'
        )

        selectMenuOptionForSubtask('To Change Status', 'Set to done')
        cy.wait('@patchTasks')
        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('should appear in the original group', () => {
        cy.get('[data-test="not-started-tasks"] [data-test=task-cell-test]')
          .contains('To Change Status')
          .should('be.visible')
      })
    })

    describe('When changing the status of a subtask to done and confirming', () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks**').as(
          'patchTasks'
        )

        selectMenuOptionForSubtask('To Change Status', 'Set to done')
        cy.wait('@patchTasks')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@patchTasks')
      })

      it('should appear in the new group', () => {
        cy.get('[data-test="done-tasks"] [data-test=task-cell-test]')
          .contains('To Change Status')
          .should('be.visible')
      })
    })

    describe('When changing the status of a subtask to in progress', () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks**').as(
          'patchTasks'
        )

        selectMenuOptionForSubtask('To Change Status', 'Set to in progress')
        cy.wait('@patchTasks')
      })

      it('should appear in the correct group', () => {
        cy.get('[data-test="in-progress-tasks"] [data-test=task-cell-test]')
          .contains('To Change Status')
          .should('be.visible')
      })
    })

    describe('When changing the status of a subtask to not started', () => {
      before(() => {
        cy.backendRoute('PATCH', '/matter/*/workstreams/*/tasks**').as(
          'patchTasks'
        )

        selectMenuOptionForSubtask('To Change Status', 'Set to not started')
        cy.wait('@patchTasks')
      })

      it('should appear in the correct group', () => {
        cy.get('[data-test="not-started-tasks"] [data-test=task-cell-test]')
          .contains('To Change Status')
          .should('be.visible')
      })
    })

    describe('When renaming a task and canceling', () => {
      before(() => {
        selectMenuOptionForSubtask('To Rename', 'Rename')
        cy.get('[data-test=edit-name-field] input')
          .clear()
          .type('Renamed Task{ESC}')
      })

      it('the renamed task should not appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('Renamed Task')
          .should('not.exist')
      })
    })

    describe('When renaming a task and confirming', () => {
      before(() => {
        selectMenuOptionForSubtask('To Rename', 'Rename')
        cy.get('[data-test=edit-name-field] input')
          .clear()
          .type('Renamed Task{ENTER}')
      })

      it('the renamed task should appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('Renamed Task')
          .should('be.visible')
      })
    })

    describe('When copying a task and canceling', () => {
      before(() => {
        selectMenuOptionForSubtask('To Copy', 'Copy')
        cy.get('[data-test=new-task-name-text-field] input').type('Copied Task')
        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('the new task should not appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('Copied Task')
          .should('not.exist')
      })
    })

    describe('When copying a task and confirming', () => {
      before(() => {
        selectMenuOptionForSubtask('To Copy', 'Copy')
        cy.get('[data-test=new-task-name-text-field] input').type('Copied Task')
        cy.backendRoute('POST', 'matter/*/workstreams/*/task/*/copy').as(
          'postCopy'
        )
        cy.backendRoute('matter/*/workstreams/*/task/*').as('fetchTask')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(['@postCopy', '@fetchTask'])
        cy.wait(2000)
      })

      it('the new task should appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('Copied Task')
          .should('be.visible')
      })
    })
  })

  describe('When opening the root task as a MATTER ADMIN and TEAM MEMBER', () => {
    before(() => {
      cy.login(matterAdminAndTeamMember.username)
      appPage.visitTaskByName('Root')
    })

    it('should show the expected menu options', () => {
      openMenuForSubtask('To Change Status')
      cy.get('[data-test=task-card-option-menu-more]').click()
      const menuItems = () =>
        cy.get('[data-test=task-card-option-menu] [role=menuitem]')
      menuItems().should('have.length', 12)
      menuItems().eq(0).should('contain', 'Not started')
      menuItems().eq(1).should('contain', 'Set to in progress')
      menuItems().eq(2).should('contain', 'Set to done')
      menuItems().eq(3).should('contain', 'Set to not required')
      menuItems().eq(4).should('contain', 'Rename')
      menuItems().eq(7).should('contain', 'Move')
      menuItems().eq(8).should('contain', 'Copy')
      menuItems().eq(6).should('contain', 'Archive')
      menuItems().eq(5).should('contain', 'Adjust dates')
      menuItems().eq(9).should('contain', 'Convert to Milestone')
      menuItems().eq(0).click()
    })

    describe('When archiving a task and canceling', () => {
      before(() => {
        selectMenuOptionForSubtask('To Archive', 'Archive')
        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('should continue to appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('To Archive')
          .should('be.visible')
      })
    })

    describe('When archiving a task and confirming', () => {
      before(() => {
        selectMenuOptionForSubtask('To Archive', 'Archive')
        cy.backendRoute('POST', 'matter/*/workstreams/*/task/*/archive').as(
          'postArchive'
        )
        cy.backendRoute('matter/*/workstreams/*/task/*').as('fetchTask')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(['@postArchive', '@fetchTask'])
      })

      it('should no longer exist', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('To Archive')
          .should('not.exist')
      })
    })

    describe('When moving a task and canceling', () => {
      before(() => {
        selectMenuOptionForSubtask('To Move', 'Move')
        cy.get('[data-test=cancel-dialog-button]').click()
      })

      it('the old task should still appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('To Move')
          .should('be.visible')
      })
    })

    describe('When moving a task and confirming', () => {
      before(() => {
        selectMenuOptionForSubtask('To Move', 'Move')
        moveDialog.get.destinationSelectionDropdown().click()
        moveDialog.get.destinationOption.levelA().click()
        cy.backendRoute('POST', 'matter/*/workstreams/*/task/*/move').as(
          'postMove'
        )
        cy.backendRoute('matter/*/workstreams/*/task/*').as('fetchTask')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(['@postMove', '@fetchTask'])
      })

      it('the old task should no longer appear', () => {
        cy.get('[data-test=task-cell-test]')
          .contains('To Move')
          .should('not.exist')
      })
    })
  })
})
