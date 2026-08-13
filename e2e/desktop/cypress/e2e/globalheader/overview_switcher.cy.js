import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('overview_switcher.cy', () => {
  let fixture, user

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
            {
              name: 'Test Project2',
              tasks: [{ name: 'Test Task' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('when using the switcher to quickly move between workstreams', () => {
    let templateId

    before(() => {
      createTemplate('Test Template', fixture.projects[0].id).then(template => {
        templateId = template.id
      })
    })

    describe('when visiting pages at project level', () => {
      let taskMapUrl

      before(() => {
        projectId = fixture.projects[0].id
        matterId = fixture.matter.id
        taskMapUrl = `/#/matter/${matterId}/workstream/${projectId}/taskmap`
      })

      describe('when a user uses switcher to navigate between two taskmaps', () => {
        before(() => {
          cy.login(user.username)
          cy.visit(taskMapUrl)
        })

        it('should render a overview button', () => {
          cy.get('[data-test=overview-button]').should('be.visible')
          cy.get('[data-test="overview-button"]').click()
        })

        it('should render the name of workstream 1', () => {
          cy.get('[data-test=bread1]').should(
            'contain',
            fixture.projects[0].name
          )
        })

        it('should load the switcher with correct contents', () => {
          cy.get('[data-test="workstream-switcher-button"]')
            .children()
            .should('have.length', 2)
          cy.get('[data-test="workstream-switcher-button"]').click('right')
          cy.wait(2000)
          cy.get('[data-test="workstream-button"]')
            .eq(0)
            .children()
            .should('contain', fixture.projects[0].name)
          cy.get('[data-test="workstream-button"]')
            .eq(1)
            .children()
            .should('contain', fixture.projects[1].name)
        })

        it('should render the second workstream on switch', () => {
          cy.get('[data-test="workstream-button"]').eq(1).click()
          cy.get('[data-test=bread1]').should(
            'contain',
            fixture.projects[1].name
          )
        })

        it('should use the switcher to return to the matter overview ', () => {
          cy.get('[data-test="workstream-switcher-button"]').click()
          cy.get('[data-test=bread1]').should(
            'not.contain',
            fixture.projects[1].name
          )
          cy.get('[data-test=bread1]').should('contain', fixture.matter.name)
        })
      })
    })
  })
})
