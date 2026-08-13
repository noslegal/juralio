import { getProjectAToFLevelData } from '../../../../../../../../helpers/data/task_operations_test_project_data'
import { selectDate } from '../../../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../../helpers/matterprojects/fixture_helper'
import { openTaskMoveToSpecificTaskAndConfirm } from '../../../../../../../../helpers/tasks/task_operations_helpers'
import { createUser } from '../../../../../../../../helpers/users/user_api_helper'

describe('task_move_consistency.cy', () => {
  let user, appPage, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskStatusSortingTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectAToFLevelData(),
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the task to move has a PSD', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('task1 A')
      selectDate('[data-test="planned-start-date"]', 2015, 6, 20)

      appPage.visitTaskByName('subtask2 B')
      selectDate('[data-test="planned-start-date"]', 2015, 6, 20)
    })

    describe('and moved to a parent which has a later PSD', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask8 C')
        selectDate('[data-test="planned-start-date"]', 2015, 6, 15)
        cy.wait(5000)
        // cy.get('[data-test=action-dialog-button]').click()
        openTaskMoveToSpecificTaskAndConfirm('subtask2 B', true, false)
      })

      it('should show the date changes', () => {
        cy.get('[data-test=task-update-chip]').should('have.length', 2)
        cy.get('[data-test=date-before]')
          .eq(0)
          .should('have.text', 'Sat 20 Jun 2015')
        cy.get('[data-test=date-after]')
          .eq(0)
          .should('contain.text', 'Mon 15 Jun 2015')
        cy.get('[data-test=date-before]')
          .eq(1)
          .should('have.text', 'Sat 20 Jun 2015')
        cy.get('[data-test=date-after]')
          .eq(1)
          .should('contain.text', 'Mon 15 Jun 2015')
      })

      describe('after confirming', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').eq(1).click()
        })
        it('should be in task map with the correct task selected', () => {
          cy.url().should(
            'contain',
            `matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap?id=${fixture.tasks[8].id}`
          )
        })
      })

      describe('when visiting the moved task', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitTaskByName('subtask8 C')
        })

        it('PSD should be correct', () => {
          cy.get('[data-test="planned-start-date"]')
            // .find('input')
            .should('contain.text', 'Mon 15 Jun 2015')
        })

        describe('its first parents PSD should be updated', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskByName('subtask2 B')
          })

          it('PSD should be correct', () => {
            cy.get('[data-test="planned-start-date"]')
              // .find('input')
              .should('contain.text', 'Mon 15 Jun 2015')
          })
        })
        describe('its parents parent PSD should be updated', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskByName('task1 A')
          })

          it('PSD should be correct', () => {
            cy.get('[data-test="planned-start-date"]')
              // .find('input')
              .should('contain.text', 'Mon 15 Jun 2015')
          })
        })
      })
    })
  })

  describe('When the task to move has a PED', () => {
    before(() => {
      cy.login(user.username)

      appPage.visitTaskByName('task2 A')
      selectDate('[data-test="planned-end-date"]', 2015, 6, 25)

      appPage.visitTaskByName('subtask7 B')
      selectDate('[data-test="planned-end-date"]', 2015, 6, 25)
    })

    describe('and moved to a parent which has a later PED', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('subtask8 C')
        cy.backendRoute('POST', '/matter/*/workstreams/*/task/**').as(
          'postTask'
        )
        selectDate('[data-test="planned-end-date"]', 2015, 6, 26)
        // cy.get('[data-test=action-dialog-button]').click()
        openTaskMoveToSpecificTaskAndConfirm('subtask7 B', true, false)
        cy.wait('@postTask')
      })
      it('should confirm the changes to be made', () => {
        //here

        cy.get('[data-test=task-update-chip]').should('have.length', 2)
      })

      describe('when visiting the moved task', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').eq(1).click()
          cy.login(user.username)
          appPage.visitTaskByName('subtask8 C')
        })

        it('should be on correct task', () => {
          //here
          cy.get('[data-test=read-field]').should('have.text', 'subtask8 C')
        })

        it('its PED should be updated', () => {
          cy.get('[data-test="planned-end-date"]')
            // .find('input')
            .should('contain.text', 'Fri 26 Jun 2015')
        })

        describe('its first parents  PED should be updated', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskByName('subtask7 B')
          })

          it('PED should be correct', () => {
            cy.get('[data-test="planned-end-date"]')
              // .find('input')
              .should('contain.text', 'Fri 26 Jun 2015')
          })
        })
        describe('its parents parent PED should be updated', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitTaskByName('task2 A')
          })

          it('PED should be correct', () => {
            cy.get('[data-test="planned-end-date"]')
              // .find('input')
              .should('contain.text', 'Fri 26 Jun 2015')
          })
        })
      })
    })
  })

  // describe('When the task to move has a AED', () => {
  //   before(() => {
  //     cy.login(user.username)
  //     cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as('patchTask')

  //     appPage.changeTaskStatus('task2 A', 2, true)
  //     selectDate('[data-test="actual-start-date"]', 2015, 6, 20)
  //     selectDate('[data-test="actual-end-date"]', 2015, 6, 25)
  //     // cy.get('[data-test=action-dialog-button]').click()
  //     cy.wait('@patchTask')
  //   })

  //these tests all run fine locally but have issues when running on circle

  // describe('and moved to a parent which has an earlier AED', () => {
  //   before(() => {
  //     cy.login(user.username)
  //     cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as('patchTask')

  //     appPage.changeTaskStatus('task1 A', 2, true)
  //     selectDate('[data-test="actual-start-date"]', 2015, 6, 20)
  //     selectDate('[data-test="actual-end-date"]', 2015, 6, 22)
  //     cy.get('[data-test=action-dialog-button]').click()
  //     cy.wait('@patchTask')

  //     selectDate('[data-test="actual-start-date"]', 2015, 6, 20)
  //     selectDate('[data-test="actual-end-date"]', 2015, 6, 22)
  //     appPage.visitTaskByName('subtask8 C')
  //     selectDate('[data-test="actual-start-date"]', 2015, 6, 20)
  //     cy.get('[data-test=action-dialog-button]').click()
  //     cy.wait('@patchTask')

  //     openTaskMoveToSpecificTaskAndConfirm('subtask2 B', true, false)
  //   })
  //   it('should show the knock on effects', () => {
  //     cy.get('[data-test=task-update-chip]').should('have.length', 2)
  //     cy.get('[data-test=date-before]')
  //       .eq(1)
  //       .should('have.text', 'Mon 22 Jun 2015')
  //     cy.get('[data-test=date-after]')
  //       .eq(1)
  //       .should('contain.text', 'Thu 25 Jun 2015')
  //     cy.get('[data-test=date-before]')
  //       .eq(2)
  //       .should('have.text', 'Fri 26 Jun 2015')
  //     cy.get('[data-test=date-after]')
  //       .eq(2)
  //       .should('contain.text', 'Sat 27 Jun 2015')
  //   })

  //   describe('when visiting the moved task', () => {
  //     before(() => {
  //       cy.get('[data-test=action-dialog-button]').eq(1).click()
  //       cy.login(user.username)
  //       appPage.visitTaskByName('subtask8 C')
  //     })

  //     it('should show correct task', () => {
  //       cy.get('[data-test=read-field]').should('have.text', 'subtask8 C')
  //     })

  //     it('its AED should be updated', () => {
  //       cy.get('[data-test="actual-end-date"]')
  //         .find('input')
  //         .should('have.value', 'Thu 25 Jun 2015')
  //     })

  //     describe('its first parents AED should be updated', () => {
  //       before(() => {
  //         cy.login(user.username)
  //         appPage.visitTaskByName('subtask2 B')
  //       })

  //       it('AED should be correct', () => {
  //         cy.get('[data-test="actual-end-date"]')
  //           .find('input')
  //           .should('have.value', 'Thu 25 Jun 2015')
  //       })
  //     })
  //     describe('its parents parent AED should be updated', () => {
  //       before(() => {
  //         cy.login(user.username)
  //         appPage.visitTaskByName('task1 A')
  //       })

  //       it('AED should be correct', () => {
  //         cy.get('[data-test="actual-end-date"]')
  //           .find('input')
  //           .should('have.value', 'Thu 25 Jun 2015')
  //       })
  //     })
  //   })
  // })
  //})

  // describe('When the task to move has a ASD', () => {
  //   before(() => {
  //     cy.login(user.username)
  //     appPage.visitTaskByName('subtask8 C')
  //   })

  //   describe('and moved to a parent which has a later ASD', () => {
  //     before(() => {
  //       cy.login(user.username)
  //       openTaskMoveToSpecificTaskAndConfirm('subtask5 B', true, false)
  //     })
  //     it('should show the knock onm effects', () => {
  //       cy.get('[data-test=task-update-chip]').should('have.length', 2)
  //     })

  //     describe('when visiting the moved task', () => {
  //       before(() => {
  //         cy.get('[data-test=action-dialog-button]').eq(1).click()
  //         cy.login(user.username)
  //         appPage.visitTaskByName('subtask8 C')
  //       })

  //       it('should be on correct task', () => {
  //         cy.get('[data-test=read-field]').should('have.text', 'subtask8 C')
  //       })

  //       it('its ASD should be updated', () => {
  //         cy.get('[data-test="actual-start-date"]')
  //           .find('input')
  //           .should('have.value', 'Sat 20 Jun 2015')
  //       })

  //       describe('its first parents ASD should be updated', () => {
  //         before(() => {
  //           cy.login(user.username)
  //           appPage.visitTaskByName('subtask5 B')
  //         })

  //         it('ASD should be correct', () => {
  //           cy.get('[data-test="actual-start-date"]')
  //             .find('input')
  //             .should('have.value', 'Sat 20 Jun 2015')
  //         })
  //       })
  //       describe('its parents parent ASD should be updated', () => {
  //         before(() => {
  //           cy.login(user.username)
  //           appPage.visitTaskByName('task2 A')
  //         })

  //         it('ASD should be correct', () => {
  //           cy.get('[data-test="actual-start-date"]')
  //             .find('input')
  //             .should('have.value', 'Sat 20 Jun 2015')
  //         })
  //       })
  //     })
  //   })
  // })
})
