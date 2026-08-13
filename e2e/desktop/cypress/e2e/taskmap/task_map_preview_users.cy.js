import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('task_map_preview_users.cy', () => {
  let user, user2, user3, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      createUser().then(createdUser => {
        user2 = createdUser
        createUser().then(createdUser => {
          user3 = createdUser
          const seed = {
            matter: {
              prefix: 'taskMapTest',
              teamMembers: [user, user2, user3],
              matterAdmins: [user],
              projects: [
                {
                  tasks: [
                    {
                      teamMembers: [user, user2],
                      properties: {
                        name: 'task1',
                      },
                    },
                    {
                      properties: {
                        name: 'task2',
                      },
                    },
                    {
                      properties: {
                        name: 'task3',
                      },
                    },
                  ],
                },
                {},
              ],
            },
          }

          fixture = generateFixture(seed)
          appPage = getWrapper(fixture)
        })
      })
    })
  })

  describe('when hovering over a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
    })
    it('should show an eye', () => {
      cy.get('[data-test=task-preview-opener]').should('be.visible')
    })
    describe('when hovering off a task', () => {
      before(() => {
        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseout')
      })
      it('should hide the eye', () => {
        cy.get('[data-test=task-preview-opener]').should('not.be.visible')
      })
    })
    describe('when clicking on the eye', () => {
      before(() => {
        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
      })
      it('should open the task preview', () => {
        cy.get('[data-test=task-preview]').should('be.visible')
        cy.get('[data-test=task-preview-title]').should('have.text', 'task1')
        cy.get('[data-test=task-preview-description]').should('not.exist')
        cy.get('[data-test=avatar-group]').children().should('have.length', 2)
      })
    })
    describe('when clicking on the add team member button', () => {
      before(() => {
        cy.get('[data-test=add-team-member-button]').click()
      })
      it('should show the autocomplete', () => {
        cy.get('[data-test=autocomplete-search]').should('be.visible')
        cy.get('[role=listbox]').should('be.visible')
      })
      it('should show the remaining team member options', () => {
        cy.get('[data-test=options-label]').should('have.length', 2)
        cy.get('[data-test=options-label]').eq(0).contains('matter creator')
        cy.get('[data-test=options-label]')
          .eq(1)
          .contains(`${user3.firstname} ${user3.lastname}`)
      })
    })
    describe('clicking an option', () => {
      before(() => {
        cy.get('[data-test=options-label]').eq(1).click()
        cy.focused().type('{esc}')
      })
      it('should add the user to the team', () => {
        cy.get('[data-test=avatar-group]').children().should('have.length', 3)
      })
    })
    describe('wehn closing the preview', () => {
      before(() => {
        cy.get('[data-test=task-preview]').type('{esc}')
        // cy.get('body').click()
        cy.wait(1000)
      })
      it('should show the user in the task card', () => {
        cy.get('[data-test=task-cell-assignee-chip]')
          .eq(0)
          .children()
          .eq(0)
          .should('have.text', '+2')
      })
    })
    describe('when viewing the team list', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap()
        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
        cy.get('[data-test=avatar-group]').children().eq(0).click()
      })
      it('should show the remove cross', () => {
        cy.get('[data-test=delete-icon]').should('have.length', 3)
      })
    })
    describe('when removing a user', () => {
      before(() => {
        cy.get('[data-test=delete-icon]').eq(0).click({ force: true })
      })
      it('should update the page', () => {
        cy.get('[data-test=delete-icon]').should('have.length', 2)
        cy.get('[data-test=avatar-group]').children().should('have.length', 2)
      })
    })
  })
})
