import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('global_search_display.cy', () => {
  let user, fixture, appPage
  const PROJECT_NAME = 'Project Apple'
  const visitHelpers = new VisitHelpers()
  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser
        const seed = {
          matter: {
            prefix: 'globalSearchTest',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: PROJECT_NAME,
                tasks: [
                  {
                    properties: {
                      name: 'task1',
                    },
                  },
                  {
                    properties: {
                      name: 'task2',
                    },
                  },
                  {
                    properties: {
                      name: 'task3',
                    },
                  },
                ],
              },
              {},
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate('newTemplateName', fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            appPage.visitTemplateTaskMap(template.id)
          }
        )
      })
      .then(() => {
        publishTemplate(template.id)
      })
  })

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      cy.visit('/#/home')
    })

    describe('Check the search placeholder is correct for matters', () => {
      before(() => {})

      it('placeholder text should be correct', () => {
        cy.get('[data-test=search-icon]').click()
        cy.get('[data-test=global-searchbar]')
          .find('input')
          .should('have.attr', 'placeholder', 'Search')
      })
    })
  })

  describe('when navigating to the template task map', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskMap(template.id)
    })

    describe('Check the search placeholder is correct for matters', () => {
      before(() => {})

      it('placeholder text should be correct', () => {
        cy.get('[data-test=search-icon]').click()
        cy.get('[data-test=global-searchbar]')
          .find('input')
          .should('have.attr', 'placeholder', 'Search this template')
      })
    })
  })

  describe('when navigating to the task map', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/taskmap`
      )
    })

    describe('Check the search placeholder is correct for project', () => {
      before(() => {})

      it('placeholder text should be correct', () => {
        cy.get('body').trigger('keydown', { keyCode: 27 })
        cy.wait(500)
        cy.get('body').trigger('keyup', { keyCode: 27 })
        cy.get('[data-test=search-icon]').click()
        cy.get('[data-test=global-searchbar]')
          .find('input')
          .should('have.attr', 'placeholder', `Search this matter`)
      })
    })

    describe('And a search is performed in the global search box', () => {
      before(() => {
        cy.get('[data-test=global-searchbar]').find('input').type('task')
      })

      it('should render the search results container', () => {
        cy.get('[data-test=search-results-list]').should('be.visible')
      })
      it('should populate 3 results', () => {
        cy.get('[data-test=search-result-item]').should('have.length', 3)
      })

      describe('a search result should display', () => {
        it('should render a level', () => {
          cy.get('[data-test=search-result-item]').eq(0).should('be.visible')
        })

        it('should render a name', () => {
          cy.get('[data-test=search-result-title]').eq(0).should('be.visible')
        })
      })
    })
  })
})
