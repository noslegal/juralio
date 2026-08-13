import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addTeamMember } from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelper = new VisitHelpers()
let teamMember,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  resource_id

describe('private_workstream_display.cy', () => {
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
  describe('as a private workstream member in a multi workstream matter', () => {
    describe('when visiting the project overview', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
      })
      it('should show the project overview', () => {
        cy.get('[data-test=project-overview-roadmap-level]').should(
          'have.length',
          2
        )
      })
    })
    describe('when visiting the project taskmap', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
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
        visitHelper.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
      })
      it('should show the project overview', () => {
        cy.get('[data-test=task-cell-test]').should('have.length', 2)
      })
    })

    describe('when visiting the project resources', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelper.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
        cy.get('[data-test=menuItem]').eq(2).click()
        cy.get('[data-test=add-resource-button]').click()
        cy.get('[data-test=add-resource-name]').find('input').type('resource-0')
        cy.get('[data-test=link-url]').find('input').type('https://google.com')
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should show the project overview', () => {
        cy.get('[data-test=card]').should('have.length', 2)
      })
    })
  })
  describe('as a regular workstream member in a multi workstream matter', () => {
    describe('when visiting the project overview', () => {
      before(() => {
        cy.login(nonTeamMember.username)
        visitHelper.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
      })
      it('should show theerror state', () => {
        cy.get('[data-test=zero-state-text]').should(
          'have.text',
          "Oops! You don't have access to this workstream"
        )
      })
    })
    describe('when visiting the project taskmap', () => {
      before(() => {
        cy.login(nonTeamMember.username)
        visitHelper.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
      })
      it('should show theerror state', () => {
        cy.get('[data-test=zero-state-text]').should(
          'have.text',
          "Oops! You don't have access to this workstream"
        )
      })
    })
    describe('when visiting the project roadmap', () => {
      before(() => {
        cy.login(nonTeamMember.username)
        visitHelper.visitRoadmap(fixture.matter.id, fixture.projects[0].id)
      })
      it('should show theerror state', () => {
        cy.get('[data-test=zero-state-text]').should(
          'have.text',
          "Oops! You don't have access to this workstream"
        )
      })
    })
  })
  describe('when a matter editor with a private workstream im not part of in the matter', () => {
    before(() => {
      let user1, user2, org, matter
      createOrganisation().then(o => {
        org = o.body
        createUser('', true, true, { roles: ['ROLE_MATTER_CREATOR'] }).then(
          u => {
            user1 = u
            createUser('', true, true).then(u => {
              user2 = u
              cy.login(user1.username, Cypress.env('defaultPassword'))
              cy.request({
                url: `${Cypress.env('serverBaseUrl')}/matters`,
                method: 'POST',
                body: {
                  client: 'client',
                  name: 'my matter',
                  userDefinedReferenceNumber: '12345',
                  description: 'desc!',
                },
              }).then(m => {
                matter = m.body
                createProject(matter.id, 'project1')
                createProject(matter.id, 'project2', { isPrivate: true })
                addTeamMember(
                  matter.id,
                  user2.id,
                  user1.username,
                  Cypress.env('defaultPassword')
                )
                cy.login(user2.username, Cypress.env('defaultPassword'))
                visitHelper.visitMatterOverview(matter.id)
              })
            })
          }
        )
      })
    })
    it('should render the overview', () => {
      cy.get('[data-test=matter-title]', { timeout: 30000 }).should('exist')
    })
  })
})
