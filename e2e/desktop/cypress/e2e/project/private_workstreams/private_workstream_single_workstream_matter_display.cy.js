import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelper = new VisitHelpers()
let teamMember,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  resource_id

describe('private_workstream_single_workstream_matter_display.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser('', true)
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [teamMember],
              matterAdmins: [teamMember],
              projects: [
                {
                  name: 'Private Project',
                  tasks: [{ name: 'Task' }, { name: 'task2' }],
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
  describe('as a private workstream member in a multi workstream matter', () => {
    describe('when visiting the project overview', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitMatterOverview(fixture.matter.id)
      })
      it('should show the project overview', () => {
        cy.get('[data-test=project-overview-roadmap-level]', {
          timeout: 30000,
        }).should('have.length', 2)
      })
    })
    describe('when visiting the project taskmap', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitMatterTaskMap(fixture.matter.id)
      })
      it('should show the project overview', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          2
        )
      })
    })
    describe('when visiting the project roadmap', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitMatterRoadmap(fixture.matter.id)
      })
      it('should show the project overview', () => {
        cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
          'have.length',
          2
        )
      })
    })
    describe('when visiting the project resources', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitMatterOverview(fixture.matter.id)
        cy.get('[data-test=menuItem]', { timeout: 30000 }).eq(2).click()
        cy.get('[data-test=add-resource-button]').click()
        cy.get('[data-test=add-resource-name]').find('input').type('resource-0')
        cy.get('[data-test=link-url]').find('input').type('https://google.com')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(5000)
      })
      it('should show the project overview', () => {
        cy.get('[data-test=card]').should('have.length', 2)
      })
    })
  })
  // describe('as a regular workstream member in a multi workstream matter', () => {
  //   describe('when visiting the project overview', () => {
  //     before(() => {
  //       cy.login(nonTeamMember.username)
  //       visitHelper.visitMatterOverview(fixture.matter.id)
  //     })
  //     it('should show theerror state', () => {
  //       cy.get('[data-test=zero-state-text]', { timeout: 30000 }).should(
  //         'have.text',
  //         "Oops! You don't have access to this matter"
  //       )
  //     })
  //   })
  //   describe('when visiting the project taskmap', () => {
  //     before(() => {
  //       cy.login(nonTeamMember.username)
  //       visitHelper.visitMatterTaskMap(fixture.matter.id)
  //     })
  //     it('should show theerror state', () => {
  //       cy.get('[data-test=zero-state-text]', { timeout: 30000 }).should(
  //         'have.text',
  //         "Oops! You don't have access to this matter"
  //       )
  //     })
  //   })
  //   describe('when visiting the project roadmap', () => {
  //     before(() => {
  //       cy.login(nonTeamMember.username)
  //       visitHelper.visitMatterRoadmap(fixture.matter.id)
  //     })
  //     it('should show theerror state', () => {
  //       cy.get('[data-test=zero-state-text]', { timeout: 30000 }).should(
  //         'have.text',
  //         "Oops! You don't have access to this matter"
  //       )
  //     })
  //   })
  //   describe('when visiting the project inbox', () => {
  //     before(() => {
  //       cy.login(nonTeamMember.username)
  //       visitHelper.visitMatterTimeLine(fixture.matter.id, false)
  //     })
  //     it('should show theerror state', () => {
  //       cy.get('[data-test=zero-state-text]', { timeout: 30000 }).should(
  //         'have.text',
  //         "Oops! You don't have access to this matter"
  //       )
  //     })
  //   })
  // })
})
