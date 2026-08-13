import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../page/taskdetail/taskdetail_page'

describe('post_placeholder_meeting_add_remove_spec.cy', () => {
  let user, fixture, appPage
  const visitHelpers = new VisitHelpers()
  const meetingAttendees = taskdetail_page.meetingAttendees.get
  before(() => {
    createUser().then((u) => {
      user = u
      const seed = {
        matter: {
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Task 1' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when visiting a note', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitTaskDetails(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=meeting-note]').click()
    })
    it('should allow for post placeholders to be added', () => {
      meetingAttendees.addAttendee().click()
      meetingAttendees.searchMatterPeople().click().type('Place Holder')
      cy.get('[data-test="add-as-placeholder"]').should('be.visible')
    })

    describe('when adding a placeholder should show create dialog and add the placeholder', () => {
      before(() => {
        cy.get('[data-test="add-as-placeholder"]').click()
      })
      it('should show text pre filled', () => {
        cy.get('[data-test=firstname-input]').find('input').type('Place')
        cy.get('[data-test=lastname-input]').find('input').type('Holder')
      })
      it('should show the add as a placeholder button', () => {
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should show the placeholder in the meeting attendee list', () => {
        cy.wait(3000)
        cy.get('[data-test="status-chip"]')
        cy.get('[data-test=avatar-group]').eq(1).click()
        cy.get('[data-test=name-text]').eq(1).should('exist')
        cy.get('[data-test="placeholder-avatar"]').should('exist')
      })
    })

    describe('when removing a placeholder', () => {
      before(() => {
        cy.get('[data-test="delete-icon"]').eq(1).click()
      })
      it('should no longer show the placeholder', () => {
        cy.get('[data-test="placeholder-avatar"]').should('not.exist')
      })
    })
  })
})
