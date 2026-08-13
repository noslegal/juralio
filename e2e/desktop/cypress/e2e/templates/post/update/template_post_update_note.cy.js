import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import {
    checkPostDetails,
    updateAndCheckPostDetails
} from '../../../../../../helpers/notes/update-check-posts-helper'
import templatePostsHelper from '../../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'



describe('template_post_update_note.cy', () => {
  let user,
    fixture,
    template,
    appPage,
    visitHelpers,
    newTemplateName = 'Test Template For Posts'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_post_note',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'aaaa' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        visitHelpers = new VisitHelpers()
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            visitHelpers.visitTemplateTaskDetails(
              template.id,
              template.tasks[0].id
            )
          }
        )
      })
  })

  it('should show the zero state when no posts exist', () => {
    cy.get('[data-test="zero-state-image"]').should('be.visible')
  })

  describe('when a template task note is created', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=create-post-button]').click()
      cy.get('[data-test=blank-note]').click()
      templatePostsHelper.completeNoteNameDialog({ waitForCreate: true })
    })

    updateAndCheckPostDetails(user)

    describe('When the page is reloaded', () => {
      before(() => {
        cy.go('back')
        cy.login(user.username)
        cy.reload()
        taskdetail_page.get.taskNoteListItems().eq(0).click()
      })
      checkPostDetails()
    })
  })
})
