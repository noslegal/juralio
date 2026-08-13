import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('tour_display.cy', () => {
  let user, fixture, appPage, template
  const visitHelpers = new VisitHelpers()

  before(() => {
    createUser('unknown', true, true, {}, true, false).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: ' tour project',
              tasks: [
                {
                  properties: {
                    name: 'task1',
                    status: 'done',
                  },
                },
                {
                  properties: {
                    name: 'task2',
                  },
                },
                {
                  properties: {
                    name: 'task3',
                  },
                },
              ],
            },
            {},
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    it('should show the status filter tour', () => {
      cy.get('[data-test=status-filter-tour-content]',{timeout:30000}).should('exist')
      cy.get('[data-test=status-filter-tour-content]',{timeout:30000}).should(
        'contain.text',
        'Done tasks are hidden by default'
      )
    })
  })
  describe('when closing the tour', () => {
    before(() => {
      cy.get('.reactour__close').click({ force: true })
    })
    it('should still display the status filter tour', () => {
      cy.get('[data-test=template-draft-tour-content]').should('not.exist')
    })
  })
  describe('when closing the tour forever', () => {
    before(() => {
      cy.window().then(win => {
        win.sessionStorage.clear()
      })
      cy.reload()
      cy.login(user.username)
      appPage.visitTaskMap()
      cy.get('[data-test=status-tour-close-forever]').click()
      cy.reload()
      cy.login(user.username)
    })
    it('should still display the status filter tour', () => {
      cy.get('[data-test=template-draft-tour-content]').should('not.exist')
    })
  })
  // describe('when reseting the tour', () => {
  //   before(() => {
  //     cy.reload()
  //     cy.login(user.username)
  //     appPage.visitTaskMap()
  //     cy.get('[data-test=user-header-navigation-button]').click()
  //     cy.get('[data-test=user-header-org-menu-button]').click()
  //     cy.get('[data-test=search-button]', { timeout: 30000 }).click()
  //     cy.get('[data-test=Search]').type(user.username)
  //     cy.get('[data-test=user-list-item]').eq(0).click(0, 0)
  //     cy.get('[data-test=reset-tours]', { timeout: 30000 }).click()
  //     cy.reload()
  //     cy.login(user.username)
  //     visitHelpers.visitRoadmap(fixture.matter.id,fixture.projects[0].id)
  //   })
  //   it('should show the status filter tour', () => {
  //     cy.get('[data-test=status-filter-tour-content]',{timeout:30000}).should('exist')
  //     cy.get('[data-test=status-filter-tour-content]',{timeout:30000}).should(
  //       'contain.text',
  //       'Done tasks are hidden by default'
  //     )
  //   })
  // })
})
