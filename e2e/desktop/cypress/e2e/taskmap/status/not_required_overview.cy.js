import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import { openMenuForSubtask } from '../../../../../helpers/taskmap/task-map-helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('not_required_overview.cy', () => {
  let user
  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'taskMapTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'task1',
                  tasks: [{}, {}, {}, {}, {}],
                },
                {},
                {},
                {},
                {},
                {},
                {},
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when visiting the task map', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
    })

    it('should have 12 task cells in total', () => {
      cy.get('[data-test=structureItem]').should('have.length', 12)
    })

    describe('When setting a task to Not Required', () => {
      before(() => {
        openMenuForSubtask('task1')
        cy.get('[data-test=menu-text]').eq(3).click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(5000)
      })

      it('should not show the confirmation dialog', () => {
        cy.get('[data-test=dialog-prompt-text]').should('not.exist')
      })
    })

    describe('when visiting the overview', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitProjectOverview()
      })

      it('should have 7 task cells in total', () => {
        cy.get('[data-test=project-overview-roadmap-level]').should(
          'have.length',
          6
        )
      })

      it('should display task counts with labels', () => {
        cy.get('[data-test=task-count]').should('contain', '12')
      })
    })
  })
})
