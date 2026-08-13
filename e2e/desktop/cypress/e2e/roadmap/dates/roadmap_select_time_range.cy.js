import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'

describe('roadmap_select_time_range.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_select_time_range.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'A Project',
                tasks: [{ name: 'A Task' }, { name: 'B Task' }],
              },
              {
                name: 'B Project',
                tasks: [
                  {
                    name: 'A Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(2000, 1, 1),
                    },
                  },
                  {
                    name: 'B Task',
                    properties: {
                      // status: 'in-progress',
                      plannedEndDate: new Date(2000, 1, 6),
                    },
                  },
                ],
              },
              {
                name: 'C Project',
                tasks: [
                  {
                    name: 'A Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(2000, 1, 1),
                      plannedEndDate: new Date(2000, 2, 1),
                    },
                  },
                  {
                    name: 'B Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(2000, 1, 8),
                    },
                  },
                ],
              },
              {
                name: 'D Project',
                tasks: [
                  {
                    name: 'A Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(2000, 1, 1),
                      plannedEndDate: new Date(2000, 2, 1),
                    },
                  },
                  // {
                  //   name: 'B Task',
                  //   properties: {
                  //     status: 'in-progress',
                  //     actualStartDate: new Date(2000, 1, 1),
                  //   },
                  // },
                ],
              },
              {
                name: 'E Project',
                tasks: [
                  {
                    name: 'A Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(),
                    },
                  },
                  {
                    name: 'B Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(),
                    },
                  },
                ],
              },
              {
                name: 'F Project',
                tasks: [
                  {
                    name: 'A Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(new Date().getDate() - 200),
                    },
                  },
                  {
                    name: 'B Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(),
                    },
                  },
                ],
              },
              {
                name: 'G Project',
                tasks: [
                  {
                    name: 'A Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(new Date().getDate() - 400),
                    },
                  },
                  {
                    name: 'B Task',
                    properties: {
                      status: 'in-progress',
                      actualStartDate: new Date(),
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

  describe('When navigating to roadmap with no minimap', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap()
    })
    it('should not show the picker when there is no minimap', () => {
      roadmap.timePeriodPicker().should('not.exist')
    })
  })
  describe('When navigating to roadmap with under a weeks worth of data', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap(1)
      cy.get('[data-test=roadmap-minimap-maximized]').click()
    })
    it('should show the picker when there is no minimap', () => {
      roadmap.timePeriodPicker().should('exist')
    })
  })
  describe('When navigating to roadmap with under a months worth of data', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap(2)
    })
    it('should show have two options available', () => {
      roadmap.timePeriodPicker().should('exist')
      roadmap.timePeriodPickerPopoverOption().should('have.length', 0)
    })
  })
  describe('When navigating to roadmap with under a quarter worth of data', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap(3)
      roadmap.timePeriodPickerCurrentSelection().click()
    })
    it('should show have 3 options available', () => {
      roadmap.timePeriodPicker().should('exist')
      roadmap.timePeriodPickerPopoverOption().should('have.length', 3)
    })
    describe('selecting the month option', () => {
      before(() => {
        roadmap.timePeriodPickerPopoverOption().eq(1).click()
      })
      it('should show the selected time period', () => {
        roadmap.timePeriodPicker().should('contain.text', 'Month')
      })
      describe('when hovering over the minus', () => {
        before(() => {
          roadmap.timePeriodPickerPreviousButton().trigger('mouseover')
        })
        it('should show a tooltip with the previous option on it', () => {
          cy.contains('[role=tooltip]', 'Entire').should('be.visible')
        })
      })
      describe('clicking the previous button', () => {
        before(() => {
          roadmap.timePeriodPickerPreviousButton().click()
        })
        it('should update the selected option', () => {
          roadmap.timePeriodPicker().should('contain.text', 'Entire')
        })
        it('should disable the left button', () => {
          roadmap.timePeriodPickerPreviousButton().should('be.disabled')
        })
      })
      describe('clicking the next button', () => {
        before(() => {
          roadmap.timePeriodPickerNextButton().click()
        })
        it('should update the selected option', () => {
          roadmap.timePeriodPicker().should('contain.text', 'Month')
        })
        it('should not disable the left button', () => {
          roadmap.timePeriodPickerPreviousButton().should('not.be.disabled')
        })
      })
      describe('when hovering over the plus', () => {
        before(() => {
          roadmap.timePeriodPickerNextButton().trigger('mouseover')
        })
        it('should show a tooltip with the previous option on it', () => {
          cy.contains('[role=tooltip]', 'Week').should('be.visible')
        })
      })
      describe('when there are no more smaller options', () => {
        before(() => {
          roadmap.timePeriodPickerNextButton().click()
        })
        it('should disable the right button', () => {
          roadmap.timePeriodPickerNextButton().should('be.disabled')
        })
      })
    })
  })

  describe('When navigating to roadmap with under a years worth of data', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap(5)
      roadmap.timePeriodPickerCurrentSelection().click()
    })
    //TODO wait for range changes
    it('should show have 4 options available', () => {
      roadmap.timePeriodPicker().should('exist')
      roadmap.timePeriodPickerPopoverOption().should('have.length', 5)
    })
  })

  describe('When navigating to roadmap with over a years worth of data', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap(6)
      roadmap.timePeriodPickerCurrentSelection().click()
    })
    it('should show have 5 options available', () => {
      roadmap.timePeriodPicker().should('exist')
      roadmap.timePeriodPickerPopoverOption().should('have.length', 5)
    })
  })

  //do the same for under a quarter, under a year and more than a year
})
