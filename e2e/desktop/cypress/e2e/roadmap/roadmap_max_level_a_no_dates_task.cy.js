import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../page/roadmap/roadmap_page'

describe('roadmap_max_level_a_no_dates_task.cy', () => {
  let user, fixture, project, appPage

  const now = new Date()
  now.setMinutes(now.getMinutes() - 15) // subtract a few minutes to allow for some deviation & client & server clocks
  let tenDaysBeforeNow = new Date()
  let eightDaysBeforeNow = new Date()
  let oneDayBeforeNow = new Date()
  let tenDaysFromNow = new Date()
  eightDaysBeforeNow.setDate(now.getDate() - 8)
  oneDayBeforeNow.setDate(now.getDate() - 8)
  tenDaysBeforeNow.setDate(now.getDate() - 10)
  tenDaysFromNow.setDate(now.getDate() + 10)

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_max_level_a_task.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Max Level A - No Dates',
                tasks: [
                  { name: 'Task 1' },
                  { name: 'Task 2' },
                  { name: 'Task 3' },
                  { name: 'Task 4' },
                  { name: 'Task 5' },
                  { name: 'Task 6' },
                  { name: 'Task 7' },
                  { name: 'Task 8' },
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

  describe('When navigating to roadmap of a single task no dates project', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap()
    })

    it('should set the correct document title', () => {
      cy.title().should('eq', 'Roadmap | Max Level A - No Dates | Juralio')
    })

    it('should show the Today label', () => {
      roadmap.todayLabel().should('be.visible')
    })

    it('should display the Date Range labels', () => {
      roadmap.startTimelineLabel().should('exist')
    })

    it('should display the Tasks', () => {
      roadmap.tasks().should('have.length', 8)
      roadmap.tasks().eq(0).should('exist')
      roadmap.tasks().eq(1).should('exist')
      roadmap.tasks().eq(2).should('exist')
      roadmap.tasks().eq(3).should('exist')
      roadmap.tasks().eq(4).should('exist')
      roadmap.tasks().eq(5).should('exist')
      roadmap.tasks().eq(6).should('exist')
      roadmap.tasks().eq(7).should('exist')
    })
  })
})
