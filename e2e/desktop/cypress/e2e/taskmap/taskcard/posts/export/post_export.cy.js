import {
  generateFixture,
  getWrapper,
} from '../../../../../../../helpers/matterprojects/fixture_helper'
import notesHelper from '../../../../../../../helpers/notes/notes-helper'
import { addSelectionOfPosts } from '../../../../../../../helpers/notes/posts-helper'
import snackbarHelper from '../../../../../../../helpers/snackbar/snackbar-helper'
import { createUser } from '../../../../../../../helpers/users/user_api_helper'
import {
  default as taskDetailPage,
  default as taskdetail_page,
} from '../../../../../../../page/taskdetail/taskdetail_page'

describe('post_export.cy', () => {
  let user, authorA, authorB, fixture, appPage

  const NUMBER_OF_POSTS = 10

  before(() => {
    createUser('aaa')
      .then(u => {
        authorA = u
      })
      .then(() => createUser('bbb'))
      .then(u => {
        authorB = u
      })
      .then(createUser)
      .then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'taskCardTest',
            teamMembers: [user, authorA, authorB],
            matterAdmins: [user],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  {
                    name: 'Transfer Documents',
                    tasks: [
                      {
                        name: 'Acquire evidence',
                        properties: { status: 'not-started' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })

  describe('When opening a task', () => {
    const downloadPost = postIndex => {
      describe('When opening the post menu', () => {
        before(() => {
          taskDetailPage.get
            .taskNoteListItems()
            .eq(postIndex)
            .click({ force: true })
          taskDetailPage.noteDetails.get.noteContentMenu().click()
        })

        it('Should have a download option', () => {
          taskDetailPage.noteDetails.get
            .downloadWord()
            .should('contain.text', 'Download as .docx')
        })

        describe('When downloading the Post as a Word document', () => {
          before(() => {
            taskDetailPage.noteDetails.get.downloadWord().click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          snackbarHelper.checkShownAndHasExpectedText(
            'Preparing your download...'
          )
        })
      })
    }

    before(() => {
      cy.login(user.username)

      addSelectionOfPosts(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id
      )

      appPage.visitTaskByName('Transfer Documents')
    })

    describe('when clicking on a post', () => {
      before(() => {
        cy.get('[data-test=note-listitem-name]').eq(0).click()
        cy.wait(1000)
        cy.get('[data-test=post-people-people-manager]').click(20, 20, {
          force: true,
        }) // Authors tab
      })

      notesHelper.checkAuthorDetails()
      notesHelper.checkAuthorCount(1)

      describe('when adding authors to a post', () => {
        before(() => {
          taskdetail_page.postAuthors.get.addAuthor().click()
          notesHelper.addAuthor(authorA.username)
          taskdetail_page.postAuthors.get.addAuthor().click()
          notesHelper.addAuthor(authorB.username)
        })

        notesHelper.checkAuthorCount(3)
      })
    })

    describe('the task card should', () => {
      it('displays the task name', () => {
        cy.get('[data-test=task-name]').contains('Transfer Documents')
        taskDetailPage.get.taskNoteListItems().eq(0).click()
        taskDetailPage.noteDetails.get.finaliseButton().click()
      })

      it(`should display ${NUMBER_OF_POSTS} task note list items`, () => {
        taskDetailPage.get
          .taskNoteListItems()
          .should('have.length', NUMBER_OF_POSTS)
      })

      for (let i = 0; i < NUMBER_OF_POSTS; i++) {
        downloadPost(i)
      }
    })
  })
})
