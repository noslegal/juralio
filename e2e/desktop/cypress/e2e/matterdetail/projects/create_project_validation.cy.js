import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

describe('create_project_validation.cy', () => {
  let fixture
  let standardUser

  const longProjectName = '098765432109876543210987654321'

  const visitHelpers = new VisitHelpers()

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        standardUser = createdUser
        const seed = {
          matter: {
            prefix: 'taskCardTest',
            teamMembers: [standardUser],
            matterAdmins: [standardUser],
            projects: [
              {
                name: 'Task Note Spec',
                tasks: [{ name: 'Task 1' }, { name: 'Task 2' }],
              },
              {
                name: 'T',
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        getWrapper(fixture)
      })
      .then(() => {
        cy.login(standardUser.username)
        createTemplate('newTemplateName', fixture.projects[0].id).then(
          createdTemplate => {
            publishTemplate(createdTemplate.id)
          }
        )
      })
  })

  describe('when trying to create a project from blank', () => {
    before(() => {
      updateFTUE(standardUser, { hasSeenMatterAdmin: true })
      cy.login(standardUser.username)
      visitHelpers.visitMatter(fixture.matter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
    })

    it('should allow the user the option to split original workstream', () => {
      cy.get('[data-test=split-workstream]').should(
        'have.text',
        'Create workstream from existing tasks'
      )
    })

    it('should allow the user the option to create blank workstream', () => {
      cy.get('[data-test=blank-workstream]').should(
        'have.text',
        'Create a blank workstream'
      )
    })

    it('should allow the user the option to create workstream from template', () => {
      cy.get('[data-test=create-workstream-from-template]').should(
        'have.text',
        'Create workstream from template'
      )
    })

    describe(' - without a name', () => {
      before(() => {
        cy.get('[data-test=blank-workstream]').click()
        cy.get('[data-test=workstream-name]')
          .find('input')
          .type('H')
          .clear()
          .type('{enter}')
      })

      it('should allow for a project to be created', () => {
        cy.get('[data-test=juralio-dialog]').should('exist')
      })
    })

    describe('when trying to create a project which exists', () => {
      before(() => {
        cy.get('[data-test=workstream-name]')
          .find('input')
          .type(longProjectName)
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test="create-new-workstream"]').click()
        cy.get('[data-test=blank-workstream]').click()
        cy.get('[data-test=workstream-name]')
          .find('input')
          .clear()
          .type(longProjectName)
          .type('{enter}')
      })

      it('should display validation message', () => {
        cy.get('p').should(
          'contain.text',
          'Workstream name must be unique within the matter.'
        )
      })
    })
  })
})
