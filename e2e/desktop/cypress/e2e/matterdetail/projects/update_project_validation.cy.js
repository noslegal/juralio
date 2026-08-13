import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createMultipleProjects,
  getProjects,
} from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import { wrapEditableTextField } from '../../../../../page/wrapper/editable-text-field-wrapper'

const visitHelpers = new VisitHelpers()

const getProjectField = projectId =>
  wrapEditableTextField(() => cy.get(`[data-test="project-${projectId}"]`))

describe('update_project_validation.cy', () => {
  let projectId
  before(() => {
    createUser().then(user =>
      createMatter().then(matter => {
        addTeamMember(matter.id, user.id)
        addMatterAdmin(matter.id, user.id)
        updateFTUE(user, { hasSeenMatterAdmin: true })
        cy.login(user.username)
          .then(() => {
            createMultipleProjects(matter.id)(3)
            visitHelpers.visitMatter(matter.id)
          })
          .then(() => {
            projectId = getProjects(0).id
          })
      })
    )
    cy.get('[data-test=projects]').click()
  })

  describe('when try to update a project name', () => {
    describe('with empty text', () => {
      before(() => {
        cy.get('[data-test=search-button]').click({ timeout: 30000 })
        cy.get('[data-test=Search]')
          .type(getProjects()[0].name)
        cy.get('[data-rowindex="0"] [data-colindex="0"]').click()

        cy.get('[data-test=text-field-with-edit-icon]').eq(0).click()
        cy.get('[data-test=text-field-with-edit-icon]')
          .eq(0)
          .find('input')
          .clear()
          .type('{enter}')
      })

      it('should display a validation message', () => {
        getProjectField(projectId)
          .validationMessage()
          .should('have.text', 'This field is required')
      })
    })

    describe('with a name which is duplicated', () => {
      before(() => {
        // cy.get('[data-test=search-button]').click({ timeout: 30000 })
        // cy.get('[data-test=Search]')
        //   .type(getProjects()[0].name)
        cy.backendRoute('PATCH', '/admin/matter/*/workstreams/*').as(
          'patchProject'
        )
        cy.get('[data-test=text-field-with-edit-icon]').eq(0).click()
        cy.get('[data-test=text-field-with-edit-icon]')
          .eq(0)
          .find('input')
          .clear()
          .type(getProjects()[1].name + '{enter}')

        // getProjectField(projectId).enterText(getProjects()[1].name + '{enter}')
        cy.wait('@patchProject')
      })

      it('should display a validation message', () => {
        getProjectField(projectId)
          .validationMessage()
          .should(
            'have.text',
            'Workstream name must be unique within the matter.'
          )
      })
    })

    describe('with a name which is longer than 30 characters', () => {
      before(() => {
        getProjectField(projectId).enterText(
          '098765432112345678900987654321ABC{enter}'
        )
      })

      it('should NOT contain additional characters', () => {
        cy.get('[data-test=text-field-with-edit-icon]')
          .eq(0)
          .should('not.contain', 'ABC')
        cy.get('[data-test=text-field-with-edit-icon]').click()
        cy.get('body').trigger('keydown', { keyCode: 27 })
        cy.wait(500)
        cy.get('body').trigger('keyup', { keyCode: 27 })
      })
    })
  })
})
