import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
// import { addBlocked } from './task_blocker_helpers'

describe('task_blocks_move_spec', () => {
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
                  name: 'parent',
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
                      name: 'test',
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
                cy.wait(2000)
              })
              it('should close the dialog', () => {
                cy.get('[data-test=task-blocker-header]').should('not.exist')
              })
            })

            describe('when trying to move the task into the block task', () => {
              before(() => {
                cy.wait(2000)
                cy.get('[data-test=task-card-option-menu-button]').click()
                cy.get('[data-test=task-card-option-menu-more]').click()
                cy.get('[data-test=task-card-option-menu] [role=menuitem]')
                  .eq(7)
                  .click()
                cy.get('[data-test=destination-selection-dropdown]').click()
                cy.get('[data-test=destination-subtask-of]').click()
                cy.get('[data-test=task-select-base]')
                  .click()
                  .find('input')
                  .type('Task to move')
                cy.get('[data-test=search-result-list-item]').eq(0).click()
                cy.get('[data-test=action-dialog-button]').click()
              })
              it('should show the block will be removed text', () => {
                cy.get('[data-test=task-blocker-alert]').should(
                  'contain',
                  'This task has 1 blocking link. Going ahead will remove it.'
                )
              })
            })

            describe('when trying to move the task into the block task', () => {
              before(() => {
                cy.get('[data-test=cancel-dialog-button]').eq(1).click()
                cy.wait(2000)
                cy.get('[data-test=task-card-option-menu-button]').click()
                cy.get('[data-test=task-card-option-menu-more]').click()
                cy.get('[data-test=task-card-option-menu] [role=menuitem]')
                  .eq(7)
                  .click()
                cy.get('[data-test=destination-selection-dropdown]').click()
                cy.get('[data-test=destination-subtask-of]').click()
                cy.get('[data-test=task-select-base]')
                  .click()
                  .find('input')
                  .type('parent')
                cy.get('[data-test=search-result-list-item]').eq(0).click()
                cy.get('[data-test=action-dialog-button]').click()
              })
              it('should show the block will be removed text', () => {
                cy.get('[data-test=task-blocker-alert]').should(
                  'not.exist',
                  'This task has 1 blocking link. Going ahead will remove it.'
                )
              })
            })
          })
        })
      })
    })
  })
})
