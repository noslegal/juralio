import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openTemplateTaskCopy } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

const taskStructure = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

describe('template_task_copy_another_template_validation.cy', () => {
  let user, fixture, visitHelpers

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TmplTaskCopyTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Project 1',
              tasks: taskStructure,
            },
            {
              name: 'Project 2',
              tasks: [{}],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      visitHelpers = new VisitHelpers()
    })
  })

  describe('When the template task details are loaded', () => {
    let template1, template2, template3

    before(() => {
      cy.login(user.username)
      createTemplate(crypto.randomUUID(), fixture.projects[0].id).then(template => {
        template1 = template
        createTemplate(crypto.randomUUID(), fixture.projects[1].id).then(template => {
          template2 = template
          createTemplate(crypto.randomUUID(), fixture.projects[1].id).then(template => {
            template3 = template
          })
        })
      })
    })

    describe('When trying to copy a task', () => {
      before(() => {
        visitHelpers.visitTemplateTaskMap(template2.id)
        cy.get('[data-test=task-cell-test]').eq(0).click('left')
        openTemplateTaskCopy()
      })

      it('should display the copy task dialog', () => {
        cy.get('[data-test="dialog-header-title-text"]').should('be.visible')
      })

      describe('When choosing a destination project (16 level A)', () => {
        before(() => {
          cy.get('[data-test=new-task-name-text-field]')
            .find('input')
            .type('Target Copy Task')
          cy.get('[data-test=new-task-destination-type]').click()
          cy.get('[data-test=another-template]').click()
          cy.get(
            '[data-test=dialog-content] [data-test=auto-complete-search-term]'
          )
            .find('input')
            .type(template1.name)
          cy.get('[data-test=search-result-list-item]').first().click()
          cy.get('[data-test="destination-selection-dropdown"]').click()
          cy.get('[data-test=destination-level-a]').click()
        })

        it('should display the copy task dialog', () => {
          cy.get('[data-test=juralio-dialog]').should('be.visible')
        })

        it('should display 16 level A tasks validation message', () => {
          cy.get('[data-test=template-selection-validation-message]').should(
            'be.visible'
          )
          cy.get('[data-test=template-selection-validation-message]').should(
            'contains.text',
            'Templates cannot have more than 16 level A tasks.'
          )
        })

        describe('When performing the copy', () => {
          before(() => {
            cy.get(
              '[data-test=dialog-content] [data-test=auto-complete-search-term]'
            )
              .find('input')
              .clear()
              .type(template3.name)
            cy.get('[data-test=search-result-list-item]').first().click()
            cy.wait(2000)
            cy.get('[data-test="destination-selection-dropdown"]').click()
            cy.get('[data-test=destination-level-a]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should show the task map with the new task', () => {
            cy.url().should('include', template3.id)
            cy.get('[data-test=task-cell-test]').should('have.length', 2)
          })
        })
      })
    })
  })
})
