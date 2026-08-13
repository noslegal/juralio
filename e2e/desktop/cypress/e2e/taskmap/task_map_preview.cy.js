import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import pushDateButton from '../../../../helpers/tasks/task_date_picker_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('task_map_preview.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  properties: {
                    name: 'task1',
                    plannedStartDate: new Date(2000, 3, 3),
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

  describe('when hovering over a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      cy.wait(3000)
      cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
      cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
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
      })
    })
    describe('when clicking set planned start date', () => {
      before(() => {
        cy.get('[data-test=task-date-picker]').eq(0).click()
      })
      describe('when setting a planned start date', () => {
        before(() => {
          pushDateButton(10)
        })
        it('should set the planned start date', () => {
          cy.get('[data-test=task-date-picker]').contains(' 10 ')
        })
      })
    })
    describe('when clicking set planned end date', () => {
      before(() => {
        cy.get('[data-test=task-date-picker]').eq(1).click()
      })
      describe('when setting a planned end date', () => {
        before(() => {
          pushDateButton(19)
        })
        it('should set the planned end date', () => {
          cy.get('[data-test=task-date-picker]').eq(1).contains(' 19 ')
        })
      })
    })
    describe('when clicking the add team member', () => {
      before(() => {
        // // cy.get('body').click()
        // cy.get('[data-test=task-preview]').click()
        cy.get('[data-test=add-team-member-button]').click()
      })
      it('should open the  add user popover', () => {
        cy.get('[data-test=autocomplete-search]').should('be.visible')
      })
    })
    describe('when clicking the add post', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskMap()

        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
        cy.get('[data-test=task-preview-add-post]').click()
        cy.get('[data-test=blank-note]').click()
      })
      it('should open the  add post dialog', () => {
        cy.get('[data-test=juralio-dialog]').should('be.visible')
      })
    })
    describe('when clicking on a post', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskMap()

        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
        cy.get('[data-test=task-preview-post]').eq(0).click()
      })
      it('should take the user to the post', () => {
        it('should take the user to the post', () => {})
        cy.get('[data-test=note-listitem-name]')
          .eq(0)
          .should('have.text', `${new Date().toLocaleDateString('en-CA')} Note`)
      })
    })
    describe('when clicking on the goto', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskMap()

        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
        cy.get('[data-test=task-preview-go-to-task-details]').click()
      })
      it('should take the user to the task', () => {
        cy.get('[data-test=read-field]').eq(0).should('have.text', 'task1')
      })
    })
    describe('when clicking the add post', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskMap()

        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
        cy.get('[data-test=task-preview-add-post]').click()
        cy.get('[data-test=document-link]').click()
      })
      it('should open the  add post dialog', () => {
        cy.get('[data-test=juralio-dialog]').should('be.visible')
        cy.get('[data-test=dialog-header-title-text]').should(
          'have.text',
          'Create a new document link'
        )
      })
    })
    describe('when a task is overdue', () => {
      before(() => {
        cy.login(user.username)

        appPage.visitTaskMap()
        cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(0).click()
      })
      it('should have red text', () => {
        cy.get('[data-test=task-date-picker]')
          .eq(0)
          .should('have.css', 'color', 'rgb(176, 0, 32)')
      })
    })
  })
})
