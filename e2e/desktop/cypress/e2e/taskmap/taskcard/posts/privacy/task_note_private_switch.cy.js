import {
    generateFixture,
    getWrapper
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../../helpers/notes/notes-helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskdetailPage from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_private_switch.cy', () => {
  let user, user2, fixture, appPage

  before(() => {
    createUser('FIRST').then(user => {
      user2 = user
    })
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardPrivateTest',
          teamMembers: [user, user2],
          matterAdmins: [user],
          projects: [
            {
              name: 'Private Task Note Spec',
              tasks: [{ name: 'Task With Note' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a Task with Note', () => {
    before(() => {
      cy.login(user.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a note.' }
      )
      appPage.visitTaskByName('Task With Note')
      taskdetailPage.get.taskNoteListItems().eq(0).click()
    })

    noteDetailsHelper.checkPrivacySwitchAndLabelisMatterTeamViewable()

    describe('when setting a Note to private', () => {
      before(() => {
        taskdetailPage.noteDetails.get.privacyControls.button().click()
        taskdetailPage.noteDetails.get.privacyControls.privateButton().click()
      })

      noteDetailsHelper.checkPrivacySwitchAndLabelisPrivateToUser()

      describe('when the page is refreshed', () => {
        before(() => {
          cy.login(user.username)
          cy.reload()
          taskdetailPage.get.taskNoteListItems().eq(0).click()
        })

        noteDetailsHelper.checkPrivacySwitchAndLabelisPrivateToUser()
      })
    })

    describe('when setting a Note to be viewable by the Matter Team', () => {
      before(() => {
        taskdetailPage.noteDetails.get.privacyControls.button().click()
        taskdetailPage.noteDetails.get.privacyControls.publicButton().click()
      })
      it('should show the confirmation dialog', () => {
        cy.get('[role=dialog]').should('be.visible')
        cy.get('[data-test=dialog-header-title-text]').should(
          'have.text',
          'Are you sure you want to make this post visible to all?'
        )
        cy.get('[data-test=dialog-prompt-text]').should(
          'have.text',
          'Anyone in this matter will be able to view this post when finalised'
        )
      })

      describe('when the page is refreshed', () => {
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()
          cy.login(user.username)
          cy.reload()
          taskdetailPage.get.taskNoteListItems().eq(0).click()
        })

        noteDetailsHelper.checkPrivacySwitchAndLabelisMatterTeamViewable()
      })
    })

    describe('when switching a note to private when current user is not an author', () => {
      before(() => {
        taskdetailPage.postAuthors.get.addAuthor().click()
        noteDetailsHelper.addAuthor('FIRST')

        cy.get('[data-test=avatar-group]').click()
        cy.get('[data-test=delete-icon]').first().click({force:true})
        cy.get('body').click()
        cy.wait(2000)
        taskdetailPage.noteDetails.get.privacyControls.button().click()
        taskdetailPage.noteDetails.get.privacyControls.privateButton().click()
      })

      noteDetailsHelper.checkAuthorCount(1)

      it('the new author should be auto-added as an author', () => {
        cy.get(`[data-test=user-avatar-${user.firstname}-${user.lastname}]`).should('exist')
      })
    })
  })
})
