import { getNewProject } from '../../../../../../../helpers/matterprojects/fixture_data_builder_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper'
import {
  default as noteDetailsHelper,
  default as notesHelper,
} from '../../../../../../../helpers/notes/notes-helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../../page/taskdetail/taskdetail_page'

describe('task_note_private_access.cy', () => {
  let appPage, fixture
  let user, juniorUser, juniorUser2

  before(() => {
    createUser('ax').then(user => {
      juniorUser2 = user
    })
    createUser().then(firstUser => {
      juniorUser = firstUser
    })
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskNotePrivateAccessSpec',
          teamMembers: [user, juniorUser, juniorUser2],
          matterAdmins: [user],
          projects: getNewProject(['Sensitive Task']).parent,
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when adding a private note to a Task', () => {
    before(() => {
      cy.login(user.username)
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a sensitive note.' }
      )
      appPage.visitTaskByName('Sensitive Task')
      taskdetail_page.get
        .taskNoteListItems()
        .should('have.length.gte', 1)
        .eq(0)
        .click({ force: true })
      taskdetail_page.noteDetails.get.privacyControls.button().click()
      taskdetail_page.noteDetails.get.privacyControls.privateButton().click()
    })

    noteDetailsHelper.checkPrivacySwitchAndLabelisPrivateToUser()

    describe('when another user opens a Task with private Notes and adds a Note', () => {
      before(() => {
        cy.login(juniorUser.username)
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          { name: 'This is a junior note.' }
        )
        appPage.visitTaskByName('Sensitive Task')
        taskdetail_page.get
          .taskNoteListItems()
          .should('have.length.gte', 1)
          .eq(0)
          .click({ force: true })
      })

      noteDetailsHelper.checkPrivacySwitchAndLabelisMatterTeamViewable()

      it('the junior user can only see one note', () => {
        taskdetail_page.get.taskNoteListItems().should('have.length', 1)
      })

      it('the junior user can only see their note', () => {
        taskdetail_page.get
          .taskNoteListItems()
          .eq(0)
          .contains('This is a junior note.')
      })
    })

    describe('when adding a second author to the note', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Sensitive Task')
        taskdetail_page.get
          .taskNoteListItems()
          .should('have.length.gte', 1)
          .eq(0)
          .click({ force: true })

        taskdetail_page.postAuthors.get.addAuthor().click()
        notesHelper.addAuthor('ax')
      })

      it('the new author should be added', () => {
        cy.get('[data-test="users-control"]').click()
        cy.get('[data-test=user-list-item]').should('have.length', 2)
      })

      it('display the correct caption', () => {
        cy.get('[data-test=post-visible-to]').should(
          'contain.text',
          'This post can only be seen by its editors'
        )
      })

      describe('when trying to access the private note from the second user', () => {
        before(() => {
          cy.login(juniorUser2.username)
          appPage.visitTaskByName('Sensitive Task')
          taskdetail_page.get
            .taskNoteListItems()
            .should('have.length.gte', 1)
            .eq(0)
            .click({ force: true })
          taskdetail_page.noteDetails.get.name()
          cy.get('[data-test=post-people-people-manager]').click() // Authors tab
        })

        it('should show the private notes content', () => {
          cy.get('[data-test=note-details-name]').contains(
            'This is a sensitive note.'
          )
        })

        it('both authors should be shown in list', () => {
          // "See all team" now lives in the hover card (UserHover), which only
          // renders on hover. Clicking an avatar toggles the same people list
          // (UsersControl onClick -> setShowList), so click it directly.
          cy.get('[data-test="visible-user-avatar"]')
            .first()
            .click({ force: true })
          cy.get('[data-test=user-list-item]').should('have.length', 2)
        })

        it('display the correct privacy caption', () => {
          cy.get('[data-test=post-visible-to]').should(
            'contain.text',
            'This post can only be seen by its editors'
          )
        })
      })
    })
  })
})
