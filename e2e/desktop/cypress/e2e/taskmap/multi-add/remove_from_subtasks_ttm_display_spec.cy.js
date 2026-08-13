import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('remove_from_subtasks_ttm_display_spec', () => {
  let fixture, appPage, user1, user2
  const visitHelpers = new VisitHelpers()

  const createUser1 = () =>
    createUser().then(createdUser => (user1 = createdUser))
  const createUser2 = () =>
    createUser().then(createdUser => (user2 = createdUser))

  before(() => {
    createUser1()
      .then(() => createUser2())
      .then(() => {
        const seed = {
          matter: {
            prefix: 'task_moved_event',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [
                  {
                    name: 'Moon',
                    teamMembers: [user2],
                    tasks: [
                      {
                        name: 'Pluto',
                        teamMembers: [user1],
                        followers: [],
                        properties: {
                          description: 'Pluto description',
                        },
                      },
                      {
                        name: 'Mars',
                        teamMembers: [],
                        properties: {
                          description: 'Mars description',
                        },
                      },
                    ],
                  },
                  {
                    name: 'Moon',
                    teamMembers: [user1],
                    tasks: [
                      {
                        name: 'Pluto',
                        teamMembers: [user1],
                        followers: [],
                        properties: {
                          description: 'Pluto description',
                        },
                      },
                      {
                        name: 'Mars',
                        teamMembers: [],
                        properties: {
                          description: 'Mars description',
                        },
                      },
                    ],
                  },
                  {
                    name: 'Moon',
                    teamMembers: [user1],
                    tasks: [
                      {
                        name: 'Pluto',
                        teamMembers: [user1],
                        followers: [],
                        properties: {
                          description: 'Pluto description',
                        },
                      },
                      {
                        name: 'Mars',
                        teamMembers: [],
                        properties: {
                          description: 'Mars description',
                        },
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
  describe('when removing a user not assigned to any subtasks', () => {
    before(() => {
      cy.login(user1)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=task-cell-test]').eq(0).trigger('mouseover')
      cy.get('[data-test=task-preview-opener]').eq(0).click()
      cy.get('[data-test=visible-user-avatar]').eq(0).click()
      cy.get('[data-test=delete-icon]').eq(0).click() //check is correct index
    })
    it('should not show a popover card', () => {
      cy.get('[data-test=remove-from-popover]').should('not.exist')
      cy.get('[data-test=assignee-chip]').should('have.length', 0)
    })
  })
  describe('when removing a user assigned to some subtasks', () => {
    before(() => {
      cy.login(user1)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=task-cell-test]').eq(3).trigger('mouseover')
      cy.get('[data-test=task-preview-opener]').eq(3).click()
      cy.get('[data-test=visible-user-avatar]').eq(0).click()
      cy.get('[data-test=delete-icon]').eq(0).click() //check is correct index
    })
    it('should show a popover card', () => {
      cy.get('[data-test=remove-from-popover]').should('exist')
    })
    describe('when removing from just this subtask', () => {
      before(() => {
        cy.get('[data-test=remove-just-this-task]').click()
      })
      it('should close the popover card', () => {
        cy.get('[data-test=remove-from-popover]').should('not.exist')
        cy.get('[data-test=assignee-chip]').should('have.length', 0)
      })
    })
    describe('when removing from all subtasks', () => {
      before(() => {
        cy.login(user1)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=task-cell-test]').eq(6).trigger('mouseover')
        cy.get('[data-test=task-preview-opener]').eq(6).click()

        cy.get('[data-test=visible-user-avatar]').eq(0).click()
        cy.get('[data-test=delete-icon]').eq(0).click()
        cy.get('[data-test=remove-all-subtasks]').click()
      })
      it('should close the popover card', () => {
        cy.get('[data-test=remove-from-popover]').should('not.exist')
        cy.get('[data-test=assignee-chip]').should('have.length', 0)
      })
      describe('it should also remove from subtasks', () => {
        before(() => {
          cy.get('body').type('{esc}')
        })
        it('should have removed assignments', () => {
          cy.get('[data-test=task-cell-zero-assignee-chip]').should(
            'have.length',
            5
          )
        })
      })
    })
  })
})
