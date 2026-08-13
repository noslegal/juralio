import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('template_subtask_copy.cy', () => {
  let user, fixture, newTemplate, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_subtask_copy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                {
                  name: 'Print Documents',
                  tasks: [{ name: 'Shred' }],
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When opening a task with no subtasks', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        appPage.visitTemplates()

        cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
        cy.wait('@getTemplateTasks')
        cy.get('[depth=1]').should('have.length.at.least', 1).eq(0).click()
      })
    })

    it('the subtasks should be displayed', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 1)
    })

    describe('When clicking on the operations menu', () => {
      before(() => {
        cy.get('[data-test=options-dropdown]').eq(0).click()
      })

      it('should show the copy option', () => {
        cy.get('[data-test=menu-text-copy]').should('be.visible')
      })

      describe('When clicking on the copy operation', () => {
        before(() => {
          cy.get('[data-test=menu-text-copy]').click()
        })

        it('Should open the copy dialog', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'contain',
            'Copy task:'
          )
          cy.get('[data-test=dialog-header-title-text]').should(
            'contain',
            'Shred'
          )
        })

        describe('When entering a new name', () => {
          before(() => {
            cy.get('[data-test=new-task-name-text-field]')
              .find('input')
              .type('Duplicate')
              .type('{enter}')
          })

          it('there should be 2 subtasks', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 2)
          })

          it('the new subtask should appear second in the list', () => {
            cy.get('[data-test=task-cell-test]')
              .eq(0)
              .should('contain.text', 'Shred')
            cy.get('[data-test=task-cell-test]')
              .eq(1)
              .should('contain.text', 'Duplicate')
          })

          describe('When copying the new subtask', () => {
            before(() => {
              cy.get('[data-test=options-dropdown]').eq(1).click()
              cy.get('[data-test=menu-text-copy]').click()
              cy.get('[data-test=new-task-name-text-field]')
                .find('input')
                .type('Clone')
                .type('{enter}')
            })
            it('there should be 3 subtasks', () => {
              cy.get('[data-test=task-cell-test]').should('have.length', 3)
            })

            it('the new subtask should appear third in the list', () => {
              cy.get('[data-test=task-cell-test]')
                .eq(0)
                .should('contain.text', 'Shred')
              cy.get('[data-test=task-cell-test]')
                .eq(1)
                .should('contain.text', 'Duplicate')
              cy.get('[data-test=task-cell-test]')
                .eq(2)
                .should('contain.text', 'Clone')
            })
            describe('When the page is refreshed', () => {
              before(() => {
                cy.login(user.username)
                cy.reload()
              })
              it('there should be 3 subtasks', () => {
                cy.get('[data-test=task-cell-test]').should('have.length', 3)
              })

              it('the new subtask should appear third in the list', () => {
                cy.get('[data-test=task-cell-test]')
                  .eq(0)
                  .should('contain.text', 'Shred')
                cy.get('[data-test=task-cell-test]')
                  .eq(1)
                  .should('contain.text', 'Duplicate')
                cy.get('[data-test=task-cell-test]')
                  .eq(2)
                  .should('contain.text', 'Clone')
              })
            })
          })
        })
      })
    })
  })
})
