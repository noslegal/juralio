import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/destinationdialog/destinationdialog_page'

const visitHelpers = new VisitHelpers()

describe('create_task_destination_dialog_display.cy', () => {
  let user

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Create From FAB Spec',
              tasks: [{ name: 'Task To have subtasks' }],
            },
          ],
        },
      }
      generateFixture(seed)
    })
  })

  describe('when the Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Next pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        cy.backendRoute('/matters**').as('mattersFetch')
        cy.get('[data-test="action-dialog-button"]').click()
        cy.wait('@mattersFetch')
      })

      it('should have the header text', () => {
        cy.get('[data-test="dialog-header-title-text"]').should(
          'contain.text',
          'Choose a destination for your new task'
        )
      })

      describe('should have a task destination select component', () => {
        it('should be visible', () => {
          destinationPage.get.matterSelectorInput().should('be.visible')
        })
        describe('when the destination select is clicked', () => {
          before(() => {
            cy.backendRoute('/matter/*/workstreams*').as('projectsFetch')
            destinationPage.get.matterSelectorInput().click()
            destinationPage.get.matterSelectorInput().type('testm')
            destinationPage.get.matterSelectorItem().click()
            cy.wait('@projectsFetch')

            cy.backendRoute('/matter/*/workstreams/*').as('projectFetch')

            destinationPage.get.parentTypeSelector().click()
          })
          it(
            'Has header "Choose a destination" ',
            { retries: { runMode: 2, openMode: 1 } },
            () => {
              destinationPage.get
                .parentTypeHeader()
                .should('contain.text', 'Choose a destination')
            }
          )
          it('Has an option "level A" ', () => {
            destinationPage.get
              .parentTypeLevelA()
              .should('contain.text', 'As a new phase')
          })
          it('Has an option "Under an existing task" ', () => {
            destinationPage.get
              .parentTypeSubTaskOf()
              .should('contain.text', 'As a subtask')
          })

          describe('When "level A task" is selected', () => {
            before(() => {
              destinationPage.get.parentTypeLevelA().click()
            })
            it('Has the header hidden', () => {
              destinationPage.get.parentTypeHeader().should('not.exist')
            })
            it('Has the level A task option selected ', () => {
              destinationPage.get
                .parentTypeSelector()
                .should('contain.text', 'As a new phase')
            })
          })

          describe('When "subtask of" is selected', () => {
            before(() => {
              destinationPage.get.parentTypeSelector().click()
              destinationPage.get.parentTypeHeader().click()
              destinationPage.get.parentTypeSubTaskOf().click()
            })
            it('Has the header hidden', () => {
              destinationPage.get.parentTypeHeader().should('not.exist')
            })
            it('Has the "Under an existing task" option selected', () => {
              destinationPage.get
                .parentTypeSelector()
                .should('contain.text', 'As a subtask')
            })
            it('The task selector is displayed', () => {
              destinationPage.get.taskSelector().should('be.visible')
            })
          })

          describe('When "level A task" is re-selected', () => {
            before(() => {
              destinationPage.get.parentTypeSelector().click()
              destinationPage.get.parentTypeLevelA().click({ force: true })
            })
            it('Has the header hidden', () => {
              destinationPage.get.parentTypeHeader().should('not.exist')
            })
            it('Has the level A option selected', () => {
              destinationPage.get
                .parentTypeSelector()
                .should('contain.text', 'As a new phase')
            })
            it('The task selector is no longer displayed', () => {
              destinationPage.get.taskSelector().should('not.exist')
            })
          })
        })
      })
    })
  })
})
