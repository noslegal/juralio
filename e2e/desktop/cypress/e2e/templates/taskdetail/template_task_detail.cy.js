import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced

describe('template_task_detail.cy', () => {
  let user, fixture, newTemplate, clickedTask

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_task_detail.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  tasks: [
                    { name: 'Disco Dingo' },
                    { tasks: [] },
                    { tasks: [{}, { tasks: [{}, {}, {}] }] },
                  ],
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When clicking on a task in the template map', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        clickedTask = template.tasks.find(task => task.level == 1)

        cy.visit('/#/templates')

        cy.backendRoute('GET', '/projecttemplates/*/tasks').as(
          'postProjectTemplate'
        )
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
        cy.wait('@postProjectTemplate')
        cy.get('[depth=1]').should('have.length.at.least', 1).eq(0).click()
      })
    })

    it('should show template task details page', () => {
      cy.url().should(
        'contains',
        `template/${newTemplate.id}/task/${clickedTask.id}`
      )
    })

    it('displays the template task name', () => {
      cy.get('[data-test=task-name]').should('contain', clickedTask.name)
    })

    it('should not display the options menu button', () => {
      cy.get('[data-test=template-options-button]').should('not.exist')
    })

    it('displays the correct task level', () => {
      taskDetailPage.get.jurNumber().should('contain', 'A')
    })

    it('should show header task map navigation button', () => {
      cy.get('[data-test=taskmap-navigation]').should('exist')
      cy.get('[data-test=header-navigation-inbox-button]').should('not.exist')
    })

    describe('When a sub task card is clicked on from the details page', () => {
      before(() => {
        cy.login(user.username)
        cy.visit(`/#/template/${newTemplate.id}/task/${clickedTask.id}`)
        clickSubTask()
      })

      it('navigates to that sub task template', () => {
        cy.get('[data-test=task-name]').should('contain', 'Disco Dingo')
      })
    })
  })

  function clickSubTask(index) {
    taskDetailPage.get
      .subTasks()
      .eq(index ? index : 0)
      .click()
  }
})
