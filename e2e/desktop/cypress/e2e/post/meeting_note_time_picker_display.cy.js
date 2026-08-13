import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('meeting_note_time_picker_display.cy', () => {
  let user, fixture, appPage
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser().then(u => {
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
    it('should show the time pickers', () => {
      cy.get('[data-test=meeting-time-selector]', { timeout: 5000 }).should(
        'have.length',
        2
      )
    })
    it('should show a start and end time', () => {
      cy.get('[data-test=meeting-time-selector]')
        .eq(0)
        .find('label')
        .should('contain.text', 'Start time')
      cy.get('[data-test=meeting-time-selector]')
        .eq(1)
        .find('label')
        .should('contain.text', 'End time')
    })
    describe('when editing the field manually', () => {
      before(() => {
        cy.get('[data-test=meeting-time-selector]')
          .eq(0)
          .type('{selectall}{leftArrow}01{rightArrow}13')
        cy.get('body').click()
      })
      // it('should have updated the date', () => {
      //   cy.get('[data-test=meeting-time-selector]')
      //     .eq(0)
      //     .find('input')
      //     .should('have.value', '⁦⁨01⁩:⁨13⁩⁩')
      // })

      //flaky with system time on cypress
      // describe('when setting the end date to before the start', () => {
      //   before(() => {
      //     cy.get('[data-test=meeting-time-selector]')
      //       .eq(1)
      //       .type('{selectall}{leftArrow}01{rightArrow}00')
      //     cy.wait(1000)
      //   })
      //   it('should update the start date', () => {
      //     cy.get('[data-test=meeting-time-selector]')
      //       .eq(0)
      //       .find('input')
      //       .should('have.value', '⁦⁨00⁩:⁨00⁩⁩')
      //   })
      // })
    })
  })
})
