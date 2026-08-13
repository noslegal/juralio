import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const { moveDialog } = taskDetailPage

const newTemplateName = nameGenerator.generate().spaced

describe('template_subtask_move_then_copy.cy', () => {
  let user, fixture, newTemplate, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                {
                  name: 'Print Documents',
                  tasks: [
                    { name: 'Shred' },
                    { name: 'Rip' },
                    { name: 'Tear' },
                    { name: 'Burn' },
                    { name: 'Mark' },
                    { name: 'Scrunch' },
                    { name: 'Score' },
                    { name: 'Monkey' },
                  ],
                },
                { name: 'Bingo' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When opening a task with 8 subtasks', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        appPage.visitTemplates()

        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()

        cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
        cy.get('[data-test=taskmap-navigation]').click()
        cy.wait('@getTemplateTasks')
        cy.backendRoute('/projecttemplates/*/tasks/*').as('getTaskDetail')
        cy.get('[depth=1]').should('have.length.at.least', 1).eq(0).click()
        cy.wait('@getTaskDetail')
        cy.wait(1000)
      })
    })

    describe('When clicking on the operations menu and clicking Move', () => {
      before(() => {
        cy.get('[data-test=options-dropdown]', { timeout: 15000 }).should(
          'have.length.at.least',
          1
        )
        cy.wait(500)
        cy.get('[data-test=options-dropdown]').eq(0).click({ force: true })
        cy.get('[data-test=menu-text-move]').click()
      })

      it('Should open the move dialog', () => {
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          'Move task:'
        )
        cy.get('[data-test=dialog-header-title-text]').should(
          'contain',
          'Shred'
        )
      })

      describe('When clicking on the move operation', () => {
        before(() => {
          moveDialog.get.destinationSelectionDropdown().click()
          moveDialog.get.destinationOption.levelA().click()
          cy.backendRoute('POST', 'projecttemplates/*/tasks/*/move').as(
            'postMove'
          )
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@postMove')
        })

        it('there should be 7 subtasks', () => {
          taskDetailPage.get.subTasks().should('have.length', 7)
        })
      })

      describe('When clicking on the copy operation', () => {
        before(() => {
          cy.wait(1000)
          cy.get('[data-test=options-dropdown]', { timeout: 15000 }).should(
            'have.length.at.least',
            1
          )
          cy.get('[data-test=options-dropdown]').eq(0).click({ force: true })
          cy.get('[data-test=menu-text-copy]').click()
          cy.get('[data-test=new-task-name-text-field]').find('input').focus()
          cy.get('[data-test=new-task-name-text-field]')
            .find('input')
            .type('Duplicate{enter}', { force: true })
        })

        it('there should now be 8 subtasks', () => {
          cy.get('[data-test=task-cell-test]').should('have.length', 8)
        })
        describe('When clicking on the copy operation', () => {
          before(() => {
            cy.wait(1000)
            cy.get('[data-test=options-dropdown]', { timeout: 15000 }).should(
              'have.length.at.least',
              1
            )
            cy.get('[data-test=options-dropdown]').eq(0).click({ force: true })
            cy.get('[data-test=menu-text-copy]').click()
          })

          it('there should now be 8 subtasks', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 8)
          })

          it('should have the "Another template" option selected by default', () => {
            cy.get('[data-test=new-task-destination-type]').should(
              'contain.text',
              'Another template'
            )
          })
        })
      })
    })
  })
})
