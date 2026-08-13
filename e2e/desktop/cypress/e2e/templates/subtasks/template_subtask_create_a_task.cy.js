import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced

describe('template_subtask_create_a_task.cy', () => {
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

    it('the subtask add button should be displayed', () => {
      taskDetailPage.get.subtaskAddButton().should('be.visible')
    })

    describe('When creating the first task', () => {
      before(() => {
        taskDetailPage.get.subtaskAddButton().click()
        cy.get('[data-test=edit-name-field]')
          .find('input')
          .type('Tomato{enter}')
      })

      it('the subtask add button should be displayed', () => {
        taskDetailPage.get.subtaskAddButton().should('be.visible')
      })
    })
  })
  describe('When opening a task with 8 subtasks', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()

      cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
      cy.get(
        `[data-recordid=${newTemplate.id}] [data-test=template-name]`
      ).click()
      cy.get('[data-test=taskmap-navigation]').click()
      cy.wait('@getTemplateTasks')

      cy.get('[depth=1]').eq(1).click('center', { force: true })
    })

    it('the subtask add button should not be displayed', () => {
      taskDetailPage.get.subtaskAddButton().should('not.exist')
    })
  })
})
