import { selectDate } from '../../../../../../helpers/date/picker/date_picker_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('milestone_change_date_levelb.cy', () => {
  let user, fixture, appPage

  const milestoneDetailsPage = taskDetailPage.get

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'milestone_levelb',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                {
                  tasks: [
                    {
                      name: 'a milestone',
                      isMilestone: true,
                      properties: {
                        actualStartDate: new Date(2000, 3, 3),
                      },
                    },
                  ],
                  properties: {
                    actualStartDate: new Date(2000, 3, 3),
                    status: 'in-progress',
                  },
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

  describe('when opening a milestone', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('a milestone')
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=status-selection-item-dot]').eq(1).click()
    })

    it('displays the milestone name', () => {
      milestoneDetailsPage.taskDetailName().should('have.text', 'a milestone')
    })

    describe('When opening the date selector of a reached milestone', () => {
      before(() => {
        cy.get('[data-test=actual-milestone-end-date]').click()
      })
      it('does not allow the date to be cleared', () => {
        cy.get('[role="dialog"]')
          .find('button')
          .contains('Clear')
          .should('not.exist')
      })

      describe('When changing the date of the reached milestone', () => {
        before(() => {
          cy.get('body').type('{esc}')
          // cy.get('[data-test=actual-milestone-end-date]').click()
          selectDate('[data-test=actual-milestone-end-date]', 2015, 6, 16)
        })
        it('the planned end date field should be "Mon 7 Jul 2015"', () => {
          cy.get('[data-test=actual-milestone-end-date]')
            // .find('span')
            .should('contain.text', 'Tue 16 Jun 2015')
        })
      })
    })
  })
})
