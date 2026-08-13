import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('add_remove_people_private_workstream.cy', () => {
  let returnedMatter, matterUser, user, anotherUser

  const ACTIVE_WORKSTREAM = 'activeProject'

  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser('', true)
        .then(createdUser => {
          teamMember = createdUser
          updateFTUE(teamMember, { hasSeenMatterAdmin: true })
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [teamMember, nonTeamMember],
              matterAdmins: [teamMember],
              projects: [
                {
                  name: 'Private Project',
                  tasks: [{ name: 'Task' }, { name: 'task2' }],
                },
                {
                  name: 'Public  Project',
                  tasks: [],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
        .then(() => {
          cy.login(teamMember)
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}`,
            method: 'PATCH',
            body: {
              isPrivate: true,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
    })
  })

  describe('when navigate to the people tab of a private workstream', () => {
    before(() => {
      cy.login(teamMember.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test=private-workstream-settings]').eq(0).click()
    })

    it('should have a button to add members', () => {
      cy.get('[data-test=add-team-member-button]').should('be.visible')
    })

    describe('when add someone to the private workstream', () => {
      before(() => {
        cy.wait(1000)
        cy.get('[data-test=add-team-member-button]').click()
        cy.backendRoute('POST', '/matter/*/workstreams/*/teammembers').as(
          'add-member'
        )
        cy.backendRoute('GET', '/matter/*/workstreams**').as('get-project')
        cy.get('[data-test=options-label]').eq(0).click()
        cy.wait('@add-member')
        cy.wait('@get-project')
        cy.wait(1000)
      })

      it('should add them to the private workstream members list', () => {
        cy.get('[data-test=user-name-text]').should('have.length', 2)
      })
      describe('when toggle the workstream to not private and back to private again', () => {
        before(() => {
          cy.wait(5000)
          cy.get('[data-test=status-select-selection-dropdown]').eq(1).click()
          cy.get('[data-test="status-select-off-option"]').click()
          cy.wait(5000)

          cy.get('[data-test=status-select-selection-dropdown]').eq(1).click()
          cy.get('[data-test="status-select-on-option"]').click()
        })

        it('should maintain the private workstream team', () => {
          cy.get('[data-test=visible-user-avatar]')
            .children()
            .should('have.length', 2)
        })
      })
    })
    describe('when remove someone to the private workstream', () => {
      before(() => {
        cy.get('[data-test=private-workstream-settings]').click()
        cy.get('[data-test=delete-button]').eq(0).click()
      })

      it('should have removed them from the private workstream members list', () => {
        cy.get('[data-test=user-name-text]').should('have.length', 1)
      })
    })
  })
})
