import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_favourite_list_screen.cy', () => {
  let testUser,
    fixture,
    project,
    template,
    appPage,
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
                name: 'Overview Spec with Tasks',
                tasks: [{ name: 'Task1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        project = fixture.projects[0]
      })
  })

  describe('When navigating to the template overview page', () => {
    before(() => {
      cy.login(testUser.username)
      createTemplate(newTemplateName, project.id).then(createdTemplate => {
        template = createdTemplate
        appPage.visitTemplates()
      })
    })

    it('The new template reference number is shown', () => {
      cy.get(
        `[data-recordid=${template.id}] [data-test=not-favourited]`
      ).should('exist')
      cy.get('[data-test=favourites-zero-state]').should('exist')
      cy.get(`[data-recordid=${template.id}]`).should('have.length', 1)
    })

    describe('when favouriting a template', () => {
      before(() => {
        cy.get(
          `[data-recordid=${template.id}] [data-test=not-favourited]`
        ).click()
      })

      it('should favourite template', () => {
        cy.get(`[data-recordid=${template.id}]`).should('have.length', 1)
        cy.get('[data-test=favourited]').scrollIntoView().should('be.visible')
        cy.get('[data-test=favourites-zero-state]').should('not.exist')
      })

      describe('when unfavourite a template', () => {
        before(() => {
          cy.get(
            `[data-recordid=${template.id}] [data-test=favourited]`
          ).click()
        })
        it('should unfavourite template and show zero state', () => {
          cy.get(`[data-recordid=${template.id}]`).should('have.length', 1)
          cy.get('[data-test=favourited]').should('not.exist')
          cy.get('[data-test=favourites-zero-state]').should('exist')
        })
      })
    })
  })
})
