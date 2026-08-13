import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

const visitHelpers = new VisitHelpers()

describe('template_create_from_project.cy', () => {
  let fixture, user

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'TheMatter',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'TheProject',
              tasks: [{ name: 'Monkey is Kong' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('when signed in as the user', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplates()
    })

    describe('When "Create a template" is clicked"', () => {
      before(() => {
        cy.get('[data-test=fab-button]').click()
        cy.get('[data-test=create-template-flow-dialog-button]').click()
      })

      describe('The Create template dialog appears which', () => {
        it('should have the header text', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Create template'
          )
        })

        it('should have a "Create from scratch" option', () => {
          cy.get('[data-test=create-from-scratch]').should(
            'have.text',
            'Create from scratch'
          )
        })

        it('should have a "Create from existing matter option', () => {
          cy.get('[data-test=create-from-existing-project]').should(
            'have.text',
            'Create from existing matter'
          )
        })

        it('should have a input field for template name', () => {
          cy.get('[data-test=new-template-name]')
            .find('input')
            .should('have.attr', 'placeholder', 'Template name')
        })

        it('should NOT have the CREATE action enabled', () => {
          cy.get('[data-test=action-dialog-button]').should(
            'have.attr',
            'disabled'
          )
        })

        describe('Choose create from project', () => {
          before(() => {
            cy.get('[data-test=create-from-existing-project]').click()
          })

          it('should display source prompt message', () => {
            cy.get('[data-test=templatise-prompt]').should(
              'have.text',
              'Choose what to base the new template on'
            )
          })

          it('should display matter selector', () => {
            templateSourceDialogPage.get
              .matterSelector()
              .find('input')
              .should('have.attr', 'placeholder', 'Choose a matter')
          })

          it('should display project selector which is disabled', () => {
            templateSourceDialogPage.get
              .projectSelectorInput()
              .should('have.attr', 'placeholder', 'Choose a workstream')
              .should('have.attr', 'disabled')
          })

          describe('Enter project source and template name click CREATE', () => {
            before(() => {
              cy.get('[data-test=new-template-name]')
                .find('input')
                .type('testTemplate')

              templateSourceDialogPage.get.matterSelector().click()
              cy.focused().type('TheMatter')

              cy.backendRoute('/matter/*/workstreams*').as('projectFetch')
              templateSourceDialogPage.get.matterSelectorItem().first().click()
              cy.wait('@projectFetch')

              cy.focused().type('TheProject')
              // templateSourceDialogPage.get.projectSelectorItem().first().click()

              cy.backendRoute('POST', '/projecttemplates').as(
                'postProjectTemplate'
              )
              cy.get('[data-test=new-template-name]')
                .find('input')
                .type('{enter}')
              cy.wait('@postProjectTemplate')
            })

            it('should close the dialog', () => {
              cy.get('[data-test="cancel-dialog-button"]').should('not.exist')
            })

            it('should show the new template', () => {
              cy.get('[data-test="template-name"]')
                .last()
                .should('have.text', 'testTemplate')
            })

            snackbarHelper.checkShownAndHasExpectedText(
              'New template successfully created',
              'open'
            )

            describe('then click OPEN on the snackbar', () => {
              before(() => {
                snackbarHelper.clickActionButton()
              })

              it('should open the template view', () => {
                cy.url().should('contains', 'template/')
              })

              it('should have map displayed', () => {
                cy.get('#improved-taskmap-wrapper').should('have.length', 1)
              })

              it('should have 2 cells in total', () => {
                cy.get('[data-test="task-cell-test"]').should('have.length', 1)
              })
            })
          })
        })
      })
    })
  })
})
