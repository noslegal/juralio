import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
// import { addBlocked } from './task_blocker_helpers'

describe('task_blocks_complete_spec', () => {
  let user, fixture
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'p',
              tasks: [
                {
                  name: 'done',
                  properties: { status: 'done' },
                  tasks: [
                    { name: 'done', properties: { status: 'done' } },
                    { name: 'done', properties: { status: 'done' } },
                  ],
                },
                { name: 'B' },
                {
                  name: 'A',
                  tasks: [
                    {
                      name: 'A',
                      tasks: [
                        {
                          name: 'A',
                          tasks: [
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'A',
                      tasks: [
                        {
                          name: 'A',
                          tasks: [
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                          ],
                        },
                      ],
                    },
                    { name: 'A' },
                    { name: 'task to move' },
                    {
                      name: 'A',
                      tasks: [
                        {
                          name: 'A',
                          tasks: [
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                            { name: 'A' },
                          ],
                        },
                      ],
                    },
                  ],
                },
                { name: 'in-progress', properties: { status: 'in-progress' } },
                {
                  name: 'not-required',
                  properties: { status: 'task-not-required' },
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when viewing a task with no blocks', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[3].id
      )
    })
    it('should show the add buttons', () => {
      cy.get('[data-test=add-blockers-button]').should('be.visible')
      //cy.get('[data-test="add-links-button"]').should('be.visible')
    })
    describe('when clicking the add blocks button', () => {
      before(() => {
        cy.get('[data-test=add-blockers-button]').click()
      })
      it('should bring up the blocks dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should('be.visible')
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain.text',
          'Blocking links'
        )
      })
      it('should show the empty state', () => {
        cy.get('[data-test=task-blocker-header]', { timeout: 30000 }).should(
          'contain.text',
          'This task is not blocked by any other tasks'
        )
        cy.get('[data-test=task-blocked-header]').should(
          'contain.text',
          'This task does not block any other tasks'
        )
        cy.get('[data-test=existing-block]').should('not.exist')
        cy.get('[data-test=task-blocks-toggle]')
          .find('p')
          .should('contain.text', 'Blocks')
      })
      describe('when opening the task dropdown', () => {
        before(() => {
          cy.get('[data-test=task-block-selector]').find('input').click()
        })
        it('should list the available blocks', () => {
          cy.get('[data-test=option-name]').should('have.length', 24)
        })
        describe('when changing it to blocked by', () => {
          before(() => {
            cy.get('[data-test=task-blocks-toggle]').click()
            cy.get('[data-test=blocked-by-option]').click()
            cy.get('[data-test=task-block-selector]').find('input').click()
          })
          it('should inclide in progress tasks in the  available blocks', () => {
            cy.get('[data-test=option-name]').should('have.length', 25)
          })
          describe('when selecting a task', () => {
            before(() => {
              cy.get('[data-test=task-block-selector]')
                .find('input')
                .type('task to move')
              cy.wait(5000)
              cy.get('[data-test=option-name]').eq(0).click()
            })
            it('should add it to the list', () => {
              cy.get(
                '[data-test=blocker-wrapper] [data-test=existing-block]'
              ).should('have.length', 1)
              cy.get(
                '[data-test=blocked-wrapper] [data-test=existing-block]'
              ).should('have.length', 0)
            })
            describe('when confirming the block', () => {
              before(() => {
                cy.backendRoute('POST', '/matter/*/block').as('postBlock')
                cy.get('[data-test=action-dialog-button]').click()
                // cy.wait('@postBlock')
                cy.wait(5000)
              })
              it('should close the dialog', () => {
                cy.get('[data-test=task-blocker-header]').should('not.exist')
              })
              describe('when opening the dialog again', () => {
                before(() => {
                  cy.get('[data-test=add-blockers-button]').click()
                })
                it('should show the newly added blocker', () => {
                  cy.get(
                    '[data-test=blocker-wrapper] [data-test=existing-block]'
                  ).should('have.length', 1)
                  cy.get(
                    '[data-test=blocked-wrapper] [data-test=existing-block]'
                  ).should('have.length', 0)
                })
                describe('when moving an existing blocker to blocked', () => {
                  before(() => {
                    cy.get('[data-test=remove-block]').eq(0).click()
                    cy.get('[data-test=action-dialog-button]').click()
                    cy.wait(2000)
                    cy.get('[data-test=add-blockers-button]').click()
                    cy.get('[data-test=task-block-selector]')
                      .find('input')
                      .type('task to move')
                    cy.wait(5000)
                    cy.get('[data-test=option-name]').eq(0).click()
                  })
                  it('should add it to the blocks', () => {
                    cy.get(
                      '[data-test=blocker-wrapper] [data-test=existing-block]'
                    ).should('have.length', 0)
                    cy.get(
                      '[data-test=blocked-wrapper] [data-test=existing-block]'
                    ).should('have.length', 1)
                  })
                  describe('when saving these changes', () => {
                    before(() => {
                      cy.get('[data-test=action-dialog-button]').click()
                      cy.wait(5000)
                      cy.get('[data-test=add-blockers-button]').click()
                    })
                    it('should persist the changes', () => {
                      cy.get(
                        '[data-test=blocker-wrapper] [data-test=existing-block]'
                      ).should('have.length', 0)
                      cy.get(
                        '[data-test=blocked-wrapper] [data-test=existing-block]'
                      ).should('have.length', 1)
                      cy.get('[data-test=cancel-dialog-button]').click()
                    })
                    describe('when changing task status to done', () => {
                      before(() => {
                        cy.get(
                          '[data-test="task-card-option-menu-button"]'
                        ).click()
                        cy.wait(3000)
                        cy.get('[data-test="status-selection-item-dot"]')
                          .eq(2)
                          .click()
                        cy.get('[data-test="action-dialog-button"]').click()
                      })

                      it('should check snackbar pops', () => {
                        cy.wait(2000)
                        cy.get('[data-test=snackbar-message]', {
                          timeout: 30000,
                        })
                          .should('be.visible')
                          .should('contain', '1 task is now unblocked ')
                      })

                      it('should remove all blocked tasks', () => {
                        cy.wait(3000)
                        cy.reload()
                        cy.login(user.username)
                        visitHelpers.visitTaskDetails(
                          fixture.matter.id,
                          fixture.projects[0].id,
                          fixture.tasks[3].id
                        )
                        cy.get('[data-test=add-blockers-button]').click()
                        cy.get(
                          '[data-test=blocker-wrapper] [data-test=existing-block]'
                        ).should('have.length', 0)
                        cy.get(
                          '[data-test=blocked-wrapper] [data-test=existing-block]'
                        ).should('have.length', 0)
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

//show zero state buttons
//when no blocks
//show available blocks in list
//allow removval of selected items
//only in-progress in blockets list
//check tasks go in correct list
//check save works correctly
//remove and re-add existing block - nothing happens
//remove existing block and move it to the other type - OK
//remvoe existing block - OK
//hit 20 tasks
