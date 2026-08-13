import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_overview_zerostate_display.cy', () => {
  let user,
    fixture,
    appPage,
    template,
    newTemplateName = 'Test Template'

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_overview_zerostate.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate(newTemplateName, fixture.projects[0].id).then(
          createdTemplate => {
            template = createdTemplate
            appPage.visitTemplateOverview(template.id)
          }
        )
      })
  })

  it('should set the correct document title', () => {
    cy.title().should('eq', 'Overview | Test Template | Juralio')
  })

  it('should display the name of the project', () => {
    cy.get('[data-test=bread1]').should('have.text', template.name)
  })

  it('should NOT display a "Use template" button', () => {
    cy.get('[data-test=use-template-button]').should('not.exist')
  })
})
