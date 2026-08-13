import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

describe('add_post_header_button.cy', () => {
  let user, viewer, fixture, appPage

  before(() => {
    createUser().then(createUser => {
      viewer = createUser
    })
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'CreateTaskNoteHeaderBtn',
          teamMembers: [user],
          matterAdmins: [user],
          matterViewer: [viewer],
          projects: [
            {
              name: 'PostListCreateButtonHeader',
              tasks: [{ name: 'New Post Button Task' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When a matter editor visits a task with posts', () => {
    before(() => {
      cy.login(user)
      addNoteToTask(
        appPage.fixture.matter.id,
        appPage.fixture.projects[0].id,
        appPage.fixture.tasks[0].id,
        { name: 'Note 1' }
      )
      appPage.visitTaskByName('New Post Button Task')
    })

    it('there should be a create button at the top of the post list', () => {
      cy.get('[data-test=create-post-button-post-title]').should('be.visible')
    })

    describe('when clicking the button', () => {
      before(() => {
        cy.get('[data-test=create-post-button-post-title]').click()
      })
      it('there should be 4 options', () => {
        cy.get('[data-test=blank-note]').should('exist')

        cy.get('[data-test=meeting-note]').should('exist')

        cy.get('[data-test=document-link]').should('exist')
        cy.get('[data-test=web-link]').should('exist')
      })

      describe('When user opens the note', () => {
        before(() => {
          cy.get('body').click()
          cy.get('[data-test=note-list-item]').eq(0).click()
        })

        it('the create button should also be at the top of the post list', () => {
          cy.get('[data-test=create-post-button-post-title]').should(
            'be.visible'
          )
        })
      })
    })
  })
  describe('When a matter viewr visits a task with posts', () => {
    before(() => {
      cy.login(viewer)
      appPage.visitTaskByName('New Post Button Task')
    })

    it('there should NOT be a create button at the top of the post list', () => {
      cy.get('[data-test=create-post-button-post-title]').should('not.exist')
    })
  })
})
