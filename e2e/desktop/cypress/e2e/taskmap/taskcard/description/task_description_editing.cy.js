import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import {
  getDescriptionField,
  getZeroStatePlaceholder,
} from '../../../../../../helpers/tasks/task-description-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('task_description_editing.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskDescriptionTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Name Editing Spec',
              tasks: [
                {
                  name: 'Initial Task Name',
                  properties: {
                    description: 'Initial task description',
                  },
                },
                { name: 'Second task' },
                { name: 'Third task' },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a task with a description', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Initial Task Name')
    })

    it('the correct description should be displayed', () => {
      getDescriptionField().should('contain', 'Initial task description')
    })

    describe('when editing the description and then pressing ESC', () => {
      before(() => {
        cy.get('[data-test=raw-text-line0]').click()
      })

      it('should toggle the description into the edit state', () => {
        getDescriptionField().should('contain', 'Initial task description')
      })

      describe('edit the value and press ESC', () => {
        before(() => {
          getDescriptionField().find('[contenteditable]').type('random').type('{ESC}')
        })

        it('it should not persist the change and toggle back to read state', () => {
          getDescriptionField().should('contain', 'Initial task description')
        })
      })
    })

    // describe('when trying to edit the description with new lines and press SHIFT + ENTER', () => {
    //   before(() => {
    //     cy.get('[data-test=raw-text-line0]').click()
    //   })

    //   it('should toggle the description into the edit state', () => {
    //     getDescriptionField().should('have.value', 'Initial task description')
    //   })

    //   describe('edit the value and press SHIFT + ENTER', () => {
    //     before(() => {
    //       cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*').as(
    //         'taskPatch'
    //       )
    //       getDescriptionField()
    //         .type('{END}')
    //         .type('{ENTER}')
    //         .type('more text')
    //         .type('{SHIFT}{ENTER}')

    //       cy.wait('@taskPatch')
    //     })

    //     it('it should persist the change and toggle back to read state', () => {
    //       getDescriptionField(0).should('contain', 'Initial task description')
    //       getDescriptionField(1).should('contain', 'more text')
    //     })

    //     describe('when refreshing the page', () => {
    //       before(() => {
    //         cy.login(user.username)
    //         appPage.visitTaskByName('Initial Task Name')
    //       })

    //       it('the update was persisted to the database', () => {
    //         getDescriptionField(0).should('contain', 'Initial task description')
    //         getDescriptionField(1).should('contain', 'more text')
    //       })
    //     })
    //   })
    // })
  })

  describe('when opening a task WITHOUT a description', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Second task')
    })

    it('the zero state placeholder should be displayed', () => {
      getZeroStatePlaceholder().should('contain', 'Click to add a description')
    })
  })
})
