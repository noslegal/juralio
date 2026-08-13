import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  createUser,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('template_overview_edit_name_in_place.cy', () => {
  let user,
    fixture,
    appPage,
    template,
    user_2,
    newTemplateName = 'Test Template'

  before(() => {
    createUser().then(u => {
      user_2 = u
      createKnowledgeManagerUser()
        .then(createdUser => {
          user = createdUser

          const seed = {
            matter: {
              prefix: 'template_overview_copy.cy',
              teamMembers: [user],
              matterAdmins: [user],
              projects: [
                {
                  tasks: [
                    {
                      tasks: [{}, {}, {}, {}],
                    },
                    {},
                    {},
                    {},
                    {},
                  ],
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
  })
  describe('as a KM', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTemplateOverview(template.id)
    })
    describe('when editing the name', () => {
      before(() => {
        cy.get('[data-test=template-options-button]').eq(1).click()
        cy.get('[data-test="rename-template"]').click()
        cy.get('[data-test=juralio-dialog]').should('be.visible')
        cy.wait(500)
        cy.get('[data-test=rename-field]').find('input').focus()
        cy.get('[data-test=rename-field]')
          .find('input')
          .clear({ force: true })
          .type('new name {enter}', { force: true })
        cy.wait(5000)
      })
      it('should save', () => {
        cy.get('[data-test=bread1]').should('contain.text', 'new name')
        cy.get('[data-test=bread1]').should('contain.text', 'new name')
      })
    })
  })
  describe('as a regular user', () => {
    before(() => {
      cy.login(user_2.username)
      appPage.visitTemplateOverview(template.id)
    })
    it('should not open the edit field', () => {
      cy.get('[data-test=template-options-button]').should('not.exist')
    })
  })
  describe('as a KM', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplateTaskDetails(template.id, template.tasks[0].id)
      cy.get('[data-test=read-field]', { timeout: 30000 }).click()
    })
    it('should open the edit field', () => {
      cy.get('[data-test=edit-field]').should('exist')
    })
    describe('when editing the name', () => {
      before(() => {
        cy.get('[data-test=edit-field]')
          .find('textarea')
          .eq(0)
          .type('new name {enter}')
        cy.wait(5000)
      })
      it('should save', () => {
        cy.get('[data-test=read-field]').should('contain.text', 'new name')
        cy.get('[data-test=bread1]').should('contain.text', 'new name')
      })
    })
  })
})
