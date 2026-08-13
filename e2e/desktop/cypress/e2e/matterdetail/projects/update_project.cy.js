import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
  getMatters,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createMultipleProjects,
  getProjects,
} from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  getUsers,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'
import { wrapEditableTextField } from '../../../../../page/wrapper/editable-text-field-wrapper'

const visitHelpers = new VisitHelpers()

describe('update_project.cy', () => {
  let returnedUser
  before(() => {
    createUser().then(user =>
      createMatter().then(matter => {
        addTeamMember(matter.id, user.id)
        addMatterAdmin(matter.id, user.id)

        createUser().then(user => addTeamMember(matter.id, user.id))
        cy.login(user.username).then(() => {
          returnedUser = user
          updateFTUE(returnedUser, { hasSeenMatterAdmin: true })
          updateFTUE(user, { hasSeenMatterAdmin: true })
          createMultipleProjects(matter.id)(3)
          visitHelpers.visitMatter(matter.id)
        })
      })
    )
    cy.get('[data-test=projects]', { timeout: 30000 }).should('be.visible')
    cy.wait(1000)
    cy.get('[data-test=projects]').click()
    cy.get('[data-test=workstream-item-reference-number]', {
      timeout: 20000,
    }).should('have.length', 3)
  })

  const getProjectField = projectId =>
    wrapEditableTextField(() => cy.get(`[data-test="project-${projectId}"]`))

  describe('given admin and member (edit) access', () => {
    before(() => {
      cy.login(returnedUser.username)
    })
    describe('on receiving user input', () => {
      const appendedNameText = ' ABC'
      let project, updatedProjectName

      before(() => {
        ;[project] = getProjects()
        updatedProjectName = project.name + appendedNameText
        cy.get('[data-test=edit-icon]').eq(1).click()
        cy.get(`[data-test="project-${project.id}"]`)
          .click()
          .type(updatedProjectName + '{enter}')
      })

      it('should change state on form', () => {
        getProjectField(project.id)
          .readOnlyText()
          .should('have.text', updatedProjectName)
        cy.get('[data-test=workstream-item-reference-number]').should(
          'have.length',
          3
        )
      })

      describe('verify change has been persisted', () => {
        before(() => {
          cy.login(returnedUser.username)
          cy.reload()
          cy.get('[data-test=projects]').click()
        })

        it('should persist changes', () => {
          getProjectField(project.id)
            .readOnlyText()
            .should('have.text', updatedProjectName)
        })
      })
    })
  })

  describe('given member (non-edit) access', () => {
    before(() => {
      cy.login(getUsers()[1].username).then(() => {
        visitHelpers.visitMatter(getMatters()[0].id)
      })
    })

    it('the user should not be able to access the page', () => {
      cy.url().should('contains', '404')
    })
  })
})
