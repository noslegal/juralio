import nameGenerator from 'project-name-generator'
import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import {
    createTemplate,
    publishTemplate
} from '../../../../helpers/templates/template_api_helper'
import {
    createKnowledgeManagerUser, createUser
} from '../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('template_read_only_view.cy', () => {
  let user, kmUser, fixture, newTemplate, clickedTask

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      createKnowledgeManagerUser()
        .then(createdUser => {
          kmUser = createdUser
          const seed = {
            matter: {
              prefix: 'template_read_only_view.cy',
              teamMembers: [kmUser],
              matterAdmins: [kmUser],
              projects: [
                {
                  tasks: [
                    {
                      tasks: [{ name: 'Martian Spiders' }, { tasks: [{}] }],
                    },
                  ],
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
  })

  describe('when a knowledge manager creates a new template and publishes it', () => {
    before(() => {
      cy.login(kmUser.username)
      createTemplate(newTemplateName, project.id)
        .then(createdTemplate => {
          newTemplate = createdTemplate
        })
        .then(() => {
          publishTemplate(newTemplate.id)
        })
    })

    describe('when navigating to the template overview as a REGULAR USER', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplateTaskMap(newTemplate.id)
      })

      it('should NOT show drop down menu for cells', () => {
        cy.get('[data-test=options-dropdown]').should('not.exist')
      })

      it('should NOT show template options menu', () => {
        cy.get('[data-test=template-options-button]').should('not.exist')
      })

      describe('When visiting the template map as a regular user', () => {
        before(() => {
          cy.get('[depth=1]')
            .eq(0)
            .should('have.length', 1)
            .click('center', { timeout: 500, force: true })
        })

        it('should NOT show template options menu', () => {
          cy.get('[data-test=template-options-button]').should('not.exist')
        })
      })
      describe('when using the template fab as a regular user', () => {
        before(() => {
          cy.get('[data-test=fab-button]').trigger('mouseover')
        })
        it('should not let them perform any action', () => {
          cy.get('[role=tooltip]').should(
            'have.text',
            'Only knowledge managers can edit templates'
          )
        })
      })
    })
  })
})
