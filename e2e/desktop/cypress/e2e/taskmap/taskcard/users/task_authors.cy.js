import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import noteDetailsHelper from '../../../../../../helpers/notes/notes-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_authors.cy', () => {
  let user, user2, fixture, appPage

  before(() => {
    createUser('aa').then(createdUser => {
      user2 = createdUser
    })

    createUser('zz').then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [user, user2],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Authors Spec',
              tasks: [{ name: 'Task With Posts' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when creating and opening a post', () => {
    before(() => {
      cy.login(user.username)

      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'This is a post' }
      )
      appPage.visitTaskByName('Task With Posts')
      taskdetail_page.get.taskNoteListItems().first().click()
      taskdetail_page.noteDetails.get.name()
      cy.get('[data-test=post-people-people-manager]').click({ force: true }) // Authors tab
    })

    noteDetailsHelper.checkAuthorDetails()
    noteDetailsHelper.checkAuthorCount(1)

    it('should display the creator as the first post author', () => {
      cy.get('[data-test=avatar-group]').click()
      cy.get(`[data-test=${user.firstname}-${user.lastname}]`)
    })
  })

  describe('when another post author is added', () => {
    before(() => {
      cy.login(user.username)

      appPage.visitTaskByName('Task With Posts')
      taskdetail_page.get.taskNoteListItems().first().click()
      cy.get('[data-test=post-people-people-manager]').click({ force: true }) // Authors tab
      taskdetail_page.postAuthors.get.addAuthor().click()
      noteDetailsHelper.addAuthor('a')
    })

    noteDetailsHelper.checkAuthorCount(2)

    it('should display the new author as the second author', () => {
      cy.get('[data-test=avatar-group]').click()
      cy.get(`[data-test=${user2.firstname}-${user2.lastname}]`)
    })

    describe('when the page is refreshed', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()
        taskdetail_page.get.taskNoteListItems().first().click()
        cy.get('[data-test=post-people-people-manager]').click({ force: true }) // Authors tab
      })

      noteDetailsHelper.checkAuthorCount(2)
    })
  })

  describe('when an author is removed from the author list', () => {
    before(() => {
      cy.get('body').click()
      cy.get('[data-test=avatar-group]').click()
      cy.get('[data-test=delete-icon]').first().click()
    })

    noteDetailsHelper.checkAuthorCount(1)

    it('should no longer display the deleted user', () => {
      cy.get('body').click()
      cy.get('[data-test=avatar-group]').click()
      cy.get('[data-test=user-list-item]').contains('You')
    })

    it('should not show the delete icon for the last user', () => {
      cy.get('[data-test=delete-icon]').should('not.exist')
    })

    describe('when the page is refreshed', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()
        taskdetail_page.get.taskNoteListItems().first().click()
        cy.get('[data-test=post-people-people-manager]').click({ force: true }) // Authors tab
      })

      noteDetailsHelper.checkAuthorCount(1)

      it('should not show the deleted user', () => {
        cy.get('body').click()
        cy.get('[data-test=avatar-group]').click()
        cy.get('[data-test=user-list-item]').contains('You')
      })

      it('should not show the delete icon for the last user', () => {
        cy.get('[data-test=delete-icon]').should('not.exist')
      })
    })
  })

  // describe('when a post author is made inactive by account being disabled', () => {
  //   before(() => {
  //     cy.login(user.username)

  //     appPage.visitTaskByName('Task With Posts')
  //     cy.backendRoute('/matter/*/workstreams/*/task/*/post/*').as('getPostDetails')
  //     taskdetail_page.get.taskNoteListItems().first().click()
  //     cy.wait('@getPostDetails')
  //     cy.get('[data-test=post-people-people-manager]').click({ force: true }) // Authors tab

  //     cy.get('[data-test=team-search] input')
  //       .eq(0)
  //       .scrollIntoView({
  //         behavior: 'auto',
  //         block: 'center',
  //         inline: 'center',
  //       })
  //       .click('left')
  //       .type('a')

  //     cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/post/*/authors').as(
  //       'postAuthor'
  //     )
  //     cy.get('[data-test=search-result-list-item]').first().click()
  //     cy.wait('@postAuthor')
  //     cy.wait(2000)
  //     appPage.visitOrgUsers()
  //     cy.wait(5000)
  //     changeUserActiveStatus(user2, 'off')
  //     appPage.visitTaskByName('Task With Posts')
  //     taskdetail_page.get.taskNoteListItems().first().click()
  //     cy.get('[data-test=post-people-people-manager]').click({ force: true }) // Authors tab
  //   })

  //   it('the inactive author should be shown and placed as last author', () => {
  //     cy.get('[data-test=user-list-item]').last().should('contain', 'Inactive')
  //   })
  // })

  // describe('when a post author is made inactive by being removed as a MTM', () => {
  //   before(() => {
  //     cy.login(user.username)
  //     appPage.visitOrgUsers()
  //     cy.wait(5000)

  //     changeUserActiveStatus(user2, 'on')
  //     appPage.visitMatter()
  //     cy.get('[data-test=matter-people]').click()
  //     cy.wait(5000)
  //     getUserRowByUsername(user2.username)
  //     cy.get('[data-test=delete-button]').first().click()
  //     appPage.visitTaskByName('Task With Posts')
  //     taskdetail_page.get.taskNoteListItems().first().click()
  //     taskdetail_page.noteDetails.get.name()
  //     cy.get('[data-test=post-people-people-manager]').click()
  //   })

  //   it('the inactive author should be shown and placed as last author', () => {
  //     cy.get('[data-test=user-list-item]')
  //       .last()
  //       .should('contain', 'Not in this matter')
  //   })
  // })
})
