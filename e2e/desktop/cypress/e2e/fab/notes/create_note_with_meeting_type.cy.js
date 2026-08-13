import dayjs from 'dayjs'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { openMeetingNote } from '../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_note_with_meeting_type.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateNoteWithType',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'CreateNoteWithType',
              tasks: [{ name: 'Task' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When trying to create a note', () => {
    before(() => {
      appPage.visitTaskByName('Task')
      openMeetingNote()
    })

    describe('and then the note is auto created', () => {
      before(() => {
        cy.wait(2000)
      })

      it('should create a note', () => {
        cy.get('[data-test=note-list-item-selected]', {
          timeout: 30000,
        }).should('be.visible')
      })

      it('which is a meeting', () => {
        cy.get('[data-test=meeting-icon]').should('be.visible')
      })

      describe('when open the people tab', () => {
        before(() => {
          cy.get('[data-test=meeting-note-people-people-manager]', {
            timeout: 30000,
          }).click(20, 20) // People tab
        })

        it('should have creator as attendee', () => {
          cy.get('[data-test=name-text]').eq(0).should('have.text', 'You')
        })
      })
    })
  })
  describe('When editing a meeting note', () => {
    const getDefaultStartTime = () => {
      let now = new Date()
      let minutes = now.getMinutes()
      if (minutes > 30) {
        //return half past
        now.setMinutes(30)
        now.setSeconds(0)
        now.setMilliseconds(0)
      } else {
        now.setMinutes(0)
        now.setSeconds(0)
        now.setMilliseconds(0)
        //return on the hour before
      }
      return now
    }
    const getDefaultEndTime = () => {
      let now = new Date()
      let minutes = now.getMinutes()
      if (minutes < 30) {
        //return half past
        now.setMinutes(30)
        now.setSeconds(0)
        now.setMilliseconds(0)
      } else {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0)
        now.setSeconds(0)
        now.setMilliseconds(0)
        //return on the next hour
      }
      return now
    }
    before(() => {
      cy.wait(2000)
      cy.get('[data-test=meeting-icon]').eq(0).click({ force: true })
    })
    describe('when the note is first loaded', () => {
      it('should have the default meeting times & date', () => {
        cy.get('[data-test=meeting-time-selector]')
          .eq(0)
          .find('input')
          .should(
            'have.value',
            `${getDefaultStartTime()
              .getHours()
              .toString()
              .padStart(
                2,
                '0'
              )}:${getDefaultStartTime()
              .getMinutes()
              .toString()
              .padStart(2, '0')}`
          )
        // '⁦⁨00⁩:⁨00⁩⁩'
        // cy.get('[data-test=meeting-time-selector]')
        //   .eq(1)
        //   .find('input')
        //   .should(
        //     'have.value',
        //     `${getDefaultEndTime()
        //       .getHours()
        //       .toString()
        //       .padStart(
        //         2,
        //         '0'
        //       )}:${getDefaultEndTime()
        //       .getMinutes()
        //       .toString()
        //       .padStart(2, '0')}`
        //   )
        // cy.get('[data-test=meeting-date]', { timeout: 30000 })
        //   .find('input')
        //   .should('have.value', dayjs(new Date()).format('DD⁩ ⁦MMM⁩ ⁦YYYY'))
      })
    })

    describe('when switching back to a note', () => {
      beforeEach(() => {
        cy.get('[data-test=task-content-header-menu-button]').click()
        cy.get('[data-test=task-note-convert]').click()
        cy.wait(2000)
      })
      it('should become a regular note', () => {
        cy.get('[data-test=meeting-date]').should('not.exist')
      })
      it('should become a meeting note again', () => {
        cy.get('[data-test=meeting-date]').should('be.visible')
      })
    })
  })
})
