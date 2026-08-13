import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createTaskFromFab } from '../../../../../../helpers/tasks/task_create_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'

describe('create_task_flow_matter_select.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreate',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Create From FAB Spec',
              tasks: [{ name: 'Task To have subtasks' }, { name: 'Here Goes' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when in a Matter context and Create Task FAB button is clicked', () => {
    before(() => {
      updateFTUE(user, { hasSeenMatterAdmin: true })
      cy.login(user.username)

      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=overview]').click()
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Next pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        cy.get('[data-test=action-dialog-button]').click()
      })

      it('should have the Matter selected in the dialog', () => {
        destinationPage.get
          .matterSelectorInput()
          .should(
            'have.value',
            fixture.matter.name + ' - ' + fixture.matter.matterId
          )
      })
    })
  })

  describe('When Task is created', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=overview]').click()
      createTaskFromFab('This is a new Task', true)

      destinationPage.get.parentTypeSelector().click()
      destinationPage.get.parentTypeLevelA().click()
      cy.get('[data-test=action-dialog-button]').click()
    })

    it('continue to display the matter details', () => {
      cy.get('[data-test=overview]').should('contain.text', 'Summary')
    })
  })
})
