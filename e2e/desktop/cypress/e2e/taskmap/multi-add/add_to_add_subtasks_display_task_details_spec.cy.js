import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

// when add used data is updated
describe('add_to_add_subtasks_display_task_details', () => {
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
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
      cy.get('[data-test="add-team-member-button"]').click()
      cy.get('[role=listbox]').children().eq(0).click()
      cy.get('body').click()
    })
    it('should show a tour card', () => {
      cy.get('[data-test="avatar-group"]').should('exist')
    })
  })

  describe('After adding the first user ', () => {
    before(() => {
      cy.login(user1)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
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
      it('should update the text', () => {
        cy.get('[data-test=also-on-info-text]').should('be.visible')
      })
      describe('when going to a subtask', () => {
        before(() => {
          cy.login(user1)
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[1].id
          )
        })
        it('should update all subtasks', () => {
          cy.get('[data-test="avatar-group"]').should('exist')
        })
      })
    })
  })
})
