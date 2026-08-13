import {
    getTodayAddDays,
    getTodaySubtractDays
} from '../../../../helpers/date/date_api_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../page/roadmap/roadmap_page'

const TASK_A = 'Long task to make map scrollable'
const TASK_B = 'Design foundations'
const TASK_C = 'Documentation'

describe('roadmap_task_label_scrolling.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_task_label_scrolling',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'A Project',
                tasks: [
                  {
                    name: TASK_A,
                    properties: {
                      actualStartDate: getTodaySubtractDays(100),
                      plannedEndDate: getTodayAddDays(100),
                      status: 'in-progress',
                    },
                  },
                  {
                    name: TASK_B,
                    properties: {
                      actualStartDate: getTodaySubtractDays(1),
                      plannedEndDate: getTodayAddDays(2),
                      status: 'in-progress',
                    },
                  },
                  {
                    name: TASK_C,
                    properties: {
                      plannedStartDate: getTodayAddDays(1),
                      plannedEndDate: getTodayAddDays(2),
                      status: 'not-started',
                    },
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
        project = fixture.projects
      })
  })

  describe('when on the roadmap and zoomed in with tasks off the screen', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap()
      roadmap.timePeriodPickerCurrentSelection().click()
      roadmap.timePeriodPickerPopoverOption().eq(3).click()
      cy.wait(1000)
    })

    describe('when scroll into the past, all the way to the left', () => {
      before(() => {
        cy.get('[data-test=roadmap-tasks]').scrollTo(0, 0)
      })
      it('should have 3 arrows point to the right', () => {
        roadmap.pointRightChevronText().should('have.length', 3)
      })
      it('should have the task names on the arrows', () => {
        roadmap.pointRightChevronText().eq(0).should('have.text', TASK_A)
        roadmap.pointRightChevronText().eq(1).should('have.text', TASK_B)
        roadmap.pointRightChevronText().eq(2).should('have.text', TASK_C)
      })
      describe('when click on a task chevron', () => {
        before(() => {
          roadmap.pointRightChevronText().eq(0).click({ force: true })
        })
        it('should show the task cell', () => {
          cy.get('[data-test=name]').should('contain', TASK_A)
        })
      })
    })

    // describe('when scroll into the future, all the way to the right', () => {
    //   before(() => {
    //     cy.get('[data-test=roadmap-tasks]').scrollTo('right')
    //   })
    //   it('should show arrows pointing', () => {
    //     roadmap.pointLeftChevronText().should('have.length', 2)
    //   })
    //   it('should have the task names on the arrows', () => {
    //     roadmap.pointLeftChevronText().eq(0).should('have.text', TASK_B)
    //     roadmap.pointLeftChevronText().eq(1).should('have.text', TASK_C)
    //   })
    //   it('should have task details of the long task visible', () => {
    //     cy.get('[data-test=name]').should('contain', TASK_A)
    //   })
    //   describe('when click on a task chevron', () => {
    //     before(() => {
    //       roadmap.pointLeftChevronText().eq(0).click({ force: true })
    //     })
    //     it('should show the task cell', () => {
    //       cy.get('[data-test=name]').should('contain', TASK_B)
    //     })
    //   })
    // })
  })
})
