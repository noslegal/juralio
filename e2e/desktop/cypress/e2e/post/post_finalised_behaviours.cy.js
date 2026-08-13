import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('post_finalised_behaviours.cy', () => {
  let teamMember, teamMember2, fixture
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser()
      .then(createdUser => {
        teamMember2 = createdUser
      })
      .then(createUser)
      .then(createdUser => {
        teamMember = createdUser
      })
      .then(() => {
        const seed = {
          matter: {
            teamMembers: [teamMember, teamMember2],
            matterAdmins: [teamMember],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('when trying to create a note on a Task', () => {
    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${fixture.projects[0].id}/task/${
            fixture.tasks[0].id
          }/posts`,
          method: 'POST',
          body: {
            name: 'Notey note',
            description: 'A test note.',
            finalised: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
        })
      })
    })
    describe('as a mtm', () => {
      before(() => {
        cy.login(teamMember2)
        visitHelpers.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
        cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(0).click()
      })
      it('should not show me the options', () => {
        cy.get('[data-test=task-content-header-menu-button]').should(
          'not.exist'
        )
      })
      it('should not allow me to add people', () => {
        cy.get('[data-test=post-people-add-people-button]').should('not.exist')
      })
      describe('when clicking the people component ', () => {
        before(() => {
          cy.get('[data-test=avatar-group]').click()
        })
        it('should not all delete', () => {
          cy.get('[data-test=delete-icon]').should('not.exist')
        })
      })
    })
  })
})
