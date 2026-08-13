import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('global_sub_header_display.cy', () => {
  let fixture, user
  let templateId, templateName

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'navigation_buttons.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [{ name: 'Test Task' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('when visiting pages without a sub header', () => {
    before(() => {
      createTemplate('Test Template', fixture.projects[0].id).then(template => {
        templateId = template.id
        templateName = template.name
      })
    })

    describe('when a user navigates to home', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitHome()
      })

      it('should not render a sub header', () => {
        cy.get('[data-test=global-sub-header]').should('not.exist')
      })
    })
  })

  describe('when visiting pages with sub headers', () => {
    let projectId, matterId, taskId, projectName

    before(() => {
      projectId = fixture.projects[0].id
      matterId = fixture.matter.id
      taskId = fixture.tasks[0].id
      projectName = fixture.projects[0].name
    })

    describe('when visiting pages at project level', () => {
      describe('when a user navigates to task map', () => {
        before(() => {
          cy.login(user.username)
          visitHelpers.visitTaskMap(matterId, projectId)
        })

        it('should render an global sub header', () => {
          cy.get('[data-test=global-sub-header]').should('be.visible')
        })

        it('should display the navigation options', () => {
          cy.get('[data-test=overview-button]').should('exist')
          cy.get('[data-test=taskmap-navigation]').should('exist')
        })
      })
    })
    describe('when visiting pages at template level', () => {
      describe('when a user navigates to task map', () => {
        before(() => {
          cy.login(user.username)
          visitHelpers.visitTemplateTaskMap(templateId)
        })

        it('should render an global sub header', () => {
          cy.get('[data-test=global-sub-header]').should('be.visible')
        })

        it('should display the navigation options', () => {
          cy.get('[data-test=overview-button]').should('exist')
          cy.get('[data-test=taskmap-navigation]').should('exist')
        })
      })
    })
  })
})
