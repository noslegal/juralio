import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTemplateFromProject } from '../../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/templatetaskdestinationdialog/templatetaskdestinationdialog_page'


describe('create_template_task_flow_template_select.cy', () => {
  let user, fixture, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'templateselect',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'SelectTemplate Temp Task Spec',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When in the context of a template', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplates()
      createTemplateFromProject(
        'template task nav create',
        'templateselect',
        'SelectTemplate Temp Task Spec'
      )
    })

    describe('When a subtask is being created', () => {
      before(() => {
        destinationHelper.openTemplateTaskCreateFlowFromFab()
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('Conquer Pluto')
        cy.get('[data-test=action-dialog-button]').click()
      })
      it('should be visible', () => {
        destinationPage.get.templateSelector().should('be.visible')
      })
      it('should automatically select the current template', () => {
        destinationPage.get
          .templateSelectorInput()
          .invoke('val')
          .should('contain', 'template task nav create')
      })
    })
  })
})
