import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { enterNoteName } from '../../../../../helpers/notes/notes_create_helper'
import templatePostsHelper from '../../../../../helpers/templates/posts/template_posts_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_finalised_notes_copy_over', () => {
  const visitHelpers = new VisitHelpers()
  let user, fixture, newTemplate

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'project ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'aaaa' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('When using a template with a draft note and a finalised note for a new workstream', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id)
        .then(template => {
          newTemplate = template
        })
        .then(() => {
          publishTemplate(newTemplate.id)
          visitHelpers.visitTemplateTaskDetails(
            newTemplate.id,
            newTemplate.tasks[0].id
          )
          enterNoteName('finalised note')
          templatePostsHelper.finaliseNote()
          enterNoteName('draft note')
        })
        .then(() => {
          cy.get('[data-test=overview-button]').click()
          cy.get('[data-test=use-template-button]').click()
          cy.get('[data-test=use-full-template-radio]').click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.get('[data-test=new-matter-button]').click()
          cy.get('[data-test=action-dialog-button]').click()
          cy.get('[data-test=client-name]').type('c')
          cy.get('[data-test=name]').type('m')
          cy.get('[data-test=reference-number]').type('1234')
          templateSourceDialogPage.get.createButton().click()
          cy.wait(5000)
        })
    })

    it('should have 1 post', () => {
      cy.get('[data-test=post-count]').should('contain', '1')
    })
  })
})
