import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate, createTemplateTaskPost } from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('template_post_list_details.cy', () => {
  let user, fixture, appPage, template
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser('', true, true, {}, true).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Task Note Spec',
              tasks: [{ name: 'Task 1' }, { name: 'Task 2' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('setup', () => {
    before(() => {
      cy.login(user.username)
      createTemplate('test again', fixture.projects[0].id).then(
        createdTemplate => {
          template = createdTemplate
          createTemplateTaskPost(template.id, template.tasks[0].id, 'new post')
          createTemplateTaskPost(template.id, template.tasks[0].id, 'post to finalise')
          visitHelpers.visitTemplateTaskDetails(
              template.id,
              template.tasks[0].id
            )
          cy.get('[data-test="note-list-item"]').eq(0).click()
          cy.get('[data-test="finalise-button"]').eq(0).click()
        }
      )
    })
    it("Text should be 'Finalised on:'", () => {cy.get('[data-test="note-listitem-creator"]').eq(0).should('have.text', 'Finalised on:')})
    it("Text should be 'Last edited:'", () => {cy.get('[data-test="note-listitem-creator"]').eq(1).should('have.text', 'Last edited:')})
  })
})