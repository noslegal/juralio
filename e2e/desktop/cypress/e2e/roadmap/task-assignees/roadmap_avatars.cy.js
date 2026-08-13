import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelper = new VisitHelpers()
describe('roadmap_avatars.cy', () => {
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
                  },
                  { name: 'Pluto', teamMembers: [user1] },
                  { name: 'Mars', teamMembers: [user1, user2] },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })
  describe('when viewing the roadmap', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitRoadmap()
    })
    it('should show the cell with no team members', () => {
      cy.get('[data-test=task-cell-assignee-chip]')
        .eq(0)
        .find('[data-test=task-cell-zero-assignee-chip]')
        .should('exist')
    })
    describe('hovering over it', () => {
      before(() => {
        cy.get('[data-test=task-cell-assignee-chip]')
          .eq(0)
          .scrollIntoView()
          .trigger('mouseover', { force: true })
      })
      it('should ask to add a team member', () => {
        cy.get('#teamMemberContent').should('have.text', 'Add team member')
      })
    })
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
        .should('have.length', 2)
    })
    describe('hovering over it', () => {
      before(() => {
        cy.get('[data-test=task-cell-assignee-chip]')
          .eq(0)
          .scrollIntoView()
          .trigger('mouseout', { force: true })

        cy.get('[data-test=task-cell-assignee-chip]')
          .eq(2)
          .scrollIntoView()
          .trigger('mouseover', { force: true })
      })
      it('should ask to add a team member', () => {
        cy.get('#teamMemberContent').should(
          'contain.text',
          `${user1.firstname} ${user1.lastname}`
        )
        cy.get('#teamMemberContent').should(
          'contain.text',
          `${user2.firstname} ${user2.lastname}`
        )
      })
    })
  })
})
