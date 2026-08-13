import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import template_posts_helper from '../../../../../helpers/templates/posts/template_posts_helper'

describe('template_map_standard_compact_view.cy', () => {
  let user, fixture, appPage, newTemplate
  const visitHelpers = new VisitHelpers()
  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_filter_reset.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'MOON', isMilestone: true }, { name: 'STARS' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when using the standard/compact view toggle', () => {
    before(() => {
      const newTemplateName = nameGenerator.generate().spaced

      cy.login(user.username)

      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
      })
    })
    describe('when visiting the template', () => {
      before(() => {
        visitHelpers.visitTemplateTaskDetails(
          newTemplate.id,
          newTemplate.tasks[1].id
        )
        cy.get('[data-test=create-post-button]').click()
        cy.get('[data-test=blank-note]').click()
        template_posts_helper.completeNoteNameDialog()
        visitHelpers.visitTemplateTaskMap(newTemplate.id)
      })
      it('should not have the post counts on the tasks', () => {
        cy.get('[data-test=task-cell-post-count-wrapper]').should('not.exist')
      })
    })
    describe('when changing the toggle to standard', () => {
      before(() => {
        cy.get('[data-test="icicle-minimap-minimized"]').click()
        cy.get('[data-test=minimap-view-menu]').click()
        cy.get('[data-test=standard-view-filter]').click()
      })
      it('should show the task post counts', () => {
        cy.get('[data-test=task-cell-post-count-wrapper]').should('not.exist')
      })
    })
  })
})
