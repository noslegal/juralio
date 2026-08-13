import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced

describe('template_subtask_delete.cy', () => {
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
                { name: 'Transfer Documents' },
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
                    { name: 'Soak' },
                  ],
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

  describe('When opening a template task with subtasks', () => {
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
        cy.get('[data-test=task-cell-test]').should('have.length.at.least', 2).eq(1).click()
      })
    })

    it('there should be 8 subtasks', () => {
      taskDetailPage.get.subTasks().should('have.length', 8)
    })

    describe('When clicking on the operations menu', () => {
      before(() => {
        cy.get('[data-test=options-dropdown]').eq(0).click()
      })

      it('should show the delete option', () => {
        cy.get('[data-test=menu-text-delete]').should('be.visible')
      })

      describe('When clicking on the delete operation', () => {
        before(() => {
          cy.get('[data-test=menu-text-delete]').click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait(3000)
        })

        it('there should be 7 subtasks', () => {
          taskDetailPage.get.subTasks().should('have.length', 7)
        })

        describe('When the page is reloaded', () => {
          before(() => {
            cy.login(user.username)
            cy.reload()
          })

          it('there should be 7 subtasks', () => {
            taskDetailPage.get.subTasks().should('have.length', 7)
          })
        })
      })
    })
  })
})
