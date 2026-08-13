import destinationHelper from '../../../../../../helpers/destinationdialog/destination-dialog-helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import destinationPage from '../../../../../../page/destinationdialog/destinationdialog_page'

describe('create_task_on_empty_project_ooc.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'testmattertaskcreatelaas',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Create Auto LevelA Select',
              tasks: [],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when at home screen and Create Task FAB button is clicked', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')
      destinationHelper.openTaskCreateFlowFromFab()
    })

    describe('When a name is entered and Next pressed', () => {
      before(() => {
        cy.get('[data-test=text-prompt-text-field]')
          .find('input')
          .type('This is a new Task')
        cy.get('[data-test=action-dialog-button]').click()

        destinationPage.get.matterSelectorItem().click()
      })

      it('Has the level A option selected', () => {
        destinationPage.get
          .parentTypeSelector()
          .should('contain.text', 'As a new phase')
      })
    })
  })
})
