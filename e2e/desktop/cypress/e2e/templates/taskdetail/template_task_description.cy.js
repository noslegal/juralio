import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced

describe('template_task_description.cy', () => {
  let user, fixture, newTemplate, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_task_description_editing.cy',
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
      appPage = getWrapper(fixture)
    })
  })

  describe('When clicking on a task in the template map', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        appPage.visitTemplates()

        cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click({ timeout: 30000 })
        cy.get('[data-test=taskmap-navigation]').click()
        cy.wait('@getTemplateTasks')
        cy.get('[depth=1]').should('have.length.at.least', 1).eq(0).click()
      })
    })

    describe('when editing the template task description', () => {
      before(() => {
        taskDetailPage.get.descriptionZeroStatePlaceholder().click()
      })

      it('should toggle the task description into edit state', () => {
        getEditField().should('have.value', '')
      })

      describe('when the template task description is changed', () => {
        before(() => {
          getEditField().type(
            'Cosmic Cuttlefish Precise Pangolin Bionic Beaver Trusty Tahr'
          )
          cy.wait(5000)
          cy.get('body').click()
        })
        it('should persist the change and toggle back to read state', () => {
          cy.get('[data-test=task-description] [data-test=raw-text-content]', {
            timeout: 30000,
          }).should(
            'have.text',
            'Cosmic Cuttlefish Precise Pangolin Bionic Beaver Trusty Tahr'
          )
        })

        describe('When navigating to a new task', () => {
          before(() => {
            cy.wait(1000)
            taskDetailPage.get.subtaskAddButton().click()
            cy.get('[data-test=edit-name-field]', { timeout: 30000 })
              .find('input')
              .type('Shuttleworth{enter}')
            cy.wait(1000)
            cy.get('[data-test=edit-name-field]').find('input').type('{esc}')
            cy.get('[data-test=task-cell-test]').eq(0).click()
            taskDetailPage.get.descriptionZeroStatePlaceholder().click()
          })

          it('should toggle the task description into edit state', () => {
            getEditField().should('exist')
          })

          // describe('When navigating to the parent task', () => {
          // before(() => {
          //   cy.get('[data-test=task-level-letter]').eq(0).click()
          //   cy.wait(5000)
          // })

          // it('should show the correct description', () => {
          //   cy.get(
          //     '[data-test=task-description] [data-test=raw-text-content]',
          //     { timeout: 60000 }
          //   ).should(
          //     'have.text',
          //     'Cosmic Cuttlefish Precise Pangolin Bionic Beaver Trusty Tahr'
          //   )
          // })
          // })
        })
      })
    })
  })
})

function getEditField() {
  return cy.get('[data-test=task-description]').find('[contenteditable]')
}
