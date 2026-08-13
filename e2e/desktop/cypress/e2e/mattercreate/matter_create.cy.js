import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

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

const openFabAndClickCreateMatter = () => {
  cy.get('[data-test=fab-button]').click()
  cy.wait(3000)
  cy.get('[data-test=create-matter-button]', { timeout: 30000 }).click()
  cy.wait(3000)
}

// The details flow now has a group-position dropdown (groups-positions work).
// matter.creator's group defaults to Client, which disables the client-name
// field — switch to Advisor so the client name can be entered.
const selectAdvisorPosition = () => {
  cy.get('[data-test=position-select]').click()
  cy.get('[data-test=position-option-advisor]').click()
}

describe('matter_create.cy', () => {
  let user, fixture, template

  before(() => {
    // matter.creator drives the create flow from /home. Mark the home FTUE as
    // seen so the "Welcome to Juralio" wizard never mounts mid-interaction and
    // detaches the FAB menu (which makes create-matter-button clicks flaky).
    updateFTUE({ username: 'matter.creator@juralio.com' }, { hasSeenHomePage: true })
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

  const randomNumber = new Date().toISOString()
  const clientName = 'test' + randomNumber
  const matterName = 'test' + randomNumber
  const matterReferenceNumber = 'MRN ' + randomNumber

  describe('when logged in as a matter creator', () => {
    before(() => {
      goHome()
      openFabAndClickCreateMatter()
    })

    describe('When creating the matter with a blank project', () => {
      before(() => {
        cy.get('[data-test=blank-workstream]').click()
        selectAdvisorPosition()
        cy.get('[data-test=client-name]').find('input').type(clientName)
        cy.get('[data-test=name]').find('input').type(matterName)
        cy.get('[data-test=reference-number]')
          .find('input')
          .type(matterReferenceNumber)
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait(1000)
      })

      checkMatterCreatedDialogShown()
    })

    describe('when creating the matter with a project created from a template', () => {
      before(() => {
        goHome()
        openFabAndClickCreateMatter()
        cy.get('[data-test=create-workstream-from-template]').click()
        cy.get('[data-test=juralio-dialog]')
          .find('[data-test=template]')
          .eq(0)
          .click()
        cy.get('[data-test=action-dialog-button]').click()
        selectAdvisorPosition()
        cy.get('[data-test=client-name]').find('input').type(clientName)
        cy.get('[data-test=name]').find('input').type(matterName)
        cy.get('[data-test=reference-number]')
          .find('input')
          .type(matterReferenceNumber)
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
      openFabAndClickCreateMatter()
      cy.get('[data-test=blank-workstream]').click()
      selectAdvisorPosition()
      cy.get('[data-test=client-name]').find('input').type(clientName)
      cy.get('[data-test=name]').find('input').type(matterName)
      cy.get('[data-test=reference-number]')
        .find('input')
        .type(matterReferenceNumber)
      cy.get('[data-test=action-dialog-button]').click()
    })
    checkMatterCreatedDialogShown()

    describe('When on the matter membership section', () => {
      before(() => {
        cy.get('[data-test=invite-people-button]', { timeout: 30000 }).click()
        // The invite flow may auto-open the add-people dialog, but its
        // appearance is racy (a remount on team/placeholder load can close it).
        // Wait for the People page, then dismiss the dialog only if it's open.
        cy.get('[data-test=matter-content]', { timeout: 30000 }).should('exist')
        cy.get('body').then($body => {
          if ($body.find('[data-test="cancel-dialog-button"]:visible').length) {
            cy.get('[data-test="cancel-dialog-button"]').click()
          }
        })
      })
      it('should have the creator user be set as a team member', () => {
        // The creator is a matter admin → access level "View + Edit + Admin"
        // (formerly "Full access").
        cy.get('[data-test=matter-content]').should(
          'contain',
          'View + Edit + Admin'
        )
      })
    })
  })
})
