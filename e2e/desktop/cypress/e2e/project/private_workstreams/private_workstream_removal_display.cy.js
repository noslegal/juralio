import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

let teamMember,
  nonTeamMember,
  fixture,
  matter_id,
  project_id,
  task_id,
  seed,
  nonAdminMember2
const meetingAttendees = taskDetailPage.meetingAttendees.get

const visitHelpers = new VisitHelpers()
describe('private_workstream_removal_display.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      nonAdminMember = createdUser

      createUser('', true)
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() =>
          createUser('', true)
            .then(u => {
              nonAdminMember2 = u
              seed = {
                matter: {
                  teamMembers: [teamMember, nonAdminMember, nonAdminMember2],
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
              matter_id = fixture.matter.id
              project_id = fixture.projects[0].id
              task_id = fixture.tasks[0].id
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
                cy.login(teamMember)

                cy.apiSpecRequest({
                  url: `${Cypress.env(
                    'serverBaseUrl'
                  )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
                  method: 'POST',
                  body: { users: [nonAdminMember2.id] },
                  failOnStatusCode: false,
                }).then(response => {
                  expect(response.status).to.eq(HttpStatus.OK)
                })
              })
            })
        )
    })
  })
  describe('when removing a user from a pw who was assigned to tasks & posts', () => {
    before(() => {
      cy.login(nonAdminMember2.username)
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
      cy.get('[data-test=add-team-member-button]').click()
      cy.get('[data-test=autocomplete-search]')
        .find('input')
        .type(`${nonAdminMember2.firstname}{enter}`)
      cy.wait(1000)
      cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(0).click()
      cy.get('[data-test=post-people-add-people-button]', {
        timeout: 30000,
      }).click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .find('input')
        .type(`${nonAdminMember2.firstname}`)
      cy.get('[data-test=search-result-list-item]').eq(0).click()
      //meeting note
      cy.login(teamMember.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.', type: 'Meeting' }
      )
      visitHelpers.visitHome()
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        false,
        false
      )
      cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(0).click()
      cy.wait(5000)
      cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(0).click()
      meetingAttendees.addAttendee().click()
      cy.wait(5000)
      meetingAttendees
        .searchMatterPeople()
        .click()
        .type(`${nonAdminMember2.firstname}`)
      cy.backendRoute(
        'POST',
        '/matter/*/workstreams/*/task/*/post/*/postmembers'
      ).as('addMeetingAttendee')
      meetingAttendees.searchItem().first().click()
      cy.wait('@addMeetingAttendee')
      // cy.get('body').click()

      cy.get('[data-test=post-people-add-people-button]', {
        timeout: 30000,
      }).click()
      cy.get('[data-test=auto-complete-search-term]')
        .eq(0)
        .find('input')
        .type(`${nonAdminMember2.firstname}`)
      cy.get('[data-test=search-result-list-item]').eq(0).click()

      cy.login(teamMember.username)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter_id}/workstreams/${project_id}/teammembers`,
        method: 'GET',
        failOnStatusCode: false,
      }).then(response => {
        let ttm = response.body.filter(u => u.user.id === nonAdminMember2.id)[0]
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/matter/${matter_id}/workstreams/${project_id}/teammembers/${
            ttm.id
          }`,
          method: 'DELETE',
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
          cy.login(teamMember.username)
          visitHelpers.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id,
            false,
            false
          )
        })
      })
    })
    it('should show the removed user', () => {
      cy.get(
        `[data-test=user-avatar-${nonAdminMember2.firstname}-${nonAdminMember2.lastname}]`
      ).should('have.length', 1)
      cy.get(
        `[data-test=${nonAdminMember2.firstname}-${nonAdminMember2.lastname}]`
      ).should('have.length', 1)
    })

    // describe('when trying to visit the task as a removed user', () => {
    //   before(() => {
    //     cy.login(nonAdminMember2.username)
    //     visitHelpers.visitTaskDetails(
    //       fixture.matter.id,
    //       fixture.projects[0].id,
    //       fixture.tasks[0].id
    //     )
    //     cy.wait(2000)
    //   })
    //   it('should take me to an unavailable page', () => {
    //     cy.get('[data-test=not-found-page]').should('exist')
    //   })
    // })

    describe('when opening the task team members list', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
        cy.get('[data-test=users-control]').click()
      })
      it('should show the correct text under the removed user', () => {
        cy.get('[data-test=user-list-item]')
          .eq(0)
          .should(
            'contain.text',
            ` ${nonAdminMember2.firstname} ${nonAdminMember2.lastname}Not in this workstream`
          )
      })
    })
    describe('when opening the post', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
        cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(1).click()
        cy.wait(5000)
        cy.get('[data-test=users-control]', { timeout: 30000 }).eq(1).click()
      })
      it('should show the correct text under the removed user', () => {
        cy.get('[data-test=user-list-item]')
          .eq(1)
          .should(
            'contain.text',
            ` ${nonAdminMember2.firstname} ${nonAdminMember2.lastname}Not in this workstream`
          )
      })
    })
    describe('when opening the task team members list in workstream overview roadmap', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
        cy.wait(5000)
        cy.get('[data-test=users-control]').eq(0).click()
      })
      it('should show the correct text under the removed user', () => {
        cy.get('[data-test=user-list-item]')
          .eq(1)
          .should(
            'contain.text',
            ` ${nonAdminMember2.firstname} ${nonAdminMember2.lastname}Not in this workstream`
          )
      })
    })
    describe('when visiting the workstream content table', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
        cy.wait(5000)
        cy.get('[data-test=menuItem]').eq(1).click()
        cy.wait(5000)
        cy.get('[data-test=users-control]').eq(0).click()
      })
      it('should show the correct text under the removed user', () => {
        cy.get('[data-test=user-list-item]')
          .eq(1)
          .should(
            'contain.text',
            ` ${nonAdminMember2.firstname} ${nonAdminMember2.lastname}Not in this workstream`
          )
      })
    })
    describe('when visiting the taskmap screen', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=task-preview-opener]', { timeout: 30000 })
          .eq(0)
          .click()
        cy.get('[data-test=users-control]').click()
      })
      it('should show the correct text under the removed user', () => {
        cy.get('[data-test=user-list-item]')
          .eq(0)
          .should(
            'contain.text',
            ` ${nonAdminMember2.firstname} ${nonAdminMember2.lastname}Not in this workstream`
          )
      })
    })
    describe('when opening the meeting note attendees', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitTaskDetails(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id
        )
        cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(0).click()
        cy.wait(5000)
        cy.get('[data-test=users-control]', { timeout: 30000 }).eq(2).click()
      })
      it('should show the correct text under the removed user', () => {
        cy.get('[data-test=user-list-item]')
          .eq(1)
          .should(
            'contain.text',
            ` ${nonAdminMember2.firstname} ${nonAdminMember2.lastname}Not in this workstream`
          )
      })
    })
  })
})
