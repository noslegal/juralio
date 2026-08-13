import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('create_task_viewer.cy', () => {
  let user, user2, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user2 = createdUser

      createUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'testmtaskcreateviewer',
            teamMembers: [user],
            matterViewer: [user2],
            matterAdmins: [user],
            projects: [
              {
                name: 'Task Create Auto LevelA Select',
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })

  describe('when at home screen and Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(user2.username)
      appPage.visitTaskMap(0)
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Next pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should not have a matter selectable', () => {
        cy.get('[data-test=auto-complete-search-term]').eq(0).click()
        cy.get('[data-test=no-results-search]').should('exist')
      })

      describe('when trying from in-context', () => {
        before(() => {
          cy.get('[data-test="cancel-dialog-button"]').click()
          cy.get('[data-test="cancel-dialog-button"]').click()
          cy.get('[data-test=task-cell-test]').eq(0).click('left')
          destinationHelper.openTaskCreateFlowFromFab()
        })

        it('should display the add name field', () => {
          cy.get('[data-test=text-prompt-text-field]').should('exist')
        })
      })
    })
  })
})
