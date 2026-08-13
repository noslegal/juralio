import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_deliverable_display.cy', () => {
  let user, appPage, fixture, templateId
  let templateName = 'New-Template=' + Math.random()
  const visitHelpers = new VisitHelpers()
  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TaskMoveTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [
                { name: 'non-deliverable' },
                {
                  name: 'deliverable',
                  properties: {
                    isDeliverable: true,
                  },
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
  describe('when viewing a template made from a workstream with a deliverable', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(templateName, fixture.projects[0].id).then(template => {
        templateId = template.id
        visitHelpers.visitTemplateTaskMap(templateId)
      })
    })
    it('should show two tasks', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 2)
    })
    it('should show one milestone', () => {
      cy.get('[data-test=deliverable-icon]').should('have.length', 1)
    })
  })
})
