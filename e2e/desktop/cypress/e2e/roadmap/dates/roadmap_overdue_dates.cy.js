import {
  getTodayAddDays,
  getTodaySubtractDays,
} from '../../../../../helpers/date/date_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'
import taskDetail from '../../../../../page/taskdetail/taskdetail_page'

const ERROR_RGB = 'rgb(245, 137, 112)'
const IN_PROGRESS_RGB = 'rgb(223, 168, 55)'
const NOT_STARTED_RGB = 'rgb(219, 217, 181)'

const ERROR_COLOUR = '#F58970'
const IN_PROGRESS_COLOUR =
  'invert(0.56) sepia(0.76) saturate(3.89) hue-rotate(3deg) brightness(0.95) contrast(1)'
const NOT_STARTED_COLOUR = '#FCF8E8'
const ERROR_TEXT_COLOUR = 'rgb(176, 0, 32)'
const NORMAL_TEXT_COLOUR = 'rgba(0, 0, 0, 0.54)'

describe('roadmap_overdue_dates', () => {
  let user, fixture, project, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_overdue_dates',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'A Project',
                tasks: [
                  {
                    name: 'In progress PED overdue',
                    properties: {
                      actualStartDate: getTodaySubtractDays(20),
                      plannedEndDate: getTodaySubtractDays(10),
                      status: 'in-progress',
                    },
                  },
                  {
                    name: 'In progress PED before ASD',
                    properties: {
                      plannedEndDate: getTodaySubtractDays(15),
                      status: 'in-progress',
                    },
                  },
                  {
                    name: 'Not started PSD and PED overdue',
                    properties: {
                      plannedStartDate: getTodaySubtractDays(7),
                      plannedEndDate: getTodaySubtractDays(2),
                      status: 'not-started',
                    },
                  },
                  {
                    name: 'Not started PSD overdue',
                    properties: {
                      plannedStartDate: getTodaySubtractDays(7),
                      plannedEndDate: getTodayAddDays(8),
                      status: 'not-started',
                    },
                  },
                  {
                    name: 'Normal task',
                    properties: {
                      plannedStartDate: getTodayAddDays(1),
                      plannedEndDate: getTodayAddDays(3),
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

  describe('When navigating to roadmap of a single task no dates project', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap()
    })
    describe('when there is a in progress task with the PED before the ASD', () => {
      it('should have the ASD pin coloured as in-progress', () => {
        roadmap
          .startPin()
          .eq(0)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', '#DFA837')
          })
      })

      it('should have the PED pin coloured error', () => {
        roadmap
          .endPin()
          .eq(2)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', ERROR_COLOUR)
          })
      })

      it('should have the line connecting the pins coloured as error', () => {
        roadmap
          .pinBridge()
          .eq(1)
          .should('have.css', 'backgroundColor', ERROR_RGB)
      })
    })

    describe('when there is a not started task with a PSD and PED overdue', () => {
      it('should have the PSD pin coloured error', () => {
        roadmap
          .endPin()
          .eq(1)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', ERROR_COLOUR)
          })
      })

      it('should have the line connecting the pins coloured as error', () => {
        roadmap
          .pinBridge()
          .eq(2)
          .should('have.css', 'backgroundColor', ERROR_RGB)
      })
    })

    describe('when there is a not started task with PSD overdue', () => {
      it('should have the PSD pin coloured error', () => {
        roadmap
          .startPin()
          .eq(2)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', ERROR_COLOUR)
          })
      })
      it('should have the PED pin coloured not started', () => {
        roadmap
          .endPin()
          .eq(3)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', NOT_STARTED_COLOUR)
          })
      })
      it('should have the line connecting the pins coloured as error', () => {
        roadmap
          .pinBridge()
          .eq(2)
          .should('have.css', 'backgroundColor', ERROR_RGB)
      })
    })

    describe('when there is a not started with a PSD and PED still due', () => {
      it('should have the PSD pin coloured error', () => {
        roadmap
          .startPin()
          .eq(4)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', NOT_STARTED_COLOUR)
          })
        roadmap
          .endPin()
          .eq(4)
          .within(() => {
            cy.get('circle').should('have.attr', 'fill', NOT_STARTED_COLOUR)
          })
      })
    })
  })

  describe('overdue dates are in red on taskmap, when looking at a task with overdue PSD and PED', () => {
    before(() => {
      cy.login(user)
      appPage.visitTaskMap()
    })

    it('should have the PSD date picker text coloured error', () => {
      roadmap
        .datePickerStart()
        .eq(0)
        .should('have.css', 'color', ERROR_TEXT_COLOUR)
    })

    it('should have the PED date picker text coloured error', () => {
      roadmap
        .datePickerEnd()
        .eq(2)
        .should('have.css', 'color', ERROR_TEXT_COLOUR)
    })
  })

  describe('when looking at the task detail page of a task with an overdue PSD and', () => {
    before(() => {
      cy.login(user)
      appPage.visitTaskByName('Not started PSD and PED overdue')
    })

    it('should have the PSD date picker text coloured error', () => {
      taskDetail.taskDates.get
        .plannedStartDate()
        .find('span')
        // .find('input')
        .should('have.css', 'color', ERROR_TEXT_COLOUR)
    })

    it('should have the PED date picker text coloured error', () => {
      taskDetail.taskDates.get
        .plannedEndDate()
        .find('span')
        // .find('input')
        .should('have.css', 'color', ERROR_TEXT_COLOUR)
    })
  })
})
