import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/destinationdialog/destinationdialog_page'

const visitHelpers = new VisitHelpers()

describe(
  'create_task_destination_level_A_validation.cy',
  { retries: { runMode: 3, openMode: 1 } },
  () => {
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
                name: 'Level A Validation',
                tasks: [
                  { name: 'Task 1' },
                  { name: 'Task 2' },
                  { name: 'Task 3' },
                  { name: 'Task 4' },
                  { name: 'Task 5' },
                  { name: 'Task 6' },
                  { name: 'Task 7' },
                  { name: 'Task 8' },
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
              {
                name: 'valid level A project',
                tasks: [
                  {
                    name: 'Task 9',
                  },
                ],
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
            .type('Level A Validation')
          cy.backendRoute('/matters*').as('mattersFetch')
          cy.get('[data-test="action-dialog-button"]').click()
          cy.wait('@mattersFetch')
        })

        it('should have the header text', () => {
          cy.get('[data-test="dialog-header-title-text"]').should(
            'have.text',
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
              destinationPage.get.projectSelectorInput().click()
              destinationPage.get
                .projectSelectorInput()
                .type('Level A Validation')
              destinationPage.get.projectSelectorItem().click()
              cy.wait('@projectFetch')

              destinationPage.get.parentTypeSelector().click()
            })
            it('should not show "Level A"', () => {
              destinationPage.get.parentTypeLevelA().should('not.exist')
              destinationPage.get.parentTypeSubTaskOf().click()
            })

            describe('When "subtask of" is selected', () => {
              before(() => {
                destinationPage.get.parentTypeSelector().click()
                destinationPage.get.parentTypeHeader().click()

                destinationPage.get.parentTypeSelector().click()
                destinationPage.get.parentTypeSubTaskOf().click()
              })

              it('Has the "Sub task of" option selected', () => {
                destinationPage.get
                  .parentTypeSelector()
                  .should('contain.text', 'As a subtask')
              })

              it('Has NO error message on the select', () => {
                destinationPage.get
                  .parentTypeSelectValidationMessage()
                  .should('not.exist')
              })

              it('Has a disabled "Create" button', () => {
                destinationPage.get
                  .createButton()
                  .should('have.attr', 'disabled')
              })

              it('The task selector is displayed', () => {
                destinationPage.get.taskSelector().should('be.visible')
              })
            })

            // describe('When "Level A" is re-selected', () => {
            //   before(() => {
            //     destinationPage.get.parentTypeSelector().click()
            //     destinationPage.get.parentTypeLevelA().click()
            //   })

            //   it('Has the header hidden', () => {
            //     destinationPage.get.parentTypeHeader().should('not.be.visible')
            //   })

            //   it('Has the level A option selected', () => {
            //     destinationPage.get
            //       .parentTypeSelector()
            //       .should('contain.text', 'Level A')
            //   })

            //   it('The task selector is no longer displayed', () => {
            //     destinationPage.get.taskSelector().should('not.exist')
            //   })
            // })

            describe('When the project is changed to a valid level A', () => {
              before(() => {
                destinationPage.get.projectSelector().click()
                destinationPage.get
                  .projectSelectorInput()
                  .clear()
                  .type('valid level A project')
                destinationPage.get.projectSelectorItem().click()
              })

              it('Has NO error message on the select', () => {
                destinationPage.get
                  .parentTypeSelectValidationMessage()
                  .should('not.exist')
              })

              it('Has a disabled "Create" button', () => {
                destinationPage.get
                  .createButton()
                  .should('have.attr', 'disabled')
              })

              describe('When "Level A" is selected', () => {
                before(() => {
                  destinationPage.get.parentTypeSelector().click()
                  destinationPage.get.parentTypeLevelA().click()
                })

                it('Has NO error message on the select', () => {
                  destinationPage.get
                    .parentTypeSelectValidationMessage()
                    .should('not.exist')
                })

                it('Has an enabled "Create" button', () => {
                  destinationPage.get
                    .createButton()
                    .should('not.have.attr', 'disabled')
                })
              })
            })
          })
        })
      })
    })
  }
)
