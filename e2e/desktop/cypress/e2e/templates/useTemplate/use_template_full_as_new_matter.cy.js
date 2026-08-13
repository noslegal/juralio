import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { openSelector } from '../../../../../helpers/navigation/project-selector-helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import {
  createTemplate,
  createTemplateResource,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_full_as_new_matter.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user, fixture, newTemplate

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'project ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {},
                {},
                {
                  name: 'MOON',
                  tasks: [
                    {},
                    {
                      tasks: [{}, { tasks: [{}, {}, {}] }],
                    },
                  ],
                },
                {},
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When visiting the template overview', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id)
        .then(template => {
          newTemplate = template
        })
        .then(() => {
          createTemplateResource(
            newTemplate.id,
            'test',
            'https://www.google.com'
          )
        })
        .then(() => {
          publishTemplate(newTemplate.id)
          visitHelpers.visitTemplateOverview(newTemplate.id)
        })
    })

    it('should have map displayed', () => {
      cy.get('[data-test=container]').should('have.length', 1)
    })

    it('should have 12 cells in total', () => {
      cy.get('[data-test=cell]').should('have.length', 12)
    })

    describe('when the "Use template" button is clicked"', () => {
      before(() => {
        cy.get('[data-test=use-template-button]').click()
      })

      describe('The Use this template dialog appears', () => {
        it('should have the header text and radio buttons', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Whole or part of template?'
          )
        })

        describe('and clicked through via full template option', () => {
          before(() => {
            cy.get('[data-test=use-full-template-radio]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('it should should the destination dialog', () => {
            cy.get('[data-test=dialog-header-title-text]').should('be.visible')
          })

          it('should have correct dialog title', () => {
            cy.get('[data-test=dialog-header-title-text]').should(
              'have.text',
              'Choose a destination for your template'
            )
          })

          describe('and switching to using an existing project', () => {
            describe('and entering matter details', () => {
              before(() => {
                cy.get('[data-test=new-matter-button]').click()
                cy.get('[data-test=action-dialog-button]').click()
              })
              it('should only let you advance when all fields have been filled', () => {
                cy.get('[data-test=position-select]', { timeout: 30000 }).click()
                cy.get('[data-test=position-option-advisor]').click()
                cy.get('[data-test=client-name]').clear().type('c')
                cy.get('[data-test=action-dialog-button]').should('be.disabled')
                cy.get('[data-test=name]').type('m')
                cy.get('[data-test=reference-number]').clear()
                cy.get('[data-test=action-dialog-button]').should('be.disabled')
                cy.get('[data-test=reference-number]').type('1234')
                cy.get('[data-test=action-dialog-button]').should(
                  'not.be.disabled'
                )
              })

              it('should show the resources checkbox', () => {
                cy.get('[data-test=include-resources]').should('be.visible')
              })

              describe('then click create', () => {
                before(() => {
                  cy.backendRoute('POST', '/matters').as('postMatter')
                  templateSourceDialogPage.get.createButton().click()
                  cy.wait('@postMatter')
                })

                snackbarHelper.checkShownAndHasExpectedText(
                  'New workstream successfully created from template'
                )
              })

              describe('in the new matter', () => {
                before(() => {
                  cy.login(user.username)
                  cy.reload()
                  cy.get('[data-test=go-to-matter-admin]').click()
                })
                it('should have taken the user to the matter admin section', () => {
                  cy.get('[data-test=client-name]', { timeout: 30000 }).should(
                    'contain',
                    'c'
                  )
                  cy.get('[data-test=matter-name]').should('contain', 'm')
                  cy.get('[data-test=user-defined-reference-number]').should(
                    'contain',
                    1234
                  )
                })

                it('should have added the tasks to the workstream', () => {
                  openSelector()
                  cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
                  cy.get('[data-test=workstream-chip-tasks]').should(
                    'contain',
                    11
                  )
                })
              })

              describe('when visitng the matter', () => {
                before(() => {
                  cy.login(user.username)
                  cy.reload()
                  cy.get('[data-test=go-to-matter-overview]').click()
                })
                it('should have one resource', () => {
                  cy.get('[data-test=resource-count]', {
                    timeout: 30000,
                  }).should('contain', '1 Resource')
                  cy.get('[data-test=card]', { timeout: 30000 }).should(
                    'contain',
                    'test'
                  )
                })
              })
            })
          })
        })
      })
    })
  })
})
