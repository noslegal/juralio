import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../helpers/matterprojects/task_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../page/taskdetail/taskdetail_page'

describe('post_archive_restore.cy', () => {
  let user, fixture, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'POST',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'pro1',
              tasks: [{ name: 'T1' }],
            },
            {
              name: 'pro2',
              tasks: [{ name: 'T2' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  const notesToArchive = 2

  describe('When user clicks on Archive the task note option menu', () => {
    before(() => {
      cy.login(user.username)

      for (let i = 0; i < notesToArchive; i++) {
        addNoteToTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          {
            name: `This is a note ${i}.`,
          }
        )
        cy.wait(500)
      }
      appPage.visitTaskByName('T1')
    })

    it('should show the task card content', () => {
      taskdetail_page.get.taskCardContent().should('be.visible')
    })

    describe('When user clicks on Archive the task note option menu', () => {
      before(() => {
        for (let i = 0; i < notesToArchive; i++) {
          cy.login(user.username)
          appPage.visitTaskByName('T1')
          taskdetail_page.get
            .taskNoteListItems()
            .eq(0)
            .click({ timeout: 30000 })
          taskdetail_page.noteDetails.get
            .noteContentMenu()
            .click({ timeout: 30000 })
          cy.get('[data-test=task-post-archive]').click()
          cy.backendRoute('PATCH', '/matter/*/workstreams/*/task/*/post/*').as(
            'archivePost'
          )
          cy.get('[data-test=action-dialog-button]').click()
          cy.wait('@archivePost')
          cy.get('[data-test=action-dialog-button]').should('not.exist')
        }
        cy.wait(1000)
        cy.reload()
        cy.login(user.username)
      })

      it('The posts no longer appear in the task post list', () => {
        cy.get('[data-test=note-list-item]').should('not.exist')
      })

      describe('When user visits the archived posts table', () => {
        before(() => {
          cy.login(user.username)
          appPage.visitMatter()
          cy.get('[data-test=archive]').click()
          cy.get('[data-test=posts-tab]').click()
        })

        it('The post appears in the archive table', () => {
          cy.get('[data-test=name-text]').should('have.length', notesToArchive)
        })

        describe('When user restores a post to previous location', () => {
          before(() => {
            cy.get('[data-test=restore-post]').first().click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it(
            'The post no longer appear in the archive table',
            { retries: { runMode: 2, openMode: 1 } },
            () => {
              cy.get('[data-test=name-text]').should('have.length', 1)
            }
          )
        })

        describe('When user restores a post to new location', () => {
          before(() => {
            cy.get('[data-test=restore-post]').first().click()
            cy.get('[data-test=new-location]').click()
            cy.get('[data-test=auto-complete-search-term]')
              .eq(0)
              .click()
              .find('input')
              .type('pro1')
            cy.get('[data-test=search-result-list-item]').eq(0).click()
            cy.get('[data-test=auto-complete-search-term]')
              .eq(1)
              .click()
              .find('input')
              .type('T1')
            cy.get('[data-test=search-result-list-item]').eq(0).click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it(
            'The post no longer appear in the archive table',
            { retries: { runMode: 2, openMode: 1 } },
            () => {
              cy.get('[data-test=name-text]').should('have.length', 0)
            }
          )
        })
      })
    })
  })
})
