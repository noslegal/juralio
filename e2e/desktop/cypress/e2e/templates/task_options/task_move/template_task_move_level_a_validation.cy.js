import { getProjectWith16LevelATasks } from '../../../../../../helpers/data/task_operations_test_project_data'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { openTemplateTaskMove } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('template_task_move_level_a_validation.cy', () => {
  let user, appPage, fixture
  const { moveDialog } = taskDetailPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TemplateTaskMoveLevelAValidation',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [getProjectWith16LevelATasks('Parrot')[0]],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('When the template task details are loaded', () => {
    let templateId

    before(() => {
      cy.login(user.username)
      createTemplate('New Template', fixture.projects[0].id).then(template => {
        templateId = template.id
        appPage.visitTemplateTaskMap(templateId)
        cy.get('[data-test=task-cell-test]').eq(16).click({ force: true })
      })
    })
    describe('When the Move dialog is opened and level A selected', () => {
      before(() => {
        openTemplateTaskMove()
        moveDialog.get.destinationSelectionDropdown().click()
      })

      it('the level A option should not be shown', () => {
        moveDialog.get.destinationOption.levelA().should('not.exist')
      })
    })
  })
})
