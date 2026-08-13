import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../page/project/overview/project_overview_page'

describe('template_overview_description.cy', () => {
  let testUser, fixture
  let appPage,
    template,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Project 1',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(testUser.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
          }
        )
      })
  })

  describe('When navigating to project', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTemplateOverview(template.id)
    })

    it('should display the name of the project', () => {
      cy.get('[data-test=bread1]').should('have.text', template.name)
    })

    describe('without a description', () => {
      it('should display the expected placeholder', () => {
        get
          .projectDescription()
          .placeholder()
          .contains('Click here to add a description')
      })
    })

    describe('and choosing to edit that description', () => {
      before(() => {
        cy.get('[data-test=project-description]').click()
        get.froalaProjectDescription().find('[contenteditable]').type('Updated template description')
        cy.wait(1000)
        cy.get('body').click()
      })

      it('should display the updated value', () => {
        cy.get('[data-test=project-description]').contains(
          'Updated template description'
        )
      })

      describe('when refreshing the page', () => {
        before(() => {
          cy.login(testUser.username)
          cy.reload()
          appPage.visitTemplateOverview(template.id)
        })

        it('should continue to show the update value', () => {
          cy.get('[data-test=project-description]').should(
            'have.text',
            'Updated template description'
          )
        })
      })

      describe('and choosing to remove that description', () => {
        before(() => {
          cy.get('[data-test=project-description]').click()
          get.froalaProjectDescription().find('[contenteditable]').clear()
          cy.wait(1000)
          cy.get('body').click()
          cy.login(testUser.username)
          cy.reload()
          appPage.visitTemplateOverview(template.id)
        })

        it('should re-display the placeholder', () => {
          get.projectDescription().placeholder().should('be.visible')
        })

        describe('when refreshing the page', () => {
          it('should continue to show the placeholder', () => {
            get.projectDescription().placeholder().should('be.visible')
          })
        })
      })
    })
  })
})
