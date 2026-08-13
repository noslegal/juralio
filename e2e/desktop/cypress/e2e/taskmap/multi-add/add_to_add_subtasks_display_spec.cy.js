//tour card on task cell
//tour card on preview
//in task preview
// show add to all subtasks
// show in all subtasks
// when add used button is removed
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

// when add used data is updated
describe('add_to_subtasks_display', () => {
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
                    tasks: [
                      {
                        name: 'Pluto',
                        teamMembers: [],
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
  describe('when adding the first user from the taskmap', () => {
    before(() => {
      cy.login(user1)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=task-cell-zero-assignee-chip]').eq(0).click()
      cy.get('[data-test=user-list-item]').eq(0).click()
      // cy.get('body').click()
    })
    it('should show a tour card', () => {
      cy.get('.reactour__close', { timeout: 30000 }).should('exist')
    })
  })
  describe('when adding the first user from the preview', () => {
    before(() => {
      cy.login(user1)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
      cy.get('[data-test=task-preview-opener]').eq(0).click()
      cy.get('[data-test=add-team-member-button]').eq(0).click()
      cy.get('[data-test=options-label]').eq(0).click()
      cy.get('body').type('{esc}')
    })
    it('should show a tour card', () => {
      cy.get('.reactour__close', { timeout: 30000 }).should('exist')
    })
  })
  describe('when in a task preview with an assigned user', () => {
    before(() => {
      cy.login(user1)
      visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      cy.get('[data-test=task-cell-test]').eq(1).trigger('mouseover')
      cy.get('[data-test=task-preview-opener]').eq(0).click()
      cy.get('[data-test=visible-user-avatar]').eq(0).click()
    })
    it('should show an add to all subtasks button', () => {
      cy.get('[data-test=add-to-all-subtasks]').should('be.visible')
    })
    describe('when that button is clicked', () => {
      before(() => {
        cy.get('[data-test=add-to-all-subtasks]').eq(0).click({ force: true })
        cy.wait(5000)
      })
      it('should update the list', () => {
        cy.get('[data-test=add-to-all-subtasks]').should('have.length', 1)
        cy.get('[data-test=also-on-info-text]').should('be.visible')
      })
      describe('when closing the preview', () => {
        before(() => {
          cy.get('body').click()
        })
        it('should update all subtasks', () => {
          cy.get('[data-test=task-cell-assignee-avatar]').should(
            'have.length',
            4
          )
        })
      })
    })
  })
})
