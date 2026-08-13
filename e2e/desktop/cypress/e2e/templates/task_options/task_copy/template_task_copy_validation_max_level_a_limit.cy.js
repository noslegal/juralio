import { getProjectWith16LevelATasks } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { openTemplateTaskCopy } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

describe('template_task_copy_validation_max_level_a_limit.cy', () => {
  let user, appPage, fixture, template

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TemplateTaskCopyInvalidDestinationTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [getProjectWith16LevelATasks()[0]],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When the Copy dialog is opened and a task with maximum subtasks selected', () => {
    before(() => {
      cy.login(user.username)
      createTemplate('TTCopyLevelAMax', fixture.projects[0].id).then(
        createdTemplate => {
          template = createdTemplate
          cy.visit(`/#/template/${template.id}/taskmap`)
          cy.get('[data-test=name]').eq(5).should('have.text', 'task6').click()
        }
      )
      openTemplateTaskCopy()
    })

    it('should have the "Another template" option selected by default', () => {
      cy.get('[data-test=new-task-destination-type]').should(
        'contain.text',
        'Another template'
      )
    })

    describe('when "Here" option is selected', () => {
      before(() => {
        cy.get('[data-test=new-task-destination-type]').click()
        cy.get('[data-test="thisTemplate"]').click()
      })

      it('should display an error message', () => {
        cy.get('[data-test=copy-task-error]').should(
          'have.text',
          'This task cannot be copied because there are already 16 level A tasks'
        )
      })

      it('the "Copy" button should be disabled', () => {
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
      })
    })
  })
})
