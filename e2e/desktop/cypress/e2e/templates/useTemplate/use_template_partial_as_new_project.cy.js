import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createProjectFromTemplateSingle } from '../../../../../helpers/templates/template_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced
const newProjectName = nameGenerator.generate().spaced

describe('use_template_partial_as_new_project.cy', () => {
  let user, fixture, newTemplate
  const visitHelpers = new VisitHelpers()

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
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
            { name: 'project 2', tasks: [] },
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
        it('should have the header text', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Whole or part of template?'
          )
        })

        describe('and clicked through via partial template option', () => {
          before(() => {
            cy.get('[data-test=use-partial-template-radio]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should enter selection mode', () => {
            cy.get('[data-test=task-cell-test]').should(
              'have.css',
              'opacity',
              '0.5'
            )
          })

          describe('when a task is selected', () => {
            before(() => {
              cy.get('[data-test=task-cell-test]').eq(2).click()
            })

            it('it should be highlighted', () => {
              cy.get('[data-test=task-cell-test]')
                .eq(3)
                .should('have.css', 'opacity', '1')
            })

            it('children should be highlighted', () => {
              for (let i = 3; i < 10; i++) {
                cy.get('[data-test=task-cell-test]')
                  .eq(i)
                  .should('have.css', 'opacity', '1')
              }
            })

            describe('when clicking continue', () => {
              before(() => {
                cy.get('[data-test=confirm-selection-button]').click({
                  force: true,
                })
              })

              it('it should should the destination dialog', () => {
                cy.get('[data-test=dialog-header-title-text]').should(
                  'be.visible'
                )
              })

              it('should have correct dialog title', () => {
                cy.get('[data-test=dialog-header-title-text]').should(
                  'have.text',
                  'Choose a destination for your template'
                )
              })

              describe('and then type in project name and select destination matter', () => {
                before(() => {
                  createProjectFromTemplateSingle({
                    name: newProjectName,
                  })
                })

                it('should close the dialog', () => {
                  cy.get('[data-test="cancel-dialog-button"]').should(
                    'not.exist'
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
