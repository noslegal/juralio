import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../page/project/overview/project_overview_page'

describe('template_favourite.cy', () => {
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

    describe('when favourite a template', () => {
      before(() => {
        appPage.visitTemplates()
        get.menu.favouriteButton().eq(0).click()
        cy.reload()
        cy.login(testUser.username)
      })

      it('should favourite template', () => {
        cy.get('[data-test=favourited]').should('be.visible')
      })
    })

    describe('when unfavourite a template', () => {
      before(() => {
        get.menu.favouriteButton().eq(0).click()
      })

      it('should favourite template', () => {
        cy.get('[data-test=not-favourited]').should('be.visible')
        cy.get('[data-test=favourited]').should('not.exist')
      })
    })
  })
})
