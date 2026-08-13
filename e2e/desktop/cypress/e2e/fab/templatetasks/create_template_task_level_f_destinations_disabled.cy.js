import { getProjectWithMultiFLevelData } from '../../../../../helpers/data/task_operations_test_project_data'
import destinationHelper from '../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../page/templatetaskdestinationdialog/templatetaskdestinationdialog_page'


describe('create_template_task_level_f_destinations_disabled.cy', () => {
  let user, fixture, appPage, seed

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      seed = {
        matter: {
          prefix: 'testtemplatetaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: getProjectWithMultiFLevelData(),
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in creating a template task and selecting the destination', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()
      createTemplateFromProject(
        'newTemplate',
        'testtemplatetaskcreate',
        fixture.projects[0].name
      )

      destinationHelper.openTemplateTaskCreateFlowFromFab()

      cy.focused().type('Test')
      cy.get('[data-test=action-dialog-button]').click()

      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeSubTaskOf().click({force:true})

      destinationPage.get.taskSelector().find('Input').type('f')
    })

    it('Level F Tasks in the list should be disabled - subtask11 ', () => {
      cy.get('[data-test=task-search-item]')
        .eq(0)
        .parent()
        .should('have.attr', 'tabindex', '-1')
    })

    it('Level F Tasks in the list should be disabled - subtask16 ', () => {
      cy.get('[data-test=task-search-item]')
        .eq(1)
        .parent()
        .should('have.attr', 'tabindex', '-1')
    })
  })
})
