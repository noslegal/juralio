import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { enterNoteName } from '../../../../../helpers/notes/notes_create_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'


describe('template_post_note_with_meeting_type', () => {
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
            prefix: 'template_map.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'aaaa' }, { name: 'bbbb' }],
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

  describe('When trying to create a note', () => {
    before(() => {
      enterNoteName('a new  note', true)
    })

    it('user should not see note type change option', () => {
      cy.get('[data-test=note-type-selector] input').should('not.be', 'visible')
    })
  })
  describe('when editing a note', () => {
    before(() => {
      cy.get('[data-test=action-dialog-button]').click()
      cy.get('[data-test=task-content-header-menu-button]').click()
    })
    it('user should not see the change note type option', () => {
      cy.get('[data-test=task-note-convert]').should('not.exist')
    })
  })
})
