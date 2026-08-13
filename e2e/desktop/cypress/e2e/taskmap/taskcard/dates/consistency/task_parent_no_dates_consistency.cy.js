import dayjs from 'dayjs'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'

let utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

const convertDateButtonToDateString = dateValue => {
  let setDate = new Date()
  setDate.setDate(dateValue)
  return dayjs(setDate).utc(true).format('ddd D MMM YYYY')
}

describe('task_parent_no_dates_consistency.cy', () => {
  let user, appPage, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskLinking',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'a',
              tasks: [
                {
                  name: 'a',
                  tasks: [
                    {
                      name: 'b',
                      tasks: [
                        {
                          name: 'c',
                        },
                      ],
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
  describe('when setting planned start dates before setting parents dates', () => {
    before(() => {
      cy.login(user)
      appPage.visitTaskMap()
    })
    describe('when moving a subtask start date forward', () => {
      before(() => {
        cy.get('[data-test=task-cell-date-picker-start]', { timeout: 30000 })
          .eq(2)
          .click()
        pushDateButton('6')
      })
      it('should not update both parent and grandparent', () => {
        cy.get('[data-test=task-cell-date-picker-start]')
          .eq(0)
          .should('contain.text', 'Set planned start')
        cy.get('[data-test=task-cell-date-picker-start]')
          .eq(1)
          .should('contain.text', 'Set planned start')
      })
    })

    describe('when setting a childs end date when parents is null', () => {
      before(() => {
        cy.wait(2000)
        cy.get('[data-test=task-cell-date-picker-end]').eq(2).click()
        pushDateButton('7')
      })
      it('should not update the parent', () => {
        cy.get('[data-test=task-cell-date-picker-end]')
          .eq(0)
          .should('contain.text', 'Set planned end')
        cy.get('[data-test=task-cell-date-picker-end]')
          .eq(1)
          .should('contain.text', 'Set planned end')
      })
      after(() => {
        cy.reload()
        cy.login(user)
        appPage.visitTaskMap()
      })
    })
  })
})

const pushDateButton = keyNumber => {
  cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/**').as('patchTask')
  cy.get('button')
    .contains(new RegExp(`^${keyNumber}$`))
    .click({ timeout: 30000,force:true })
  cy.wait('@patchTask')
  cy.wait(1000)
}
