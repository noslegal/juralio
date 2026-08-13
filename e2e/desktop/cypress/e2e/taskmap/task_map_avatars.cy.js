import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelper = new VisitHelpers()
describe('task_map_avatars.cy', () => {
  let fixture, appPage, user1, user2

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
                        teamMembers: [user1],
                        followers: [],
                        properties: {
                          description: 'Pluto description',
                        },
                      },
                      {
                        name: 'Mars',
                        teamMembers: [user1, user2],
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
  describe('when viewing the taskmap', () => {
    before(() => {
      //goto taksmap
      cy.login(user1.username)
      visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      // showDoneTasks()
    })
    it('should show the cell with no team members', () => {
      cy.get('[data-test=task-cell-assignee-chip]')
        .eq(0)
        .find('[data-test=task-cell-zero-assignee-chip]')
        .should('exist')
    })
    // describe('hovering over it', () => {
    //   before(() => {
    //     cy.get('[data-test=task-cell-assignee-chip]').eq(0).trigger('mouseover')
    //   })
    //   it('should ask to add a team member', () => {
    //     cy.get('#teamMemberContent').should('have.text', 'Add team member')
    //   })
    // })
    it('should show the cell with one team members', () => {
      cy.get(`[data-test=${user1.firstname}-${user1.lastname}]`).should(
        'have.length',
        3
      )
    })
    it('should show the cell with two team members', () => {
      cy.get('[data-test=task-cell-assignee-chip]')
        .eq(2)
        .find('[data-test=task-cell-assignee-avatar]')
        .should('have.length', '2')
    })
    describe('hovering over it', () => {
      before(() => {
        cy.get('[data-test=task-cell-assignee-chip]').eq(0).trigger('mouseout')

        cy.get('[data-test=task-cell-assignee-chip]').eq(2).trigger('mouseover')
      })
      // it('should ask to add a team member', () => {
      //   cy.get('#teamMemberContent').should(
      //     'contain.text',
      //     `${user1.firstname} ${user1.lastname}`
      //   )

      //   cy.get('#teamMemberContent').should(
      //     'contain.text',
      //     `${user2.firstname} ${user2.lastname}`
      //   )
      // })
    })

    // describe('When of the taskmap and clicking on add an assignee', () => {
    //   before(() => {
    //     cy.get('[data-test=task-cell-zero-assignee-chip]').click()
    //   })

    //   it('should not show', () => {
    //     cy.get('[data-test=user-list-item]').should(
    //       'not.contain.text',
    //       'Not in this matter'
    //     )
    //   })
    // })

    // This Test was not reliable enough for CI.
    // describe('when a task has over 100 members', () => {
    //   before(() => {
    //     new Promise((resolve, reject) => {
    //       ;[...Array(100).keys()].map((value, index, array) => {
    //         createUser().then(newUser => {
    //           addMatterTeamMember(fixture.matter.id, newUser.id)
    //           addTeamMember(
    //             fixture.matter.id,
    //             fixture.projects[0].id,
    //             fixture.tasks[0].id,
    //             newUser.id
    //           )
    //           resolve()
    //         })
    //       })
    //     })

    //     cy.login(user1.username)
    //     visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
    //   })
    //   it('should show render 99+', () => {
    //     cy.get('[data-test=task-cell-assignee-chip]')
    //       .eq(0)
    //       .should('contain', '99+')
    //   })
    //   before(() => {
    //     cy.get('[data-test=task-cell-assignee-chip]').eq(2).trigger('mouseout')

    //     cy.get('[data-test=task-cell-assignee-chip]').eq(0).trigger('mouseover')
    //   })
    //   it('should ask to add a team member', () => {
    //     cy.get('#teamMemberContent').should('contain.text', 'and 95 more')
    //   })
    // })
  })
})
