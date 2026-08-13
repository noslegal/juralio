import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced

describe('template_task_name_editing.cy', () => {
  let user, fixture, newTemplate

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_task_name_editing.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'Disco Dingo',
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
        cy.visit('/#/templates')

        cy.backendRoute('/projecttemplates/*').as('fetchProjectTemplates')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
        cy.wait('@fetchProjectTemplates')
        cy.get('[depth=1]').should('have.length.at.least', 1).eq(0).click()
      })
    })

    describe('when editing the template task name', () => {
      before(() => {
        taskDetailPage.get.templateOptionMenuButton().click()
        taskDetailPage.optionMenu.get.renameItem().click()
      })

      it('should toggle the task name into edit state', () => {
        getEditField().should('have.value', 'Disco Dingo')
      })

      describe('when the template task name is changed', () => {
        before(() => {
          getEditField()
            .type('{selectAll}')
            .type('{del}')
            .type('Cosmic Cuttlefish')
            .type('{enter}')
        })
        it('should persist the change and toggle back to read state', () => {
          getReadField().should('have.text', 'Cosmic Cuttlefish')
        })
      })
    })
  })
})

function getReadField() {
  return cy.get('[data-test="task-name"]').find('[data-test="read-field"]')
}

function getEditField() {
  return cy
    .get('[data-test=task-name]')
    .find('[data-test=edit-field]')
    .find('textarea')
    .not('[aria-hidden="true"]')
    .last()
}
