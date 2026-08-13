import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('roadmap_set_dates.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_set_dates.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'A Project',
                tasks: [{ name: 'A Task' }, { name: 'B Task' }],
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
      cy.title().should('eq', 'Roadmap | A Project | Juralio')
    })

    describe('when picking a end date for a task with no dates', () => {
      before(() => {
        cy.get('[data-test=global-sub-header]')
        cy.wait(2000)
        cy.get('[data-test="roadmap-minimap"]').click()
        cy.get('[data-test=roadmap-end-pin]').eq(0).trigger('mousedown', {
          force: true,
        })
        cy.wait(2000)
        cy.get('[data-test=roadmap-end-pin]').eq(0).trigger('mouseup', {
          force: true,
        })
        cy.wait(2000)
        cy.get('[data-test="confirm-drag"]').click()
        cy.wait(5000)
        cy.get('[data-test=roadmap-end-pin]').eq(0).trigger('mouseover', {
          force: true,
        })
      })
      it('should render the selected date', { retries: 3 }, () => {
        cy.get('[data-test=pin-hover-date]')
          .eq(0)
          .should('not.contain.text', 'Set a planned end date')
      })
    })

    describe('when picking an start date for a task', () => {
      before(() => {
        cy.get('[data-test=global-sub-header]')
        cy.wait(2000)
        cy.get('[data-test=roadmap-start-pin]').eq(0).trigger('mousedown', {
          force: true,
        })
        cy.wait(2000)
        cy.get('[data-test=roadmap-start-pin]').eq(0).trigger('mouseup', {
          force: true,
        })
        cy.wait(2000)
        cy.get('[data-test="confirm-drag"]').click()
        cy.wait(5000)
        cy.get('[data-test=roadmap-start-pin]').eq(0).trigger('mouseover', {
          force: true,
        })
      })
      it('should render the selected end date', { retries: 3 }, () => {
        cy.get('[data-test=pin-hover-date]')
          .eq(0)
          .should('not.contain.text', 'Set a planned start date')
      })
    })
  })
})
