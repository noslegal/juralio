import { checkLinkUrl } from '../../../../../../helpers/links/task_content_links_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import {
  checkPostDetails,
  updateAndCheckPostDetails,
} from '../../../../../../helpers/notes/update-check-posts-helper'
import templatePostsHelper from '../../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

const urlField = taskdetail_page.noteDetails.get.url

describe('template_post_update_link.cy', () => {
  let user,
    fixture,
    template,
    appPage,
    visitHelpers,
    newTemplateName = 'Test Template For Links'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_post_link',
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
      cy.get('[data-test=web-link]').click()
      templatePostsHelper.completeLinkNameDialog({ waitForCreate: true })
    })
    updateAndCheckPostDetails(user)

    describe('When the link url is edited (without entering protocol)', () => {
      before(() => {
        cy.go('back')
        urlField.link().click()
        urlField.editButton().click()
        cy.wait(1000)
        urlField
          .editTextField()
          .find('input')
          .type('{selectall}')
          .type('https://www.duckduckgo.com/')
          .type('{enter}')
      })

      checkLinkUrl('https://www.duckduckgo.com/')
    })

    describe('When the page is reloaded', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()
        taskdetail_page.get.taskNoteListItems().eq(0).click({ force: true })
      })
      checkPostDetails()

      checkLinkUrl('https://www.duckduckgo.com/')
    })
  })
})
