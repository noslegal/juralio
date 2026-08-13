import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  clickHoverButton,
  triggerHoverButtons,
} from '../../../../../helpers/taskmap/task-map-helper'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_partial_as_level_A.cy', () => {
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
            cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
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
                .eq(2)
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

              describe('and switching to using an existing project', () => {
                before(() => {
                  cy.get('[data-test=matter-switcher-filter]').eq(0).click()
                  cy.get('[data-test=matter-switcher-filter]')
                    .eq(0)
                    .find('input')
                    .type(fixture.matter.name)
                  cy.wait(1000)
                  cy.get('[data-test=matter-switcher-matter-item]')
                    .eq(0)
                    .click()
                  cy.wait(5000)
                  cy.get('[data-test=action-dialog-button]').click()
                })

                describe('then choose level A as destination and click create', () => {
                  before(() => {
                    cy.wait(3000)
                    triggerHoverButtons('MOON')
                    clickHoverButton('[data-test=hover-button-bottom]')
                    cy.wait(5000)
                  })

                  describe(' navigate to the created matter overview', () => {
                    before(() => {
                      cy.login(user.username)
                      cy.get('[data-test=matter-switcher-button]').click()
                      cy.get('[data-test=matter-switcher-matter-item]')
                        .eq(0)
                        .click()
                      cy.get('[data-test=matter-switcher-workstream-chip]', {
                        timeout: 30000,
                      })
                        .eq(0)
                        .click()
                      cy.wait(3000)
                    })

                    it('should have 19 not-started tasks', () => {
                      cy.get('[data-test="not-started-tasks"]').should(
                        'contain.text',
                        19
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
  })
})
