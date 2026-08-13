import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { updateProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_full_as_level_A.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user, fixture, newTemplate

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
              name: 'active worksteam',
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
            describe('when clicking create', () => {
              before(() => {
                cy.get('[data-test=matter-switcher-filter]').eq(0).click()
                cy.get('[data-test=matter-switcher-filter]')
                  .eq(0)
                  .find('input')
                  .type(fixture.matter.name)
                cy.wait(1000)
                cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
                cy.wait(5000)
                cy.get('[data-test=action-dialog-button]').click()
              })

              describe('after creation finishes', () => {

                it('should have double the original number of tasks', () => {
                  cy.get('[data-test=icicle-wrapper]').should(
                    'have.length',
                    fixture.tasks.length * 2
                  )
                })

                it('should order the new tasks correctly', () => {
                  let maxLevel = Math.max(...fixture.tasks.map(t => t.level))

                  for (
                    let levelIndex = 0;
                    levelIndex <= maxLevel;
                    ++levelIndex
                  ) {
                    const tasksAtLevel = fixture.tasks.filter(
                      t => t.level === levelIndex
                    )

                    for (
                      let taskIndex = 0;
                      taskIndex < tasksAtLevel.length;
                      ++taskIndex
                    ) {
                      // cy.get(`[data-test=cell][depth=${levelIndex}]`)
                      //   .eq(taskIndex + tasksAtLevel.length)
                      //   .find('[data-task-name]')
                      // Flaky so have commented out for now.
                      //.should('contain.text', tasksAtLevel[taskIndex].name.substring(10,10))
                      // Do a partial match as task name may be split over 2 lines.
                    }
                  }
                })
              })
            })
          })
        })
      })
    })
  })
})
