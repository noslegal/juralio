import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

const checkMatterCreatedDialogShown = () => {
  it('should show the Matter Created dialog', () => {
    cy.get('[data-test=dialog-content]', { timeout: 30000 }).should('exist')
    cy.get('[data-test=invite-people-button]', { timeout: 30000 }).should(
      'exist'
    )
    cy.get('[data-test=dialog-content] [data-test=add-task-button]').should(
      'exist'
    )
  })
}

const goHome = () => {
  cy.visit('/#/home')
  cy.login('matter.creator@juralio.com')
  cy.reload()
}
const selectAdvisorPosition = () => {
  cy.get('[data-test=position-select]').click()
  cy.get('[data-test=position-option-advisor]').click()
}

describe('matter_create_button.cy', () => {
  let user, fixture, appPage, matter
  const visitHelpers = new VisitHelpers()
  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'template_for_create_matter',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Puppet on a string' }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        cy.login(user.username)
        createTemplate('First template', fixture.projects[0].id)
          .then(createdTemplate => {
            template = createdTemplate
            visitHelpers.visitTemplateTaskDetails(
              template.id,
              template.tasks[0].id
            )
          })
          .then(() => {
            publishTemplate(template.id)
          })
      })
  })

  describe('when logged in as a matter creator', () => {
    before(() => {
      goHome()
      cy.get('[data-test=matter-switcher-button]', { timeout: 30000 }).click()
      cy.wait(3000)
      cy.get('[data-test=create-new-item-card]').click()
      cy.wait(3000)
    })

    describe('When creating the matter with a blank project', () => {
      before(() => {
        cy.get('[data-test=blank-workstream]').click()
        selectAdvisorPosition()
        cy.get('[data-test=client-name]').find('input').type('clientName')
        cy.get('[data-test=name]').find('input').type('matterName')
        cy.get('[data-test=reference-number]')
          .find('input')
          .type('referenceNumber')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(1000)
      })

      checkMatterCreatedDialogShown()
    })

    // describe('when using the template filter', () => {
    //   before(() => {
    //     goHome()
    //     cy.get('[data-test=create-new-item-card]').click()
    //     cy.wait(3000)
    //     cy.get('[data-test=create-workstream-from-template]').click()
    //     cy.get('[data-test=search-filter]')
    //       .find('input')
    //       .type(template.name)
    //   })
    //   it('should filter the templates', () => {
    //     cy.get('[data-test=template]').should('have.length', 2)
    //   })
    // })

    describe('when creating the matter with a project created from a template', () => {
      before(() => {
        goHome()
        cy.get('[data-test=matter-switcher-button]', { timeout: 30000 }).click()
        cy.wait(3000)
        cy.get('[data-test=create-new-item-card]').click()
        cy.wait(3000)
        cy.get('[data-test=create-workstream-from-template]').click()
        cy.get('[data-test=juralio-dialog]')
          .find('[data-test=template]')
          .eq(0)
          .click()
        cy.get('[data-test=action-dialog-button]').click()
        selectAdvisorPosition()
        cy.get('[data-test=client-name]').find('input').type('clientName')
        cy.get('[data-test=name]').find('input').type('matterName')
        cy.get('[data-test=reference-number]')
          .find('input')
          .type('referenceNumber')
        cy.get('[data-test=action-dialog-button]').click()
      })

      checkMatterCreatedDialogShown()
    })
  })

  describe('When enter key is used, a matter can be created', () => {
    const randomNumber = new Date().toISOString()
    const clientName = 'test' + randomNumber
    const matterName = 'test' + randomNumber

    before(() => {
      goHome()
      cy.get('[data-test=matter-switcher-button]', { timeout: 30000 }).click()
      cy.wait(3000)
      cy.get('[data-test=create-new-item-card]').click()
      cy.wait(3000)
      cy.get('[data-test=blank-workstream]').click()
      selectAdvisorPosition()
      cy.get('[data-test=client-name]').find('input').type(clientName)
      cy.get('[data-test=name]').find('input').type(matterName)
      cy.get('[data-test=reference-number]')
        .find('input')
        .type('referenceNumber')
      cy.get('[data-test=action-dialog-button]').click()
    })
    checkMatterCreatedDialogShown()
  })
})
