import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
// import { addBlocked } from './task_blocker_helpers'

describe('task_details_placeholders_add_remove_display_spec', () => {
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
                { name: 'B', tasks: [{ name: 'child' }] },
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
  describe('when viewing a task with no task teammembers', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[3].id
      )
    })
    it('should show the add team member button', () => {
      cy.get('[data-test="add-team-member-button"]').should('be.visible')
    })

    describe('when adding a placeholder as a ttm', () => {
      before(() => {
        cy.get('[data-test="add-team-member-button"]').click()
        cy.get('[data-test=autocomplete-search]')
          .find('input')
          .type('placeholder')
        cy.wait(1000)
      })
      it('should show the add as a placeholder button', () => {
        cy.get('[data-test="add-as-placeholder"]').should('be.visible')
      })
    })
    describe('when adding a placeholder should show create dialog and add the placeholder', () => {
      before(() => {
        cy.get('[data-test="add-as-placeholder"]').click()
        cy.get('[data-test=lastname-input]').find('input').type('Smith')
      })
      it('should show the add as a placeholder button', () => {
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should show the placeholder in the ttm list', () => {
        cy.get('[data-test=avatar-group]').click()
        cy.get('[data-test=name-text]').eq(0).should('exist')
      })
    })

    describe('when try to refresh the page', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[3].id
        )
        cy.wait(5000)
        cy.get('[data-test=avatar-group]').click()
      })

      it('should persist the added ttm', () => {
        cy.get('[data-test=name-text]').eq(0).should('exist')
      })
    })

    describe('when removing a placeholder ttm from a task', () => {
      before(() => {
        cy.get('[data-test=delete-icon]').click()
      })

      it('should persist the removed ttm', () => {
        cy.get('[data-test=avatar-group]').should('not.exist')
      })
    })
    describe('when try to refresh the page', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[3].id
        )
        cy.wait(5000)
      })
      it('should persist the removed ttm', () => {
        cy.get('[data-test=avatar-group]').should('not.exist')
      })
    })
  })
})
